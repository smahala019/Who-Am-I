const dns = require('dns');
// Force IPv4 — fixes IPv6 timeout on networks that block it
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: '*', methods: ['POST', 'GET'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use('/api/contact', limiter);

function clean(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>]/g, '').trim().slice(0, 2000);
}

// Create transporter with forced IPv4 lookup
function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    // Force DNS to only return IPv4 addresses
    lookup(hostname, options, callback) {
      dns.resolve4(hostname, (err, addresses) => {
        if (err) return callback(err);
        callback(null, addresses[0], 4);
      });
    },
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
  });
}

// ─── TEST SMTP ─────────────────────────────────────
app.get('/api/test-smtp', async (req, res) => {
  try {
    const missing = [];
    if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
    if (!process.env.SMTP_PORT) missing.push('SMTP_PORT');
    if (!process.env.SMTP_USER) missing.push('SMTP_USER');
    if (!process.env.SMTP_PASSWORD) missing.push('SMTP_PASSWORD');
    if (!process.env.CONTACT_EMAIL) missing.push('CONTACT_EMAIL');
    if (missing.length > 0) {
      return res.json({ success: false, error: `Missing in .env: ${missing.join(', ')}` });
    }

    const transporter = makeTransporter();
    await transporter.verify();

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      subject: 'Test — Portfolio SMTP Working',
      text: 'Your SMTP setup is working! The contact form will work too.'
    });

    res.json({ success: true, message: 'Test email sent! Check your inbox.', id: info.messageId });

  } catch (err) {
    console.error('TEST ERROR:', err.code, err.message);
    let hint = err.message;
    if (err.code === 'EAUTH') hint = 'AUTH FAILED — Use an App Password, not your regular password.';
    if (err.code === 'ECONNECTION') hint = 'Cannot connect to ' + process.env.SMTP_HOST + '. Check host/port.';
    if (err.code === 'ETIMEDOUT') hint = 'Timed out. Your network may be blocking port ' + process.env.SMTP_PORT + '.';
    if (err.code === 'EDNS') hint = 'DNS failed. Is SMTP_HOST correct?';
    res.status(500).json({ success: false, error: hint, code: err.code });
  }
});

// ─── CONTACT FORM ──────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const phone = clean(req.body.phone);
    const subject = clean(req.body.subject);
    const message = clean(req.body.message);

    if (!name || name.length < 2) return res.status(400).json({ success: false, error: 'Name is required.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ success: false, error: 'Valid email is required.' });
    if (!subject || subject.length < 3) return res.status(400).json({ success: false, error: 'Subject is required.' });
    if (!message || message.length < 10) return res.status(400).json({ success: false, error: 'Message is required (min 10 chars).' });

    const transporter = makeTransporter();
    await transporter.verify();

    await transporter.sendMail({
      from: `"Portfolio" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Contact: ${subject}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || 'N/A'}`, `Subject: ${subject}`, '', '---', message, '---'].join('\n')
    });

    res.json({ success: true, message: 'Message sent!' });

  } catch (err) {
    console.error('FORM ERROR:', err.code, err.message);
    let hint = 'Unexpected error. Check server terminal.';
    if (err.code === 'EAUTH') hint = 'SMTP auth failed. Use an App Password.';
    if (err.code === 'ECONNECTION') hint = 'Cannot reach SMTP server.';
    if (err.code === 'ETIMEDOUT') hint = 'Timed out. Network may block port ' + process.env.SMTP_PORT + '.';
    res.status(500).json({ success: false, error: hint });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log(`  Server: http://localhost:${PORT}`);
  console.log(`  Test:   http://localhost:${PORT}/api/test-smtp`);
  console.log('');
});