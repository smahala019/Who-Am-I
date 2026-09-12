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

// ─── STATIC ASSETS & MIDDLEWARE ─────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/image', express.static(path.join(__dirname, 'image')));

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or when wildcard is active
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10kb' }));

// ─── RATE LIMITING (5 requests per 15 mins) ─────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many messages sent from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api/contact', limiter);

// ─── SANITIZE HELPER ────────────────────────────────
function clean(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>]/g, '').trim().slice(0, 2000);
}

// ─── CHECK MISSING ENV VARS ─────────────────────────
function getMissingSmtpVars() {
  const missing = [];
  if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
  if (!process.env.SMTP_PORT) missing.push('SMTP_PORT');
  if (!process.env.SMTP_USER) missing.push('SMTP_USER');
  if (!process.env.SMTP_PASSWORD) missing.push('SMTP_PASSWORD');
  if (!process.env.CONTACT_EMAIL) missing.push('CONTACT_EMAIL');
  return missing;
}

// ─── NODEMAILER TRANSPORTER (Forced IPv4) ───────────
function makeTransporter() {
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465,
    // Custom DNS lookup to force IPv4 and support both domain names and IP literals
    lookup(hostname, options, callback) {
      const cb = typeof options === 'function' ? options : callback;
      const opts = typeof options === 'object' && options !== null ? options : {};
      dns.lookup(hostname, { ...opts, family: 4 }, (err, address, family) => {
        if (err) {
          // Fallback to resolve4 for domain names if lookup fails
          return dns.resolve4(hostname, (err2, addresses) => {
            if (err2 || !addresses || !addresses.length) return cb(err);
            cb(null, addresses[0], 4);
          });
        }
        cb(null, address, family || 4);
      });
    },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

// ─── TEST SMTP ENDPOINT ─────────────────────────────
app.get('/api/test-smtp', async (req, res) => {
  try {
    const missing = getMissingSmtpVars();
    if (missing.length > 0) {
      return res.status(503).json({
        success: false,
        error: `Missing in .env: ${missing.join(', ')}`
      });
    }

    const transporter = makeTransporter();
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Portfolio Test" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: 'Test — Portfolio SMTP Working',
      text: 'Your SMTP setup is working properly! Contact form submissions will be delivered to this inbox.'
    });

    res.json({
      success: true,
      message: 'Test email sent! Check your inbox.',
      id: info.messageId
    });

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

// ─── CONTACT FORM ENDPOINT ──────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const phone = clean(req.body.phone);
    const subject = clean(req.body.subject);
    const message = clean(req.body.message);

    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: 'Name is required (min 2 characters).' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }
    if (!subject || subject.length < 3) {
      return res.status(400).json({ success: false, error: 'Subject is required (min 3 characters).' });
    }
    if (!message || message.length < 10) {
      return res.status(400).json({ success: false, error: 'Message is required (min 10 characters).' });
    }

    // Verify SMTP variables are configured before attempting connection
    const missing = getMissingSmtpVars();
    if (missing.length > 0) {
      return res.status(503).json({
        success: false,
        error: `Email service is not configured yet. Missing: ${missing.join(', ')}`
      });
    }

    const transporter = makeTransporter();
    await transporter.verify();

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || 'N/A'}`,
        `Subject: ${subject}`,
        '',
        '--- Message ---',
        message,
        '---------------'
      ].join('\n')
    });

    res.json({ success: true, message: 'Message sent!' });

  } catch (err) {
    console.error('FORM ERROR:', err.code, err.message);
    let hint = 'Unexpected error. Check server terminal.';
    if (err.code === 'EAUTH') hint = 'SMTP auth failed. Use a valid App Password.';
    if (err.code === 'ECONNECTION') hint = 'Cannot reach SMTP server. Verify host and port.';
    if (err.code === 'ETIMEDOUT') hint = 'Connection timed out. Network may block port ' + process.env.SMTP_PORT + '.';
    res.status(500).json({ success: false, error: hint });
  }
});

// ─── HEALTH CHECK ───────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ─── 404 HANDLER FOR UNKNOWN API ROUTES ─────────────
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// ─── SERVE FRONTEND (SPA FALLBACK) ──────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START SERVER ───────────────────────────────────
const server = app.listen(PORT, () => {
  console.log('');
  console.log(`  Portfolio Server running at: http://localhost:${PORT}`);
  console.log(`  SMTP Test Endpoint:          http://localhost:${PORT}/api/test-smtp`);
  console.log(`  Health Check:                http://localhost:${PORT}/api/health`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => console.log('HTTP server closed.'));
});
process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server...');
  server.close(() => console.log('HTTP server closed.'));
});