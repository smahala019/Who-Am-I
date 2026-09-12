/* ===== Global scope declarations ===== */
var cardCarousels=[];

var CV_PATH='resume1.pdf';
var CV_FILENAME='resume1.pdf';

/* ===== Theme color helper — reads from live CSS variables ===== */
function getAccentRGB(){
  try{
    var style=getComputedStyle(document.documentElement);
    var ac=style.getPropertyValue('--ac').trim();
    if(ac&&ac.startsWith('#')&&ac.length>=7){
      return{r:parseInt(ac.slice(1,3),16),g:parseInt(ac.slice(3,5),16),b:parseInt(ac.slice(5,7),16)};
    }
  }catch(e){}
  var t=document.documentElement.getAttribute('data-theme');
  if(t==='dark')return{r:212,g:154,b:106};
  return{r:139,g:58,b:58};
}

/* ===== Hex / Color utility functions for custom theme ===== */
function hexToRgb(hex){
  hex=hex.replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return{r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16)};
}
function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255;
  var max=Math.max(r,g,b),min=Math.min(r,g,b),h,s,l=(max+min)/2;
  if(max===min){h=s=0}else{
    var d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
    if(max===r)h=((g-b)/d+(g<b?6:0))/6;
    else if(max===g)h=((b-r)/d+2)/6;
    else h=((r-g)/d+4)/6;
  }
  return{h:h*360,s:s*100,l:l*100};
}
function hslToHex(h,s,l){
  h/=360;s/=100;l/=100;
  var r,g,b;
  if(s===0){r=g=b=l}else{
    function hue2rgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p}
    var q2=l<0.5?l*(1+s):l+s-l*s,p2=2*l-q2;
    r=hue2rgb(p2,q2,h+1/3);g=hue2rgb(p2,q2,h);b=hue2rgb(p2,q2,h-1/3);
  }
  function toHex(x){var hex=Math.round(x*255).toString(16);return hex.length===1?'0'+hex:hex}
  return'#'+toHex(r)+toHex(g)+toHex(b);
}
function adjustColor(hex,lightenAmt){
  var rgb=hexToRgb(hex);var hsl=rgbToHsl(rgb.r,rgb.g,rgb.b);
  hsl.l=Math.max(0,Math.min(100,hsl.l+lightenAmt));
  return hslToHex(hsl.h,hsl.s,hsl.l);
}

/* ===== THEME PRESETS ===== */
var themePresets={
  ocean:{bg:'#0a192f',bgAlt:'#0f2744',surface:'#112240',surfaceH:'#1a3358',tx:'#ccd6f6',tx2:'#8892b0',txm:'#5a6580',ac:'#64ffda',acH:'#7dffd6',acL:'#a8ffe6',hl:'#4fc3f7',bd:'#1e3a5f',bd2:'#2a4a6f',tagBg:'rgba(100,255,218,.08)',tagTx:'#64ffda',tl:'#4fc3f7',ovColor:'#000000',ovOpacity:72,hdrBgColor:'#0a192f',hdrBgOpacity:90,shadowIntensity:40},
  sunset:{bg:'#1a0a2e',bgAlt:'#241040',surface:'#2d1650',surfaceH:'#381e62',tx:'#f0e6ff',tx2:'#c4aad8',txm:'#8a6da8',ac:'#ff6b6b',acH:'#ff8585',acL:'#ffa0a0',hl:'#feca57',bd:'#3d2068',bd2:'#4e2a80',tagBg:'rgba(255,107,107,.08)',tagTx:'#ff6b6b',tl:'#feca57',ovColor:'#0a0014',ovOpacity:72,hdrBgColor:'#1a0a2e',hdrBgOpacity:90,shadowIntensity:40},
  forest:{bg:'#0a1f0a',bgAlt:'#0f2d0f',surface:'#143d14',surfaceH:'#1a4d1a',tx:'#e0f0e0',tx2:'#a0c8a0',txm:'#6a9a6a',ac:'#4ade80',acH:'#6ae89a',acL:'#8ff0aa',hl:'#fbbf24',bd:'#1e501e',bd2:'#286828',tagBg:'rgba(74,222,128,.08)',tagTx:'#4ade80',tl:'#fbbf24',ovColor:'#001a00',ovOpacity:72,hdrBgColor:'#0a1f0a',hdrBgOpacity:90,shadowIntensity:40},
  rose:{bg:'#1a0a14',bgAlt:'#24101c',surface:'#2d1630',surfaceH:'#381e3c',tx:'#f8e8f0',tx2:'#d0a8c0',txm:'#9878a0',ac:'#f472b6',acH:'#f68dbf',acL:'#f9a8d0',hl:'#c084fc',bd:'#4a1e42',bd2:'#5e2854',tagBg:'rgba(244,114,182,.08)',tagTx:'#f472b6',tl:'#c084fc',ovColor:'#0a000a',ovOpacity:72,hdrBgColor:'#1a0a14',hdrBgOpacity:90,shadowIntensity:40},
  midnight:{bg:'#0f0f1a',bgAlt:'#161628',surface:'#1e1e36',surfaceH:'#282848',tx:'#e0e0f0',tx2:'#a0a0c0',txm:'#6868a0',ac:'#818cf8',acH:'#9ba6fa',acL:'#b4bdfc',hl:'#f0abfc',bd:'#2a2a50',bd2:'#363668',tagBg:'rgba(129,140,248,.08)',tagTx:'#818cf8',tl:'#f0abfc',ovColor:'#050510',ovOpacity:72,hdrBgColor:'#0f0f1a',hdrBgOpacity:90,shadowIntensity:40},
  ember:{bg:'#1a0f05',bgAlt:'#241608',surface:'#2d1e0e',surfaceH:'#382814',tx:'#f8f0e0',tx2:'#d0b888',txm:'#a08858',ac:'#f59e0b',acH:'#f7b32b',acL:'#f9c84a',hl:'#fb923c',bd:'#4a3018',bd2:'#5e3e22',tagBg:'rgba(245,158,11,.08)',tagTx:'#f59e0b',tl:'#fb923c',ovColor:'#0a0800',ovOpacity:72,hdrBgColor:'#1a0f05',hdrBgOpacity:90,shadowIntensity:40}
};

/* ===== PROJECT DATA ===== */
var projects=[
  {
    title:"Mahala VS Code",
    short:"Web IDE & Android Application with multi-language execution, AI integration, and offline-first storage.",
    images:[
      "image/vs code/Screenshot 2026-09-12 084526.png",
      "image/vs code/Screenshot 2026-09-12 084648.png",
      "image/vs code/Screenshot 2026-09-12 084246.png",
      "image/vs code/Screenshot 2026-09-12 085108.png",
      "image/vs code/Screenshot 2026-09-12 084325.png",
      "image/vs code/Screenshot 2026-09-12 084345.png"
    ],
    full:"A cross-platform IDE enabling browser-based and Android code editing with a virtual file system, multi-language execution, live preview, terminal support, and AI integration. Designed for offline-first usage with IndexedDB-based storage.",
    features:[
      "Browser-based and Android code editing via single codebase",
      "Virtual file system with IndexedDB for offline storage",
      "Multi-language execution: JavaScript, Python, C/C++, SQL",
      "Live preview for HTML/CSS/JS with real-time rendering",
      "Integrated terminal emulator for command-line operations",
      "AI-powered code assistance and suggestions",
      "JSZip-based project export/import functionality",
      "SQLite (sql.js) for in-browser SQL execution"
    ],
    tags:["HTML5","CSS3","JavaScript ES6","Monaco Editor","IndexedDB","SQLite (sql.js)","JSZip"],
    demo:"#",
    github:"https://github.com/smahala019"
  },
  {
    title:"Campus Placement Predictor",
    short:"ML application predicting campus placements based on multiple academic parameters.",
    images:[
      "image/campus/dashboard.jpg",
      "image/campus/analytics.jpg"
    ],
    full:"Designed and deployed a machine learning application to predict campus placements of students based on multiple academic parameters including CGPA, aptitude scores, internship experience, and more.",
    features:[
      "Trained ML model using student academic and co-curricular data",
      "Flask REST API for real-time prediction endpoints",
      "Interactive web interface for inputting student parameters",
      "Data preprocessing and feature engineering pipeline",
      "Model evaluation with accuracy, precision, recall metrics",
      "Responsive UI for easy access on any device"
    ],
    tags:["Python","Machine Learning","Flask","HTML5","CSS","Scikit-Learn","Pandas"],
    demo:"#",
    github:"https://github.com/smahala019"
  },
  {
    title:"Ambition Box — Job Finder",
    short:"Data science application helping job seekers find roles by salary, location, and role.",
    images:[
      "image/ambition/Screenshot 2026-09-12 085507.png",
      "image/ambition/Screenshot 2026-09-12 085516.png",
      "image/ambition/Screenshot 2026-09-12 085536.png",
      "image/ambition/Screenshot 2026-09-12 085629.png",
      "image/ambition/Screenshot 2026-09-12 085640.png",
      "image/ambition/Screenshot 2026-09-12 085659.png"
    ],
    full:"Designed an application for job seekers to find jobs according to their role, salary expectations, and preferred location. Involves data scraping, cleaning, analysis, and an interactive search interface.",
    features:[
      "Job data aggregation and cleaning pipeline",
      "Filter by job role, salary range, and location",
      "Data visualization for salary trends and market insights",
      "Search and sort functionality for quick results",
      "Clean, intuitive UI for non-technical users"
    ],
    tags:["Python","Data Analysis","Pandas","HTML5","CSS","Matplotlib"],
    demo:"#",
    github:"https://github.com/smahala019"
  },
  {
    title: "Food Delivery Service",
    short: "Responsive food delivery landing page with simulated authentication and LocalStorage-powered cart functionality.",
    images: [
      "image/food/Screenshot 2026-09-12 091418.png",
      "image/food/Screenshot 2026-09-12 091431.png",
      "image/food/Screenshot 2026-09-12 091454.png",
      "image/food/Screenshot 2026-09-12 091523.png",
      "image/food/Screenshot 2026-09-12 091658.png",
      "image/food/Screenshot 2026-09-12 091533.png"
    ],
    full: "A responsive, front-end food delivery landing page for Mahala Company. Users can browse food categories, explore featured restaurants, and understand the delivery process — all with a simulated authentication system and shopping cart functionality powered by browser LocalStorage. Built with a strong focus on UI/UX design, responsive layout, and client-side interactivity without requiring a backend server.",
    features: [
      "Responsive hero section with location-based search",
      "Interactive food category grid (Pizza, Burger, Sushi, etc.) with page redirects",
      "Featured restaurant cards with ratings, cuisine type, and delivery times",
      "Simulated login/signup with profile display and logout state management",
      "Dynamic shopping cart counter stored in LocalStorage",
      "Auto-prompt security timer for unauthenticated users after 1 minute of inactivity",
      "Custom toast notification system for success/error feedback",
      "Fully responsive mobile navigation with hamburger menu"
    ],
    tags: ["HTML5", "CSS3", "JavaScript (ES6+)", "FontAwesome 6.4.0", "LocalStorage API"],
    demo: "#",
    github: "https://github.com/smahala019"
  },
  {
    title:"Transport Management System",
    short:"Web app managing vehicle records with real-time appointment and prescription updates.",
    images:[
      "image/transport/Screenshot 2026-09-12 083839.png",
      "image/transport/Screenshot 2026-09-12 084106.png",
      "image/transport/Screenshot 2026-09-12 083941.png",
      "image/transport/Screenshot 2026-09-12 083959.png",
      "image/transport/Screenshot 2026-09-12 084028.png",
      "image/transport/Screenshot 2026-09-12 084132.png"
    ],
    full:"A web application to manage vehicle records with real-time appointment and prescription updates. Built as a team project for Prayogam-2025 at Poornima University.",
    features:[
      "CRUD operations for vehicle records",
      "Real-time appointment scheduling and tracking",
      "Prescription and service history management",
      "Search and filter across all vehicle data fields",
      "Responsive dashboard with summary statistics",
      "MySQL database with optimized queries for performance"
    ],
    tags:["HTML","CSS","JavaScript","MySQL","PHP"],
    demo:"#",
    github:"https://github.com/smahala019"
  }
];

/* ===== CERTIFICATE DATA ===== */
var certs=[
  {
    name:"Oracle Cloud Infrastructure 2025 Generative AI Professional",
    issuer:"Oracle University",
    icon:"bx-cloud",
    img:"image/certificate/oracle.png",
    link:"image/certificate/oracle.png",
    desc:"Professional certification demonstrating proficiency in Oracle Cloud Infrastructure's Generative AI services, including building, deploying, and managing AI models on OCI platforms."
  },
  {
    name:"Building AI Agents with MongoDB",
    issuer:"MongoDB",
    icon:"bx-bot",
    img:"image/certificate/mongodb.png",
    link:"image/certificate/mongodb.pdf",
    desc:"Hands-on certification covering the creation of intelligent AI agents using MongoDB's vector search, Atlas, and Agentic frameworks for real-world applications."
  },
  {
    name:"Google Cloud Career Launchpad — Cloud Engineer Track",
    issuer:"Google",
    icon:"bx-data",
    img:"image/certificate/google.png",
    link:"image/certificate/google.pdf",
    desc:"Comprehensive cloud engineering program covering GCP fundamentals, compute, storage, networking, and cloud architecture best practices."
  },
  {
    name:"Ethics in Engineering Practice",
    issuer:"IIT Kharagpur — NPTEL",
    icon:"bx-shield",
    img:"image/certificate/ethics.png",
    link:"image/certificate/ethics.png",
    desc:"NPTEL certification from IIT Kharagpur covering professional ethics, engineering responsibility, sustainability, and ethical decision-making in technology."
  },
  {
    name:"Environmental Planning and Management",
    issuer:"IIT Roorkee — NPTEL",
    icon:"bx-globe",
    img:"image/certificate/environment.png",
    link:"image/certificate/environment.pdf",
    desc:"NPTEL certification from IIT Roorkee covering environmental impact assessment, planning strategies, and sustainable management practices."
  },
  {
    name:"UI/UX with Graphic Design",
    issuer:"Grass Pvt. Ltd.",
    icon:"bx-palette",
    img:"image/certificate/uiux.png",
    link:"image/certificate/Sachin  UI UX Certificate.pdf",
    desc:"Professional certification covering user interface design principles, user experience research, wireframing, prototyping, and graphic design fundamentals."
  }
];

/* ===== Dynamic milestones ===== */
function updateMilestones(){
  var certEl=document.getElementById('milestoneCerts');
  var projEl=document.getElementById('milestoneProjs');
  var certDescEl=document.getElementById('milestoneCertsDesc');
  if(certEl){certEl.dataset.target=certs.length}
  if(projEl){projEl.dataset.target=projects.length}
  if(certDescEl){
    var names=certs.slice(0,2).map(function(c){return c.issuer.split('—')[0].trim().split(' ')[0]}).join(', ');
    certDescEl.textContent=names+(certs.length>2?' & more...':'');
  }
}
updateMilestones();

/* ===== IMAGE ASPECT / FIT HELPER ===== */
function fitCheck(img){
  if(!img)return;
  function evaluate(){
    if(!img.naturalWidth||!img.naturalHeight)return;
    var r=img.naturalWidth/img.naturalHeight;
    if(r<0.95||r>2.8){
      img.classList.add('fit-contain');
    }
  }
  if(img.complete&&img.naturalWidth>0){evaluate()}else{img.addEventListener('load',evaluate)}
}

/* ===== RENDER PROJECT CARDS ===== */
var projGrid=document.getElementById('projGrid');
function renderProjects(){
  projGrid.innerHTML='';
  projects.forEach(function(p,i){
    var card=document.createElement('div');
    card.className='proj-card';
    card.dataset.idx=i;
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label','View details of '+p.title);
    card.title='Click to view '+p.title+' details';
    var slidesHtml=p.images.map(function(img){
      return '<div class="proj-carousel__slide"><img src="'+img+'" alt="'+p.title+' screenshot" loading="lazy" onload="fitCheck(this)"></div>';
    }).join('');
    var dotsHtml=p.images.map(function(_,j){
      return '<button class="proj-carousel__dot'+(j===0?' active':'')+'" data-j="'+j+'" aria-label="Slide '+(j+1)+' of '+p.images.length+'"></button>';
    }).join('');
    card.innerHTML=
      '<div class="proj-carousel" data-ci="'+i+'">'+
        '<div class="proj-carousel__track">'+slidesHtml+'</div>'+
        '<div class="proj-carousel__dots">'+dotsHtml+'</div>'+
      '</div>'+
      '<div class="proj-card__body">'+
        '<h3 class="proj-card__title">'+p.title+'</h3>'+
        '<p class="proj-card__desc">'+p.short+'</p>'+
        '<div class="proj-card__tags">'+p.tags.slice(0,4).map(function(t){return'<span class="proj-card__tag">'+t+'</span>'}).join('')+(p.tags.length>4?'<span class="proj-card__tag">+'+(p.tags.length-4)+'</span>':'')+'</div>'+
      '</div>';
    projGrid.appendChild(card);
  });
  projGrid.querySelectorAll('.proj-carousel__slide img').forEach(fitCheck);
  initCardCarousels();
  startProjRotation();
}
renderProjects();

/* ===== PROJECT CARD CAROUSELS ===== */
function initCardCarousels(){
  cardCarousels=[];
  document.querySelectorAll('.proj-carousel').forEach(function(c){
    var track=c.querySelector('.proj-carousel__track');
    var dots=c.querySelectorAll('.proj-carousel__dot');
    var total=dots.length;
    var cur=0,iv;
    function go(idx){cur=((idx%total)+total)%total;track.style.transform='translateX(-'+cur*100+'%)';dots.forEach(function(d,j){d.classList.toggle('active',j===cur)})}
    function start(){iv=setInterval(function(){go(cur+1)},3000)}
    function stop(){clearInterval(iv)}
    start();
    c.addEventListener('mouseenter',stop);
    c.addEventListener('mouseleave',start);
    dots.forEach(function(d){d.addEventListener('click',function(){stop();go(+d.dataset.j);start()})});
    var tx=0;
    c.addEventListener('touchstart',function(e){tx=e.changedTouches[0].screenX;stop()},{passive:true});
    c.addEventListener('touchend',function(e){var diff=tx-e.changedTouches[0].screenX;if(Math.abs(diff)>40){go(diff>0?cur+1:cur-1)}start()},{passive:true});
    cardCarousels.push({go:go,stop:stop,start:start,cur:function(){return cur},total:total});
  });
}

/* ===== PROJECT AUTO-ROTATION using FLIP ===== */
var projRotationOffset=0;
var projRotateIv=null;
var projFlipRunning=false;

function rotateProjectsFlip(){
  if(projFlipRunning)return;
  projFlipRunning=true;
  var cards=Array.from(document.querySelectorAll('.proj-card'));
  if(cards.length===0){projFlipRunning=false;return}
  projRotationOffset=(projRotationOffset+1)%projects.length;
  var firstRects=cards.map(function(c){return c.getBoundingClientRect()});
  cards.forEach(function(card,i){card.style.order=(i+projRotationOffset)%projects.length});
  var lastRects=cards.map(function(c){return c.getBoundingClientRect()});
  cards.forEach(function(card,i){
    var dx=firstRects[i].left-lastRects[i].left;
    var dy=firstRects[i].top-lastRects[i].top;
    card.style.transition='none';
    card.style.transform='translate('+dx+'px, '+dy+'px)';
  });
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      cards.forEach(function(card){
        card.style.transition='transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.transform='';
      });
      setTimeout(function(){
        cards.forEach(function(card){card.style.transition='';card.style.transform=''});
        projFlipRunning=false;
      },650);
    });
  });
}

function startProjRotation(){stopProjRotation();projRotateIv=setInterval(rotateProjectsFlip,4200)}
function stopProjRotation(){if(projRotateIv){clearInterval(projRotateIv);projRotateIv=null}}
projGrid.addEventListener('mouseenter',function(){stopProjRotation()});
projGrid.addEventListener('mouseleave',function(){startProjRotation()});
projGrid.addEventListener('touchstart',function(){stopProjRotation()},{passive:true});
projGrid.addEventListener('touchend',function(){setTimeout(function(){startProjRotation()},1500)},{passive:true});

/* ===== HERO PROJECT SHOWCASE CYCLING ===== */
var heroImgEl=document.getElementById('heroImg');
var heroProjectShowcase=[
  {src:"image/vs code/Screenshot 2026-09-12 084526.png",alt:"Mahala VS Code — Web IDE"},
  {src:"image/campus/dashboard.jpg",alt:"Campus Placement Predictor — ML Dashboard"},
  {src:"image/ambition/Screenshot 2026-09-12 085507.png",alt:"Ambition Box — Job Finder"},
  {src:"image/food/Screenshot 2026-09-12 091418.png",alt:"Food Delivery Service — Platform"},
  {src:"image/transport/Screenshot 2026-09-12 083839.png",alt:"Transport Management System — Logistics Portal"}
];
var heroImgIdx=0;
var heroImgCyclingIv=null;
var heroSection=document.getElementById('home');
var heroInView=true;

function cycleHeroImage(){
  if(!heroImgEl)return;
  heroImgEl.style.opacity='0.25';
  setTimeout(function(){
    heroImgIdx=(heroImgIdx+1)%heroProjectShowcase.length;
    var nextItem=heroProjectShowcase[heroImgIdx];
    heroImgEl.src=nextItem.src;
    heroImgEl.alt=nextItem.alt;
    var restore=function(){heroImgEl.style.opacity='1'};
    if(heroImgEl.complete){restore()}else{heroImgEl.onload=restore;setTimeout(restore,300)}
  },350);
}

function startHeroImgCycle(){
  stopHeroImgCycle();
  heroImgCyclingIv=setInterval(function(){
    if(heroInView)cycleHeroImage();
  },4500);
}

function stopHeroImgCycle(){
  if(heroImgCyclingIv){clearInterval(heroImgCyclingIv);heroImgCyclingIv=null}
}

var heroImgWrap=document.querySelector('.hero__img-wrap');
if(heroImgWrap){
  heroImgWrap.addEventListener('mouseenter',stopHeroImgCycle);
  heroImgWrap.addEventListener('mouseleave',startHeroImgCycle);
}

if('IntersectionObserver' in window && heroSection){
  var heroObserver=new IntersectionObserver(function(entries){
    entries.forEach(function(e){heroInView=e.isIntersecting});
  },{threshold:0.1});
  heroObserver.observe(heroSection);
}

startHeroImgCycle();


/* ===== RENDER CERTIFICATE FLIP CARDS ===== */
var certsGrid=document.getElementById('certsGrid');
var isTouchDevice=window.matchMedia('(hover:none)').matches;

certs.forEach(function(c,i){
  var flipCard=document.createElement('div');
  flipCard.className='flip-card';
  flipCard.dataset.ci=i;
  flipCard.setAttribute('tabindex','0');
  flipCard.innerHTML=
    '<div class="flip-card-inner">'+
      '<div class="flip-card-front">'+
        '<img src="'+c.img+'" alt="'+c.name+'" class="flip-card-img" loading="lazy">'+
        '<div class="flip-card-body">'+
          '<h4>'+c.name+'</h4>'+
          '<p><i class="bx '+c.icon+'"></i> '+c.issuer+'</p>'+
        '</div>'+
      '</div>'+
      '<div class="flip-card-back">'+
        '<i class="bx bx-award flip-card-back-icon"></i>'+
        '<h4>'+c.name+'</h4>'+
        '<p>'+c.desc+'</p>'+
        '<button class="btn btn--p flip-view-btn"><i class="bx bx-external-link"></i> View Certificate</button>'+
      '</div>'+
    '</div>';
  certsGrid.appendChild(flipCard);
  flipCard.addEventListener('click',function(e){
    if(e.target.closest('.flip-view-btn')){e.stopPropagation();openCertModal(i);return}
    if(isTouchDevice){flipCard.classList.toggle('flipped')}else{openCertModal(i)}
  });
  flipCard.addEventListener('keydown',function(e){
    if(e.key==='Enter'){if(isTouchDevice){flipCard.classList.toggle('flipped')}else{openCertModal(i)}}
  });
});

/* ===== CERTIFICATE MODAL ===== */
var certModalOv=document.getElementById('certModalOv');
function openCertModal(idx){
  var c=certs[idx];
  document.getElementById('certModalImg').src=c.img;
  document.getElementById('certModalImg').alt=c.name;
  document.getElementById('certModalTitle').textContent=c.name;
  document.getElementById('certModalIssuer').textContent='Issued by: '+c.issuer;
  document.getElementById('certModalLink').href=c.link;
  certModalOv.classList.add('open');document.body.style.overflow='hidden';
}
function closeCertModal(){certModalOv.classList.remove('open');document.body.style.overflow=''}
document.getElementById('certModalClose').addEventListener('click',closeCertModal);
certModalOv.addEventListener('click',function(e){if(e.target===certModalOv)closeCertModal()});

/* ===== PROJECT MODAL ===== */
var modalOv=document.getElementById('modalOv');
var modalTrack=document.getElementById('modalTrack');
var modalDotsEl=document.getElementById('modalDots');
var modalCur=0,modalTotal=0,modalIv;
function modalGo(i){modalCur=((i%modalTotal)+modalTotal)%modalTotal;modalTrack.style.transform='translateX(-'+modalCur*100+'%)';modalDotsEl.querySelectorAll('.modal__carousel-dot').forEach(function(d,j){d.classList.toggle('active',j===modalCur)})}
function modalStart(){modalIv=setInterval(function(){modalGo(modalCur+1)},3500)}
function modalStop(){clearInterval(modalIv)}

projGrid.addEventListener('click',function(e){
  var card=e.target.closest('.proj-card');
  if(!card)return;
  openProjectModal(card.dataset.idx);
});
projGrid.addEventListener('keydown',function(e){
  if(e.key==='Enter'){var card=e.target.closest('.proj-card');if(card)openProjectModal(card.dataset.idx)}
});

function openProjectModal(idx){
  var p=projects[idx];
  modalTrack.innerHTML=p.images.map(function(img){return'<div class="modal__carousel-slide"><img src="'+img+'" alt="'+p.title+' screenshot" loading="lazy" onload="fitCheck(this)"></div>'}).join('');
  modalTrack.querySelectorAll('img').forEach(fitCheck);
  modalDotsEl.innerHTML=p.images.map(function(_,j){return'<button class="modal__carousel-dot'+(j===0?' active':'')+'" data-j="'+j+'" aria-label="Slide '+(j+1)+' of '+p.images.length+'"></button>'}).join('');
  modalDotsEl.querySelectorAll('.modal__carousel-dot').forEach(function(d){d.addEventListener('click',function(){modalStop();modalGo(+d.dataset.j);modalStart()})});
  document.getElementById('modalTitle').textContent=p.title;
  document.getElementById('modalSub').textContent=p.full;
  document.getElementById('modalFeats').innerHTML=p.features.map(function(f){return'<li><i class="bx bx-check-circle"></i>'+f+'</li>'}).join('');
  document.getElementById('modalTags').innerHTML=p.tags.map(function(t){return'<span class="modal__tag">'+t+'</span>'}).join('');
  document.getElementById('modalLinks').innerHTML='<a href="'+p.demo+'" target="_blank" rel="noopener noreferrer" class="btn btn--p"><i class="bx bx-show"></i> Live Demo</a><a href="'+p.github+'" target="_blank" rel="noopener noreferrer" class="btn btn--o"><i class="bx bxl-github"></i> GitHub</a>';
  modalTotal=p.images.length;modalCur=0;modalGo(0);modalStart();
  modalOv.classList.add('open');document.body.style.overflow='hidden';
}
function closeModal(){modalOv.classList.remove('open');document.body.style.overflow='';modalStop()}
document.getElementById('modalClose').addEventListener('click',closeModal);
modalOv.addEventListener('click',function(e){if(e.target===modalOv)closeModal()});
document.getElementById('modalArrL').addEventListener('click',function(){modalStop();modalGo(modalCur-1);modalStart()});
document.getElementById('modalArrR').addEventListener('click',function(){modalStop();modalGo(modalCur+1);modalStart()});
var modalCarouselEl=document.getElementById('modalCarousel');
var mTx=0;
modalCarouselEl.addEventListener('touchstart',function(e){mTx=e.changedTouches[0].screenX;modalStop()},{passive:true});
modalCarouselEl.addEventListener('touchend',function(e){var diff=mTx-e.changedTouches[0].screenX;if(Math.abs(diff)>50){modalGo(diff>0?modalCur+1:modalCur-1)}modalStart()},{passive:true});

document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();closeCertModal();closeCustomPanel()}});

/* ===== THEME DROPDOWN WITH DARK / LIGHT / CUSTOM ===== */
var themeBtn=document.getElementById('themeBtn');
var themeDdMenu=document.getElementById('themeDdMenu');
var htmlEl=document.documentElement;
var currentThemeMode='light';
var customColorsSaved=localStorage.getItem('custom-theme-colors');

function sysTheme(){return window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}

function applyThemeVisual(t){
  htmlEl.setAttribute('data-theme',t);
  if(themeBtn){
    var iconEl=themeBtn.querySelector('i');
    if(iconEl){
      if(t==='dark')iconEl.className='bx bx-moon';
      else if(t==='light')iconEl.className='bx bx-sun';
      else iconEl.className='bx bx-palette';
    }
  }
  updateThemeDropdownActive(t);
}

function updateThemeDropdownActive(t){
  themeDdMenu.querySelectorAll('.theme-dd-item').forEach(function(item){
    var val=item.getAttribute('data-theme-val');
    if(val==='custom')item.classList.toggle('active',t==='custom'||currentThemeMode==='custom');
    else item.classList.toggle('active',val===t);
  });
}

/* Initialize theme on load */
var savedThemeMode=localStorage.getItem('theme-mode');
if(savedThemeMode==='custom'&&customColorsSaved){
  currentThemeMode='custom';
  applyCustomThemeFromStorage();
}else if(savedThemeMode==='dark'||savedThemeMode==='light'){
  currentThemeMode=savedThemeMode;
  applyThemeVisual(currentThemeMode);
}else{
  currentThemeMode=sysTheme();
  applyThemeVisual(currentThemeMode);
}

/* Toggle dropdown */
themeBtn.addEventListener('click',function(e){
  e.stopPropagation();
  var isOpen=themeDdMenu.classList.toggle('open');
  themeBtn.setAttribute('aria-expanded',isOpen);
});
themeDdMenu.addEventListener('click',function(e){e.stopPropagation()});
document.addEventListener('click',function(e){
  if(!e.target.closest('.theme-dd')){themeDdMenu.classList.remove('open');themeBtn.setAttribute('aria-expanded','false')}
});

/* Theme dropdown item clicks */
themeDdMenu.querySelectorAll('.theme-dd-item').forEach(function(item){
  item.addEventListener('click',function(){
    var val=this.getAttribute('data-theme-val');
    themeDdMenu.classList.remove('open');
    themeBtn.setAttribute('aria-expanded','false');

    if(val==='custom'){
      currentThemeMode='custom';
      localStorage.setItem('theme-mode','custom');
      populateCustomPanelFromCurrent();
      openCustomPanel();
    }else{
      currentThemeMode=val;
      localStorage.setItem('theme-mode',val);
      localStorage.removeItem('custom-theme-colors');
      applyThemeVisual(val);
      showToast(val.charAt(0).toUpperCase()+val.slice(1)+' theme applied',true);
    }
  });
});

/* System theme change listener — only follow if user hasn't manually picked */
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(){
  if(!localStorage.getItem('theme-mode')){
    currentThemeMode=sysTheme();
    applyThemeVisual(currentThemeMode);
  }
});

/* ===== CUSTOM THEME PANEL ===== */
var customPanel=document.getElementById('customPanel');
var customPanelOv=document.getElementById('customPanelOv');

function openCustomPanel(){customPanel.classList.add('open');customPanelOv.classList.add('open');document.body.style.overflow='hidden'}
function closeCustomPanel(){customPanel.classList.remove('open');customPanelOv.classList.remove('open');document.body.style.overflow=''}

document.getElementById('customPanelClose').addEventListener('click',closeCustomPanel);
customPanelOv.addEventListener('click',closeCustomPanel);

/* Populate panel inputs from current CSS variable values */
function populateCustomPanelFromCurrent(){
  var style=getComputedStyle(document.documentElement);
  customPanel.querySelectorAll('input[type="color"][data-var]').forEach(function(input){
    var vname=input.getAttribute('data-var');
    var val=style.getPropertyValue(vname).trim();
    if(val&&val.startsWith('#')&&val.length>=7){input.value=val}
  });
  customPanel.querySelectorAll('.ct-shadow-range').forEach(function(range){
    var vname=range.getAttribute('data-var');
    if(vname==='--shadow-intensity'){var sv=range.parentElement.querySelector('.ct-shadow-val');if(sv)sv.textContent=range.value+'%'}
    if(vname==='--ov-opacity'){var ov=range.parentElement.querySelector('.ct-ov-val');if(ov)ov.textContent=range.value+'%'}
    if(vname==='--hdr-bg-opacity'){var hv=range.parentElement.querySelector('.ct-hdr-val');if(hv)hv.textContent=range.value+'%'}
  });
}

/* Range slider live value updates */
customPanel.querySelectorAll('.ct-shadow-range').forEach(function(range){
  range.addEventListener('input',function(){
    var vname=this.getAttribute('data-var');
    if(vname==='--shadow-intensity'){var sv=this.parentElement.querySelector('.ct-shadow-val');if(sv)sv.textContent=this.value+'%'}
    if(vname==='--ov-opacity'){var ov=this.parentElement.querySelector('.ct-ov-val');if(ov)ov.textContent=this.value+'%'}
    if(vname==='--hdr-bg-opacity'){var hv=this.parentElement.querySelector('.ct-hdr-val');if(hv)hv.textContent=this.value+'%'}
  });
});

/* Preset clicks */
customPanel.querySelectorAll('.ct-preset').forEach(function(preset){
  preset.addEventListener('click',function(){
    var key=this.getAttribute('data-preset');
    var p=themePresets[key];
    if(!p)return;
    customPanel.querySelectorAll('.ct-preset').forEach(function(pr){pr.classList.remove('active')});
    this.classList.add('active');
    /* Fill panel inputs from preset */
    customPanel.querySelector('input[data-var="--bg"]').value=p.bg;
    customPanel.querySelector('input[data-var="--bg-alt"]').value=p.bgAlt;
    customPanel.querySelector('input[data-var="--surface"]').value=p.surface;
    customPanel.querySelector('input[data-var="--surface-h"]').value=p.surfaceH;
    customPanel.querySelector('input[data-var="--tx"]').value=p.tx;
    customPanel.querySelector('input[data-var="--tx2"]').value=p.tx2;
    customPanel.querySelector('input[data-var="--txm"]').value=p.txm;
    customPanel.querySelector('input[data-var="--ac"]').value=p.ac;
    customPanel.querySelector('input[data-var="--ac-h"]').value=p.acH;
    customPanel.querySelector('input[data-var="--ac-l"]').value=p.acL;
    customPanel.querySelector('input[data-var="--hl"]').value=p.hl;
    customPanel.querySelector('input[data-var="--bd"]').value=p.bd;
    customPanel.querySelector('input[data-var="--bd2"]').value=p.bd2;
    customPanel.querySelector('input[data-var="--tag-bg"]').value=p.tagBg;
    customPanel.querySelector('input[data-var="--tag-tx"]').value=p.tagTx;
    customPanel.querySelector('input[data-var="--tl"]').value=p.tl;
    customPanel.querySelector('input[data-var="--ov-color"]').value=p.ovColor;
    customPanel.querySelector('input[data-var="--ov-opacity"]').value=p.ovOpacity;
    customPanel.querySelector('input[data-var="--hdr-bg-color"]').value=p.hdrBgColor;
    customPanel.querySelector('input[data-var="--hdr-bg-opacity"]').value=p.hdrBgOpacity;
    customPanel.querySelector('input[data-var="--shadow-intensity"]').value=p.shadowIntensity;
    customPanel.querySelectorAll('.ct-shadow-range').forEach(function(r){
      var vn=r.getAttribute('data-var');
      if(vn==='--shadow-intensity'){var sv=r.parentElement.querySelector('.ct-shadow-val');if(sv)sv.textContent=r.value+'%'}
      if(vn==='--ov-opacity'){var ov=r.parentElement.querySelector('.ct-ov-val');if(ov)ov.textContent=r.value+'%'}
      if(vn==='--hdr-bg-opacity'){var hv=r.parentElement.querySelector('.ct-hdr-val');if(hv)hv.textContent=r.value+'%'}
    });
  });
});

/* Apply custom theme */
document.getElementById('customApply').addEventListener('click',function(){
  var root=document.documentElement;
  var bg=customPanel.querySelector('input[data-var="--bg"]').value;
  var bgAlt=customPanel.querySelector('input[data-var="--bg-alt"]').value;
  var surface=customPanel.querySelector('input[data-var="--surface"]').value;
  var surfaceH=customPanel.querySelector('input[data-var="--surface-h"]').value;
  var tx=customPanel.querySelector('input[data-var="--tx"]').value;
  var tx2=customPanel.querySelector('input[data-var="--tx2"]').value;
  var txm=customPanel.querySelector('input[data-var="--txm"]').value;
  var ac=customPanel.querySelector('input[data-var="--ac"]').value;
  var acH=customPanel.querySelector('input[data-var="--ac-h"]').value;
  var acL=customPanel.querySelector('input[data-var="--ac-l"]').value;
  var hl=customPanel.querySelector('input[data-var="--hl"]').value;
  var bd=customPanel.querySelector('input[data-var="--bd"]').value;
  var bd2=customPanel.querySelector('input[data-var="--bd2"]').value;
  var tagBg=customPanel.querySelector('input[data-var="--tag-bg"]').value;
  var tagTx=customPanel.querySelector('input[data-var="--tag-tx"]').value;
  var tl=customPanel.querySelector('input[data-var="--tl"]').value;
  var ovColor=customPanel.querySelector('input[data-var="--ov-color"]').value;
  var ovOpacity=parseInt(customPanel.querySelector('input[data-var="--ov-opacity"]').value,10)/100;
  var hdrBgColor=customPanel.querySelector('input[data-var="--hdr-bg-color"]').value;
  var hdrBgOpacity=parseInt(customPanel.querySelector('input[data-var="--hdr-bg-opacity"]').value,10)/100;
  var shadowIntensity=parseInt(customPanel.querySelector('input[data-var="--shadow-intensity"]').value,10)/100;

  var acRgb=hexToRgb(ac);
  var txRgb=hexToRgb(tx);

  root.style.setProperty('--bg',bg);
  root.style.setProperty('--bg-alt',bgAlt);
  root.style.setProperty('--surface',surface);
  root.style.setProperty('--surface-h',surfaceH);
  root.style.setProperty('--tx',tx);
  root.style.setProperty('--tx2',tx2);
  root.style.setProperty('--txm',txm);
  root.style.setProperty('--ac',ac);
  root.style.setProperty('--ac-r',acRgb.r);
  root.style.setProperty('--ac-g',acRgb.g);
  root.style.setProperty('--ac-b',acRgb.b);
  root.style.setProperty('--ac-h',acH);
  root.style.setProperty('--ac-l',acL);
  root.style.setProperty('--ac-s','rgba('+acRgb.r+','+acRgb.g+','+acRgb.b+',.07)');
  root.style.setProperty('--ac-s2','rgba('+acRgb.r+','+acRgb.g+','+acRgb.b+',.14)');
  root.style.setProperty('--hl',hl);
  root.style.setProperty('--hl-s','rgba('+hexToRgb(hl).r+','+hexToRgb(hl).g+','+hexToRgb(hl).b+',.09)');
  root.style.setProperty('--bd',bd);
  root.style.setProperty('--bd2',bd2);
  root.style.setProperty('--sh1','0 1px 3px rgba('+txRgb.r+','+txRgb.g+','+txRgb.b+','+(0.05*shadowIntensity*2.5).toFixed(3)+')');
  root.style.setProperty('--sh2','0 4px 16px rgba('+txRgb.r+','+txRgb.g+','+txRgb.b+','+(0.08*shadowIntensity*2.5).toFixed(3)+')');
  root.style.setProperty('--sh3','0 16px 48px rgba('+txRgb.r+','+txRgb.g+','+txRgb.b+','+(0.12*shadowIntensity*2.5).toFixed(3)+')');
  var hdrRgb=hexToRgb(hdrBgColor);
  root.style.setProperty('--hdr-bg','rgba('+hdrRgb.r+','+hdrRgb.g+','+hdrRgb.b+','+hdrBgOpacity.toFixed(2)+')');
  root.style.setProperty('--hdr-b','rgba('+acRgb.r+','+acRgb.g+','+acRgb.b+',.12)');
  var ovRgb=hexToRgb(ovColor);
  root.style.setProperty('--ov','rgba('+ovRgb.r+','+ovRgb.g+','+ovRgb.b+','+ovOpacity.toFixed(2)+')');
  root.style.setProperty('--mod-bg',surface);
  root.style.setProperty('--tag-bg',tagBg);
  root.style.setProperty('--tag-tx',tagTx);
  root.style.setProperty('--tl',tl);
  root.style.setProperty('--ptc','rgba('+hexToRgb(tl).r+','+hexToRgb(tl).g+','+hexToRgb(tl).b+',.30)');
  root.style.setProperty('--ptc-l','rgba('+hexToRgb(tl).r+','+hexToRgb(tl).g+','+hexToRgb(tl).b+',.06)');
  root.style.setProperty('--carousel-dot','rgba('+hexToRgb(txm).r+','+hexToRgb(txm).g+','+hexToRgb(txm).b+',.25)');
  root.style.setProperty('--carousel-dot-a',ac);

  root.setAttribute('data-theme','custom');
  currentThemeMode='custom';
  localStorage.setItem('theme-mode','custom');

  /* Save custom colors to localStorage */
  var saveData={};
  customPanel.querySelectorAll('input[type="color"][data-var],input[type="range"][data-var]').forEach(function(inp){
    saveData[inp.getAttribute('data-var')]=inp.value;
  });
  localStorage.setItem('custom-theme-colors',JSON.stringify(saveData));

  applyThemeVisual('custom');
  closeCustomPanel();
  showToast('Custom theme applied successfully!',true);
});

/* Apply saved custom theme from localStorage */
function applyCustomThemeFromStorage(){
  var saved=localStorage.getItem('custom-theme-colors');
  if(!saved)return;
  try{
    var data=JSON.parse(saved);
    var root=document.documentElement;
    var bg=data['--bg']||'#11100f';
    var bgAlt=data['--bg-alt']||'#181615';
    var surface=data['--surface']||'#201d1b';
    var surfaceH=data['--surface-h']||'#282320';
    var tx=data['--tx']||'#f2eee8';
    var tx2=data['--tx2']||'#bdb5ac';
    var txm=data['--txm']||'#827a72';
    var ac=data['--ac']||'#d49a6a';
    var acH=data['--ac-h']||'#e2ad7d';
    var acL=data['--ac-l']||'#efc49d';
    var hl=data['--hl']||'#8fb8a5';
    var bd=data['--bd']||'#332e2a';
    var bd2=data['--bd2']||'#463e38';
    var tagBg=data['--tag-bg']||'rgba(143,184,165,.10)';
    var tagTx=data['--tag-tx']||'#8fb8a5';
    var tl=data['--tl']||'#d4a15f';
    var ovColor=data['--ov-color']||'#000000';
    var ovOpacity=parseInt(data['--ov-opacity']||'72',10)/100;
    var hdrBgColor=data['--hdr-bg-color']||'#11100f';
    var hdrBgOpacity=parseInt(data['--hdr-bg-opacity']||'90',10)/100;
    var shadowIntensity=parseInt(data['--shadow-intensity']||'40',10)/100;

    var acRgb=hexToRgb(ac);
    var txRgb=hexToRgb(tx);

    root.style.setProperty('--bg',bg);
    root.style.setProperty('--bg-alt',bgAlt);
    root.style.setProperty('--surface',surface);
    root.style.setProperty('--surface-h',surfaceH);
    root.style.setProperty('--tx',tx);
    root.style.setProperty('--tx2',tx2);
    root.style.setProperty('--txm',txm);
    root.style.setProperty('--ac',ac);
    root.style.setProperty('--ac-r',acRgb.r);
    root.style.setProperty('--ac-g',acRgb.g);
    root.style.setProperty('--ac-b',acRgb.b);
    root.style.setProperty('--ac-h',acH);
    root.style.setProperty('--ac-l',acL);
    root.style.setProperty('--ac-s','rgba('+acRgb.r+','+acRgb.g+','+acRgb.b+',.07)');
    root.style.setProperty('--ac-s2','rgba('+acRgb.r+','+acRgb.g+','+acRgb.b+',.14)');
    root.style.setProperty('--hl',hl);
    root.style.setProperty('--hl-s','rgba('+hexToRgb(hl).r+','+hexToRgb(hl).g+','+hexToRgb(hl).b+',.09)');
    root.style.setProperty('--bd',bd);
    root.style.setProperty('--bd2',bd2);
    root.style.setProperty('--sh1','0 1px 3px rgba('+txRgb.r+','+txRgb.g+','+txRgb.b+','+(0.05*shadowIntensity*2.5).toFixed(3)+')');
    root.style.setProperty('--sh2','0 4px 16px rgba('+txRgb.r+','+txRgb.g+','+txRgb.b+','+(0.08*shadowIntensity*2.5).toFixed(3)+')');
    root.style.setProperty('--sh3','0 16px 48px rgba('+txRgb.r+','+txRgb.g+','+txRgb.b+','+(0.12*shadowIntensity*2.5).toFixed(3)+')');
    var hdrRgb=hexToRgb(hdrBgColor);
    root.style.setProperty('--hdr-bg','rgba('+hdrRgb.r+','+hdrRgb.g+','+hdrRgb.b+','+hdrBgOpacity.toFixed(2)+')');
    root.style.setProperty('--hdr-b','rgba('+acRgb.r+','+acRgb.g+','+acRgb.b+',.12)');
    var ovRgb=hexToRgb(ovColor);
    root.style.setProperty('--ov','rgba('+ovRgb.r+','+ovRgb.g+','+ovRgb.b+','+ovOpacity.toFixed(2)+')');
    root.style.setProperty('--mod-bg',surface);
    root.style.setProperty('--tag-bg',tagBg);
    root.style.setProperty('--tag-tx',tagTx);
    root.style.setProperty('--tl',tl);
    root.style.setProperty('--ptc','rgba('+hexToRgb(tl).r+','+hexToRgb(tl).g+','+hexToRgb(tl).b+',.30)');
    root.style.setProperty('--ptc-l','rgba('+hexToRgb(tl).r+','+hexToRgb(tl).g+','+hexToRgb(tl).b+',.06)');
    root.style.setProperty('--carousel-dot','rgba('+hexToRgb(txm).r+','+hexToRgb(txm).g+','+hexToRgb(txm).b+',.25)');
    root.style.setProperty('--carousel-dot-a',ac);

    root.setAttribute('data-theme','custom');
    applyThemeVisual('custom');
  }catch(e){console.warn('Failed to restore custom theme:',e)}
}

/* Reset custom theme */
document.getElementById('customReset').addEventListener('click',function(){
  localStorage.removeItem('custom-theme-colors');
  localStorage.removeItem('theme-mode');
  /* Clear inline styles set by custom theme */
  var root=document.documentElement;
  ['--bg','--bg-alt','--surface','--surface-h','--tx','--tx2','--txm','--ac','--ac-r','--ac-g','--ac-b','--ac-h','--ac-l','--ac-s','--ac-s2','--hl','--hl-s','--bd','--bd2','--sh1','--sh2','--sh3','--hdr-bg','--hdr-b','--ov','--mod-bg','--tag-bg','--tag-tx','--tl','--ptc','--ptc-l','--carousel-dot','--carousel-dot-a'].forEach(function(v){root.style.removeProperty(v)});
  currentThemeMode=sysTheme();
  applyThemeVisual(currentThemeMode);
  closeCustomPanel();
  /* Deactivate all presets */
  customPanel.querySelectorAll('.ct-preset').forEach(function(p){p.classList.remove('active')});
  showToast('Theme reset to system default',true);
});

/* ===== CV DROPDOWN ===== */
var cvBtn=document.getElementById('cvBtn');
var cvDd=document.getElementById('cvDd');
cvBtn.addEventListener('click',function(e){
  e.stopPropagation();
  var isOpen=cvDd.classList.toggle('open');
  cvBtn.setAttribute('aria-expanded',isOpen);
});
cvDd.addEventListener('click',function(e){e.stopPropagation()});
document.addEventListener('click',function(e){if(!e.target.closest('.cv-dd')){cvDd.classList.remove('open');cvBtn.setAttribute('aria-expanded','false')}});

document.getElementById('cvView').addEventListener('click',function(){
  cvDd.classList.remove('open');cvBtn.setAttribute('aria-expanded','false');
  window.open(CV_PATH,'_blank','noopener,noreferrer');
  showToast('Sachin_CV.pdf opened in new tab',true);
});
document.getElementById('cvDownload').addEventListener('click',function(){
  cvDd.classList.remove('open');cvBtn.setAttribute('aria-expanded','false');
  var a=document.createElement('a');a.href=CV_PATH;a.download=CV_FILENAME;a.style.display='none';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  showToast('Sachin_CV.pdf is being downloaded',true);
});

/* ===== HAMBURGER ===== */
var navToggle=document.getElementById('navToggle');
var navLinks=document.getElementById('navLinks');
var mobOv=document.getElementById('mobOv');
function openMenu(){navLinks.classList.add('open');mobOv.classList.add('vis');document.body.style.overflow='hidden';navToggle.setAttribute('aria-label','Close menu')}
function closeMenu(){navLinks.classList.remove('open');mobOv.classList.remove('vis');document.body.style.overflow='';navToggle.setAttribute('aria-label','Open menu')}
navToggle.addEventListener('click',function(){navLinks.classList.contains('open')?closeMenu():openMenu()});
mobOv.addEventListener('click',closeMenu);
navLinks.querySelectorAll('.nav__link').forEach(function(l){l.addEventListener('click',closeMenu)});

/* ===== SCROLL EFFECTS ===== */
var header=document.getElementById('header');
var scrollProg=document.getElementById('scrollProg');
var scrollTopBtn=document.getElementById('scrollTop');
var heroScroll=document.getElementById('heroScroll');

window.addEventListener('scroll',function(){
  var y=window.scrollY;
  header.classList.toggle('scrolled',y>40);
  scrollTopBtn.classList.toggle('vis',y>400);
  heroScroll.classList.toggle('hidden',y>80);
  var docH=document.documentElement.scrollHeight-window.innerHeight;
  scrollProg.style.width=docH>0?((y/docH)*100)+'%':'0%';
  document.querySelectorAll('section[id]:not(.not-found)').forEach(function(sec){
    var top=sec.offsetTop-100,h=sec.offsetHeight,id=sec.id;
    var link=document.querySelector('.nav__link[href="#'+id+'"]');
    if(link)link.classList.toggle('active',y>=top&&y<top+h);
  });
},{passive:true});
scrollTopBtn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});

/* ===== 404 HANDLING ===== */
var validIds=['home','about','projects','resume','contact'];
var notFound=document.getElementById('notFound');
var allSections=document.querySelectorAll('main > section:not(.not-found)');
var footerEl=document.getElementById('footerEl');
function checkHash(){
  var hash=(window.location.hash||'').slice(1);
  if(hash&&!validIds.includes(hash)){
    allSections.forEach(function(s){s.style.display='none'});if(footerEl)footerEl.style.display='none';if(notFound)notFound.classList.add('show');
  }else{if(notFound)notFound.classList.remove('show');allSections.forEach(function(s){s.style.display=''});if(footerEl)footerEl.style.display=''}
}
window.addEventListener('hashchange',checkHash);
checkHash();

/* ===== TYPING ===== */
var typingEl=document.getElementById('typingText');
var phrases=["AI & Data Science Student","Machine Learning Enthusiast","Full Stack Developer","Prompt Engineer","Data Analyst","Problem Solver","Python Developer"];
var pi=0,ci=0,del=false;
function typeLoop(){
  var c=phrases[pi];
  typingEl.textContent=c.substring(0,ci);
  if(!del){ci++;if(ci>c.length){del=true;setTimeout(typeLoop,600);return}}
  else{ci--;if(ci<0){del=false;ci=0;pi=(pi+1)%phrases.length;setTimeout(typeLoop,200);return}}
  setTimeout(typeLoop,del?30:55);
}
typeLoop();

/* ===== SKILL BARS ===== */
var skillBars=document.querySelectorAll('.sk-bar__fill');
var skillsObs=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){skillBars.forEach(function(bar){bar.style.width=bar.dataset.w+'%'});skillsObs.unobserve(entry.target)}
  });
},{threshold:0.25});
var skillsSection=document.querySelector('.sk-group');
if(skillsSection)skillsObs.observe(skillsSection);
var skillsDone=false;
window.addEventListener('scroll',function(){
  if(skillsDone)return;
  var r=skillsSection?skillsSection.getBoundingClientRect():null;
  if(r&&r.top<window.innerHeight*0.8){skillsDone=true;skillBars.forEach(function(bar){bar.style.width=bar.dataset.w+'%'})}
},{passive:true});

/* ===== COUNTERS ===== */
var countersDone=false;
var achSection=document.querySelector('.ach__grid');
function doCounters(){
  if(countersDone)return;countersDone=true;
  document.querySelectorAll('.ach-card__num').forEach(function(el){
    var decimals=parseInt(el.dataset.decimals,10)||0;
    var target=parseFloat(el.dataset.target);
    if(isNaN(target)||target===0)return;
    var dur=1300,start=performance.now();
    function tick(now){
      var p=Math.min((now-start)/dur,1);var eased=1-Math.pow(1-p,3);var val=eased*target;el.textContent=decimals>0?val.toFixed(decimals):(Math.round(val)+(target>=10?'+':''));
      if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
if(achSection){
  var cObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){doCounters();cObs.unobserve(e.target)}})},{threshold:0.3});
  cObs.observe(achSection);
  window.addEventListener('scroll',function(){if(!countersDone&&achSection.getBoundingClientRect().top<window.innerHeight*0.7)doCounters()},{passive:true});
}

/* ===== CONTACT FORM ===== */
var form=document.getElementById('contactForm');
var toast=document.getElementById('toast');
var toastIcon=document.getElementById('toastIcon');
var toastMsg=document.getElementById('toastMsg');
var toastTimer;
function showToast(msg,ok){clearTimeout(toastTimer);toastMsg.textContent=msg;toastIcon.className='bx '+(ok?'bx-check-circle':'bx-error-circle')+' toast__icon '+(ok?'toast__icon--ok':'toast__icon--err');toast.classList.add('show');toastTimer=setTimeout(function(){toast.classList.remove('show')},3200)}

/* Clear error on typing */
form.querySelectorAll('.contact__input').forEach(function(inp){
  inp.addEventListener('input',function(){inp.closest('.form-group').classList.remove('has-error')});
});

/* Validate all required fields */
function validateForm(){
  var valid=true;
  var fields=[
    {el:document.getElementById('c_name'),test:function(v){return v.trim().length>=2}},
    {el:document.getElementById('c_email'),test:function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())}},
    {el:document.getElementById('c_subject'),test:function(v){return v.trim().length>=3}},
    {el:document.getElementById('c_message'),test:function(v){return v.trim().length>=10}}
  ];
  fields.forEach(function(f){
    f.el.closest('.form-group').classList.remove('has-error');
    if(!f.test(f.el.value)){f.el.closest('.form-group').classList.add('has-error');valid=false}
  });
  return valid;
}

form.addEventListener('submit',function(e){
  e.preventDefault();
  if(!validateForm()){return}

  var data={
    name:document.getElementById('c_name').value.trim(),
    email:document.getElementById('c_email').value.trim(),
    phone:document.getElementById('c_phone').value.trim(),
    subject:document.getElementById('c_subject').value.trim(),
    message:document.getElementById('c_message').value.trim()
  };

  var btn=document.getElementById('submitBtn');
  var txt=document.getElementById('submitText');
  btn.disabled=true;
  txt.innerHTML='<span class="spinner"></span> Sending...';

  var apiUrl = (window.location.port === '5500' || window.location.port === '5501') ? 'http://localhost:3001/api/contact' : '/api/contact';
  fetch(apiUrl, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  })
  .then(function(res){
    if(!res.ok)return res.json().catch(function(){return{}}).then(function(d){throw new Error(d.error||'Server error. Please try again later.')});
    return res.json();
  })
  .then(function(result){
    if(result.success){
      showToast('Message sent successfully! I\'ll get back to you soon.',true);
      form.reset();
    }else{
      throw new Error(result.error||'Failed to send message.');
    }
  })
  .catch(function(err){
    if(err.message&&err.message.indexOf('fetch')>-1){
      showToast('Unable to connect to the server. Check your connection and try again.',false);
    }else{
      showToast(err.message||'Something went wrong. Please try again.',false);
    }
  })
  .finally(function(){
    btn.disabled=false;
    txt.innerHTML='<i class="bx bx-paper-plane"></i> Send Message';
  });
});

/* ===== SCROLL REVEAL ===== */
if(typeof ScrollReveal!=='undefined'){
  var sr=ScrollReveal({origin:'top',distance:'30px',duration:550,delay:50,reset:false,mobile:true});
  sr.reveal('.hero__badge',{delay:0});sr.reveal('.hero__name',{delay:60});sr.reveal('.hero__typing',{delay:120});sr.reveal('.hero__desc',{delay:180});sr.reveal('.hero__actions',{delay:240});sr.reveal('.hero__socials',{delay:300});sr.reveal('.hero__img-wrap',{delay:200,origin:'right'});
  sr.reveal('.about__img-wrap',{delay:60});sr.reveal('.about__txt h3',{delay:120});sr.reveal('.about__txt p',{delay:160,interval:60});sr.reveal('.about__hl-item',{delay:240,interval:50});
  sr.reveal('.proj-card',{delay:60,interval:70});
  sr.reveal('.tl-item',{delay:60,interval:100});
  sr.reveal('.flip-card',{delay:60,interval:70});
  sr.reveal('.sk-group',{delay:60,interval:60});sr.reveal('.ach-card',{delay:60,interval:60});sr.reveal('.ach-hl',{delay:120});
  sr.reveal('.contact__info',{delay:60});sr.reveal('.contact__form',{delay:120});sr.reveal('.contact__input',{delay:160,interval:40});
}

/* ================================================================
   CANVAS ANIMATIONS — 6 different types across 5 sections
   + 4 corner canvases in hero + 4 section accent canvases
   ================================================================ */
var prefersReduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* Helper: size a canvas to its CSS layout size */
function sizeCanvas(c){
  if(!c) return;
  var w = c.offsetWidth || (c.parentElement ? c.parentElement.offsetWidth : 0) || window.innerWidth;
  var h = c.offsetHeight || (c.parentElement ? c.parentElement.offsetHeight : 0) || window.innerHeight;
  if(w > 0) c.width = w;
  if(h > 0) c.height = h;
}

/* ===== 1. HERO CANVAS — Particle Network with mouse & touch repulsion ===== */
var canvas = document.getElementById('hero_canvas') || document.getElementById('heroCanvas');
var ctx = canvas ? canvas.getContext('2d') : null;
var heroVisible = true;
var cornerVisible = true;
var particles = [];
var PC = window.innerWidth < 480 ? 25 : window.innerWidth < 768 ? 40 : 65;
var CD = 120;

function resizeCanvas() {
  if (!canvas) return;
  sizeCanvas(canvas);
  if (particles && particles.length > 0) {
    for (var i = 0; i < particles.length; i++) {
      if (particles[i].x > canvas.width) particles[i].x = Math.random() * canvas.width;
      if (particles[i].y > canvas.height) particles[i].y = Math.random() * canvas.height;
    }
  }
}
resizeCanvas();

function resizeHeroBokeh() {
  var b = document.getElementById('heroBokeh');
  if (b) sizeCanvas(b);
}
resizeHeroBokeh();

window.addEventListener('resize', function() {
  resizeCanvas();
  resizeHeroBokeh();
  resizeCornerCanvases();
  resizeAccentCanvases();
});

function P() {
  var w = canvas ? canvas.width : window.innerWidth;
  var h = canvas ? canvas.height : window.innerHeight;
  this.x = Math.random() * w;
  this.y = Math.random() * h;
  this.vx = (Math.random() - .5) * .4;
  this.vy = (Math.random() - .5) * .4;
  this.r = Math.random() * 1.6 + .7;
  this.baseR = this.r;
}
P.prototype.update = function() {
  if (!canvas) return;
  this.x += this.vx;
  this.y += this.vy;
  if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
  if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
};
P.prototype.draw = function(ac) {
  if (!ctx) return;
  ctx.beginPath();
  ctx.arc(this.x, this.y, Math.max(.5, this.r), 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(' + ac.r + ',' + ac.g + ',' + ac.b + ',0.28)';
  ctx.fill();
};

if (canvas) {
  for (var pi2 = 0; pi2 < PC; pi2++) particles.push(new P());
}

var heroMouse = { x: -999, y: -999 };
var heroContainer = document.getElementById('home') || (canvas ? canvas.parentElement : null);

function setHeroPointer(clientX, clientY) {
  if (!canvas) return;
  var r = canvas.getBoundingClientRect();
  heroMouse.x = clientX - r.left;
  heroMouse.y = clientY - r.top;
}
function clearHeroPointer() {
  heroMouse.x = -999;
  heroMouse.y = -999;
}

if (heroContainer) {
  heroContainer.addEventListener('mousemove', function(e) {
    setHeroPointer(e.clientX, e.clientY);
  }, { passive: true });
  heroContainer.addEventListener('mouseleave', clearHeroPointer);
  heroContainer.addEventListener('touchstart', function(e) {
    if (e.touches && e.touches.length > 0) {
      setHeroPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  heroContainer.addEventListener('touchmove', function(e) {
    if (e.touches && e.touches.length > 0) {
      setHeroPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  heroContainer.addEventListener('touchend', clearHeroPointer);
  heroContainer.addEventListener('touchcancel', clearHeroPointer);
}

var homeEl = document.getElementById('home');
if (homeEl && 'IntersectionObserver' in window) {
  var heroObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      heroVisible = e.isIntersecting;
    });
  }, { threshold: 0.02 });
  heroObs.observe(homeEl);
}

function animP() {
  if (!canvas || !ctx) return;
  if (!heroVisible) {
    requestAnimationFrame(animP);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var ac = getAccentRGB();
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    var dx = p.x - heroMouse.x, dy = p.y - heroMouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120 && dist > 0) {
      var f = (120 - dist) / 120 * 0.8;
      p.x += (dx / dist) * f * 2;
      p.y += (dy / dist) * f * 2;
      p.r = p.baseR * 1.5;
    } else {
      p.r += (p.baseR - p.r) * 0.05;
    }
    p.update();
    p.draw(ac);
    for (var j = i + 1; j < particles.length; j++) {
      var dx2 = p.x - particles[j].x, dy2 = p.y - particles[j].y;
      var d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (d < CD) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = 'rgba(' + ac.r + ',' + ac.g + ',' + ac.b + ',' + ((1 - d / CD) * 0.12).toFixed(3) + ')';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animP);
}
if (!prefersReduced && canvas) animP();
else if (ctx) {
  var acStatic = getAccentRGB();
  particles.forEach(function(p) { p.draw(acStatic); });
}

/* ===== 2. HERO BOKEH CANVAS ===== */
var bokehCanvas = document.getElementById('heroBokeh');
var bCtx = bokehCanvas ? bokehCanvas.getContext('2d') : null;
var bokehOrbs = [];
var BOKEH_COUNT = window.innerWidth < 480 ? 4 : window.innerWidth < 768 ? 6 : 10;
function BokehOrb(w, h) {
  this.x = Math.random() * (w || 300);
  this.y = Math.random() * (h || 300);
  this.r = Math.random() * 80 + 40;
  this.vx = (Math.random() - .5) * .15;
  this.vy = (Math.random() - .5) * .15;
  this.opacity = Math.random() * .04 + 0.015;
}
BokehOrb.prototype.update = function(w, h) {
  this.x += this.vx;
  this.y += this.vy;
  if (this.x < -this.r) this.x = w + this.r;
  if (this.x > w + this.r) this.x = -this.r;
  if (this.y < -this.r) this.y = h + this.r;
  if (this.y > h + this.r) this.y = -this.r;
};
BokehOrb.prototype.draw = function(ctx2, ac) {
  if (!ctx2) return;
  var grad = ctx2.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(1, this.r));
  grad.addColorStop(0, 'rgba(' + ac.r + ',' + ac.g + ',' + ac.b + ',' + this.opacity + ')');
  grad.addColorStop(1, 'rgba(' + ac.r + ',' + ac.g + ',' + ac.b + ',0)');
  ctx2.fillStyle = grad;
  ctx2.beginPath();
  ctx2.arc(this.x, this.y, Math.max(1, this.r), 0, Math.PI * 2);
  ctx2.fill();
};
if (bokehCanvas) {
  for (var bi = 0; bi < BOKEH_COUNT; bi++) bokehOrbs.push(new BokehOrb(bokehCanvas.width, bokehCanvas.height));
}
function animBokeh() {
  if (!bokehCanvas || !bCtx) return;
  if (!heroVisible) {
    requestAnimationFrame(animBokeh);
    return;
  }
  bCtx.clearRect(0, 0, bokehCanvas.width, bokehCanvas.height);
  var ac = getAccentRGB();
  bokehOrbs.forEach(function(orb) {
    orb.update(bokehCanvas.width, bokehCanvas.height);
    orb.draw(bCtx, ac);
  });
  requestAnimationFrame(animBokeh);
}
if (!prefersReduced && bokehCanvas) animBokeh();

/* ===== 3. HERO CORNER CANVASES — 4 different animations in corners ===== */
var cornerIds = ['cornerTL', 'cornerTR', 'cornerBL', 'cornerBR'];
var cornerCtxs = [];
function resizeCornerCanvases() {
  cornerIds.forEach(function(id) {
    var c = document.getElementById(id);
    if (c) sizeCanvas(c);
  });
}
resizeCornerCanvases();

cornerIds.forEach(function(id) {
  var c = document.getElementById(id);
  if (c) cornerCtxs.push(c.getContext('2d'));
});

if (homeEl && 'IntersectionObserver' in window) {
  var cornerObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      cornerVisible = e.isIntersecting;
    });
  }, { threshold: 0.02 });
  cornerObs.observe(homeEl);
}

/* Corner TL — Rotating concentric arcs */
function drawCornerTL(c,ac,t){
  c.clearRect(0,0,c.width,c.height);
  var cx=c.width,cy=c.height;
  for(var i=0;i<4;i++){
    var r=Math.max(1,15+i*14);
    var startA=t*0.001*(i%2===0?1:-1)+i*0.5;
    var endA=startA+Math.PI*(0.5+i*0.2);
    c.beginPath();c.arc(cx,cy,r,startA,endA);
    c.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+(0.12-i*0.02).toFixed(3)+')';
    c.lineWidth=1.2;c.stroke();
  }
}

/* Corner TR — Expanding diamond grid */
function drawCornerTR(c,ac,t){
  c.clearRect(0,0,c.width,c.height);
  var phase=(t*0.002)%1;
  for(var x=0;x<c.width;x+=18){
    for(var y=0;y<c.height;y+=18){
      var d=Math.sqrt(x*x+y*y);
      var s=3+Math.sin(d*0.04-t*0.003)*2;
      s=Math.max(0.5,s);
      c.save();c.translate(x,y);c.rotate(Math.PI/4);
      c.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+(0.06+Math.sin(d*0.03-t*0.002)*0.04).toFixed(3)+')';
      c.lineWidth=0.8;c.strokeRect(-s/2,-s/2,s,s);
      c.restore();
    }
  }
}

/* Corner BL — Floating dots rising upward */
var cornerBLDots=[];
function initCornerBLDots(w,h){
  cornerBLDots=[];
  var count=window.innerWidth<480?8:15;
  for(var i=0;i<count;i++){
    cornerBLDots.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+0.5,vy:-(Math.random()*0.3+0.1),vx:(Math.random()-.5)*0.15,op:Math.random()*0.15+0.05});
  }
}
initCornerBLDots(65,65);
function drawCornerBL(c,ac){
  c.clearRect(0,0,c.width,c.height);
  cornerBLDots.forEach(function(d){
    d.x+=d.vx;d.y+=d.vy;
    if(d.y<-5){d.y=c.height+5;d.x=Math.random()*c.width}
    if(d.x<-5)d.x=c.width+5;if(d.x>c.width+5)d.x=-5;
    c.beginPath();c.arc(d.x,d.y,Math.max(0.3,d.r),0,Math.PI*2);
    c.fillStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+d.op.toFixed(3)+')';c.fill();
  });
}

/* Corner BR — Pulsing spiral */
function drawCornerBR(c,ac,t){
  c.clearRect(0,0,c.width,c.height);
  var cx=0,cy=c.height;
  c.beginPath();
  for(var a=0;a<Math.PI*4;a+=0.1){
    var r=Math.max(0.1,a*4+Math.sin(t*0.003)*3);
    var x=cx+Math.cos(a)*r;
    var y=cy-Math.sin(a)*r;
    if(a===0)c.moveTo(x,y);else c.lineTo(x,y);
  }
  c.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+',0.1)';
  c.lineWidth=1;c.stroke();
  /* Pulsing dot at center */
  var pr=3+Math.sin(t*0.005)*1.5;
  c.beginPath();c.arc(cx,cy,Math.max(0.5,pr),0,Math.PI*2);
  c.fillStyle='rgba('+ac.r+','+ac.g+','+ac.b+',0.2)';c.fill();
}

function animCorners(){
  if(!cornerVisible){requestAnimationFrame(animCorners);return}
  var ac=getAccentRGB();
  var t=performance.now();
  drawCornerTL(cornerCtxs[0],ac,t);
  drawCornerTR(cornerCtxs[1],ac,t);
  drawCornerBL(cornerCtxs[2],ac,t);
  drawCornerBR(cornerCtxs[3],ac,t);
  requestAnimationFrame(animCorners);
}
if(!prefersReduced)animCorners();

/* ===== 4. ABOUT CANVAS — Floating Geometric Shapes ===== */
var aboutCanvas=document.getElementById('aboutCanvas');
var aCtx=aboutCanvas.getContext('2d');
var geoShapes=[];
var GEO_COUNT=window.innerWidth<480?8:16;
function resizeAboutCanvas(){sizeCanvas(aboutCanvas)}
resizeAboutCanvas();
var aboutMouse={x:-999,y:-999};
document.getElementById('about').addEventListener('mousemove',function(e){var r=aboutCanvas.getBoundingClientRect();aboutMouse.x=e.clientX-r.left;aboutMouse.y=e.clientY-r.top});
document.getElementById('about').addEventListener('mouseleave',function(){aboutMouse.x=-999;aboutMouse.y=-999});

function GeoShape(w,h){
  this.x=Math.random()*w;this.y=Math.random()*h;
  this.size=Math.random()*16+6;
  this.type=['circle','triangle','hexagon','diamond'][Math.floor(Math.random()*4)];
  this.rot=Math.random()*Math.PI*2;this.rotSpd=(Math.random()-.5)*.007;
  this.vx=(Math.random()-.5)*.2;this.vy=(Math.random()-.5)*.2;
  this.opacity=Math.random()*.08+.03;this.baseOp=this.opacity;
}
GeoShape.prototype.update=function(w,h){
  this.x+=this.vx;this.y+=this.vy;this.rot+=this.rotSpd;
  if(this.x<-25)this.x=w+25;if(this.x>w+25)this.x=-25;
  if(this.y<-25)this.y=h+25;if(this.y>h+25)this.y=-25;
  var dx=this.x-aboutMouse.x,dy=this.y-aboutMouse.y;
  var d=Math.sqrt(dx*dx+dy*dy);
  if(d<130){this.opacity=this.baseOp+0.1*(1-d/130);this.rotSpd*=1.008}
  else{this.opacity+=(this.baseOp-this.opacity)*.03}
};
GeoShape.prototype.draw=function(ctx2,ac){
  ctx2.save();ctx2.translate(this.x,this.y);ctx2.rotate(this.rot);
  ctx2.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+this.opacity+')';ctx2.lineWidth=1;
  ctx2.beginPath();var s=Math.max(3,this.size);
  if(this.type==='circle'){ctx2.arc(0,0,s,0,Math.PI*2)}
  else if(this.type==='triangle'){for(var i=0;i<3;i++){var a=i*Math.PI*2/3-Math.PI/2;ctx2.lineTo(Math.cos(a)*s,Math.sin(a)*s)}ctx2.closePath()}
  else if(this.type==='hexagon'){for(var i=0;i<6;i++){var a=i*Math.PI/3;ctx2.lineTo(Math.cos(a)*s,Math.sin(a)*s)}ctx2.closePath()}
  else if(this.type==='diamond'){ctx2.moveTo(0,-s);ctx2.lineTo(s*.6,0);ctx2.lineTo(0,s);ctx2.lineTo(-s*.6,0);ctx2.closePath()}
  ctx2.stroke();ctx2.restore();
};
for(var gi=0;gi<GEO_COUNT;gi++)geoShapes.push(new GeoShape(aboutCanvas.width,aboutCanvas.height));

var aboutVisible=false;
var aboutObs=new IntersectionObserver(function(entries){entries.forEach(function(e){aboutVisible=e.isIntersecting})},{threshold:0.05});
aboutObs.observe(document.getElementById('about'));
function animAbout(){
  if(!aboutVisible){requestAnimationFrame(animAbout);return}
  aCtx.clearRect(0,0,aboutCanvas.width,aboutCanvas.height);
  var ac=getAccentRGB();
  geoShapes.forEach(function(s){s.update(aboutCanvas.width,aboutCanvas.height);s.draw(aCtx,ac)});
  requestAnimationFrame(animAbout);
}
if(!prefersReduced)animAbout();

/* ===== 5. ABOUT ACCENT CANVAS (top-right) — Orbiting dots ===== */
var aboutAccTR=document.getElementById('aboutAccTR');
var aboutAccTRCtx=aboutAccTR.getContext('2d');
var aboutAccVisible=false;
var aboutAccObs=new IntersectionObserver(function(entries){entries.forEach(function(e){aboutAccVisible=e.isIntersecting})},{threshold:0.05});
aboutAccObs.observe(document.getElementById('about'));

function animAboutAccTR(){
  if(!aboutAccVisible){requestAnimationFrame(animAboutAccTR);return}
  var c=aboutAccTRCtx,w=aboutAccTR.width,h=aboutAccTR.height;
  c.clearRect(0,0,w,h);
  var ac=getAccentRGB();
  var t=performance.now()*0.001;
  var cx=0,cy=0;
  for(var i=0;i<5;i++){
    var angle=t*0.5+i*Math.PI*2/5;
    var r=Math.max(1,Math.min(w,h)*0.3);
    var x=cx+Math.cos(angle)*r;
    var y=cy+Math.sin(angle)*r;
    c.beginPath();c.arc(x,y,Math.max(0.5,2-i*0.2),0,Math.PI*2);
    c.fillStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+(0.15-i*0.02).toFixed(3)+')';c.fill();
    c.beginPath();c.arc(cx,cy,Math.max(0.5,1.5),0,Math.PI*2);
    c.fillStyle='rgba('+ac.r+','+ac.g+','+ac.b+',0.2)';c.fill();
  }
  requestAnimationFrame(animAboutAccTR);
}
if(!prefersReduced)animAboutAccTR();

/* ===== 6. PROJECTS CANVAS — Flowing Wave Lines ===== */
var projCanvas=document.getElementById('projectsCanvas');
var pCtx=projCanvas.getContext('2d');
function resizeProjCanvas(){sizeCanvas(projCanvas)}
resizeProjCanvas();
var projMouse={x:-999,y:-999};
document.getElementById('projects').addEventListener('mousemove',function(e){var r=projCanvas.getBoundingClientRect();projMouse.x=e.clientX-r.left;projMouse.y=e.clientY-r.top});
document.getElementById('projects').addEventListener('mouseleave',function(){projMouse.x=-999;projMouse.y=-999});
var projVisible=false;
var projObs=new IntersectionObserver(function(entries){entries.forEach(function(e){projVisible=e.isIntersecting})},{threshold:0.05});
projObs.observe(document.getElementById('projects'));
var waveTime=0;
function animProj(){
  if(!projVisible){requestAnimationFrame(animProj);return}
  pCtx.clearRect(0,0,projCanvas.width,projCanvas.height);
  var ac=getAccentRGB();waveTime+=0.013;
  var numWaves=5;
  for(var i=0;i<numWaves;i++){
    pCtx.beginPath();
    var amp=12+i*6;var freq=0.004+i*0.0012;var spd=0.5+i*0.12;
    var yOff=projCanvas.height*0.2+i*(projCanvas.height*0.14);
    var op=0.04-i*0.005;
    for(var x=0;x<=projCanvas.width;x+=3){
      var dx=x-projMouse.x,dy=yOff-projMouse.y;
      var d=Math.sqrt(dx*dx+dy*dy);
      var mInf=Math.max(0,1-d/160)*22;
      var y=yOff+Math.sin(x*freq+waveTime*spd)*amp+Math.sin(x*freq*0.5+waveTime*spd*0.7)*(amp*0.4)-mInf;
      if(x===0)pCtx.moveTo(x,y);else pCtx.lineTo(x,y);
    }
    pCtx.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+Math.max(0.01,op)+')';pCtx.lineWidth=1;pCtx.stroke();
  }
  requestAnimationFrame(animProj);
}
if(!prefersReduced)animProj();

/* ===== 7. PROJECTS ACCENT CANVAS (bottom-left) — Scanning lines ===== */
var projAccBL=document.getElementById('projAccBL');
var projAccBLCtx=projAccBL.getContext('2d');
var projAccVisible=false;
var projAccObs=new IntersectionObserver(function(entries){entries.forEach(function(e){projAccVisible=e.isIntersecting})},{threshold:0.05});
projAccObs.observe(document.getElementById('projects'));

function animProjAccBL(){
  if(!projAccVisible){requestAnimationFrame(animProjAccBL);return}
  var c=projAccBLCtx,w=projAccBL.width,h=projAccBL.height;
  c.clearRect(0,0,w,h);
  var ac=getAccentRGB();
  var t=performance.now()*0.001;
  var scanY=(t*20)%h;
  for(var y=0;y<h;y+=4){
    var dist=Math.abs(y-scanY);
    var op=dist<15?0.12*(1-dist/15):0.03;
    c.beginPath();c.moveTo(0,y);c.lineTo(w,y);
    c.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+op.toFixed(3)+')';
    c.lineWidth=0.5;c.stroke();
  }
  requestAnimationFrame(animProjAccBL);
}
if(!prefersReduced)animProjAccBL();

/* ===== 8. RESUME CANVAS — Slowly drifting dot grid ===== */
var resumeCanvas=document.getElementById('resumeCanvas');
var rCtx=resumeCanvas.getContext('2d');
function resizeResumeCanvas(){sizeCanvas(resumeCanvas)}
resizeResumeCanvas();
var resumeVisible=false;
var resumeObs=new IntersectionObserver(function(entries){entries.forEach(function(e){resumeVisible=e.isIntersecting})},{threshold:0.05});
resumeObs.observe(document.getElementById('resume'));
function animResume(){
  if(!resumeVisible){requestAnimationFrame(animResume);return}
  rCtx.clearRect(0,0,resumeCanvas.width,resumeCanvas.height);
  var ac=getAccentRGB();
  var sp=window.innerWidth<480?35:45;
  var t=performance.now()*0.0003;
  var oy=(t*10)%sp;
  var cx=resumeCanvas.width/2,cy=resumeCanvas.height/2;
  var maxD=Math.sqrt(cx*cx+cy*cy);
  for(var x=sp/2;x<resumeCanvas.width;x+=sp){
    for(var y=sp/2+oy;y<resumeCanvas.height+sp;y+=sp){
      var ddx=x-cx,ddy=y-cy;
      var d=Math.sqrt(ddx*ddx+ddy*ddy);
      var op=0.07*(1-d/maxD);
      if(op<=0.005)continue;
      rCtx.beginPath();rCtx.arc(x,y,1.2,0,Math.PI*2);
      rCtx.fillStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+op.toFixed(3)+')';rCtx.fill();
    }
  }
  requestAnimationFrame(animResume);
}
if(!prefersReduced)animResume();

/* ===== 9. RESUME ACCENT CANVAS (top-right) — Rotating triangles ===== */
var resumeAccTR=document.getElementById('resumeAccTR');
var resumeAccTRCtx=resumeAccTR.getContext('2d');
var resumeAccVisible=false;
var resumeAccObs=new IntersectionObserver(function(entries){entries.forEach(function(e){resumeAccVisible=e.isIntersecting})},{threshold:0.05});
resumeAccObs.observe(document.getElementById('resume'));

function animResumeAccTR(){
  if(!resumeAccVisible){requestAnimationFrame(animResumeAccTR);return}
  var c=resumeAccTRCtx,w=resumeAccTR.width,h=resumeAccTR.height;
  c.clearRect(0,0,w,h);
  var ac=getAccentRGB();
  var t=performance.now()*0.001;
  var cx=w,cy=0;
  for(var i=0;i<3;i++){
    var angle=t*0.4+i*Math.PI*2/3;
    var r=Math.max(1,Math.min(w,h)*0.35);
    var x=cx+Math.cos(angle)*r;
    var y=cy+Math.sin(angle)*r;
    c.save();c.translate(x,y);c.rotate(angle+t*0.3);
    c.beginPath();
    var sz=Math.max(2,6-i);
    for(var j=0;j<3;j++){var a=j*Math.PI*2/3-Math.PI/2;c.lineTo(Math.cos(a)*sz,Math.sin(a)*sz)}
    c.closePath();
    c.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+(0.15-i*0.03).toFixed(3)+')';
    c.lineWidth=0.8;c.stroke();
    c.restore();
  }
  requestAnimationFrame(animResumeAccTR);
}
if(!prefersReduced)animResumeAccTR();

/* ===== 10. CONTACT CANVAS — Expanding Ripple Circles ===== */
var contactCanvas=document.getElementById('contactCanvas');
var cCtx2=contactCanvas.getContext('2d');
function resizeContactCanvas(){sizeCanvas(contactCanvas)}
resizeContactCanvas();
var contactMouse={x:-999,y:-999,active:false};
document.getElementById('contact').addEventListener('mousemove',function(e){var r=contactCanvas.getBoundingClientRect();contactMouse.x=e.clientX-r.left;contactMouse.y=e.clientY-r.top;contactMouse.active=true});
document.getElementById('contact').addEventListener('mouseleave',function(){contactMouse.active=false});
var ripples=[];
var contactVisible=false;
var contactObs=new IntersectionObserver(function(entries){entries.forEach(function(e){contactVisible=e.isIntersecting})},{threshold:0.05});
contactObs.observe(document.getElementById('contact'));
function Ripple(x,y){this.x=x;this.y=y;this.radius=0;this.maxR=70+Math.random()*70;this.op=0.1;this.spd=0.35+Math.random()*0.35}
Ripple.prototype.update=function(){this.radius+=this.spd;this.op=0.1*(1-this.radius/this.maxR);return this.radius<this.maxR};
Ripple.prototype.draw=function(ctx2,ac){if(this.op<=0)return;ctx2.beginPath();ctx2.arc(this.x,this.y,Math.max(1,this.radius),0,Math.PI*2);ctx2.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+this.op+')';ctx2.lineWidth=.8;ctx2.stroke()};
var rippleTimer=0;
function animContact(){
  if(!contactVisible){requestAnimationFrame(animContact);return}
  cCtx2.clearRect(0,0,contactCanvas.width,contactCanvas.height);
  var ac=getAccentRGB();rippleTimer++;
  if(rippleTimer%100===0)ripples.push(new Ripple(Math.random()*contactCanvas.width,Math.random()*contactCanvas.height));
  if(contactMouse.active&&rippleTimer%14===0)ripples.push(new Ripple(contactMouse.x,contactMouse.y));
  var cx2=contactCanvas.width/2,cy2=contactCanvas.height/2;
  for(var i=0;i<3;i++){
    var phase=(rippleTimer*0.007+i*2.1)%(Math.PI*2);
    var r=Math.sin(phase)*55+70;
    var op=0.03+Math.sin(phase)*0.015;
    cCtx2.beginPath();cCtx2.arc(cx2,cy2,Math.max(1,r),0,Math.PI*2);
    cCtx2.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+Math.max(0.01,op)+')';cCtx2.lineWidth=.8;cCtx2.stroke();
  }
  ripples=ripples.filter(function(r){var alive=r.update();r.draw(cCtx2,ac);return alive});
  requestAnimationFrame(animContact);
}
if(!prefersReduced)animContact();

/* ===== 11. CONTACT ACCENT CANVAS (bottom-left) — Pulsing rings ===== */
var contactAccBL=document.getElementById('contactAccBL');
var contactAccBLCtx=contactAccBL.getContext('2d');
var contactAccVisible=false;
var contactAccObs=new IntersectionObserver(function(entries){entries.forEach(function(e){contactAccVisible=e.isIntersecting})},{threshold:0.05});
contactAccObs.observe(document.getElementById('contact'));

function animContactAccBL(){
  if(!contactAccVisible){requestAnimationFrame(animContactAccBL);return}
  var c=contactAccBLCtx,w=contactAccBL.width,h=contactAccBL.height;
  c.clearRect(0,0,w,h);
  var ac=getAccentRGB();
  var t=performance.now()*0.001;
  var cx=w,cy=h;
  for(var i=0;i<4;i++){
    var r=Math.max(1,10+i*12+Math.sin(t*1.5+i)*5);
    var op=0.12-i*0.025+Math.sin(t*2+i*0.8)*0.03;
    op=Math.max(0.01,op);
    c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);
    c.strokeStyle='rgba('+ac.r+','+ac.g+','+ac.b+','+op.toFixed(3)+')';
    c.lineWidth=1;c.stroke();
  }
  requestAnimationFrame(animContactAccBL);
}
if(!prefersReduced)animContactAccBL();

/* ===== Re-initialize corner BL dots on resize ===== */
window.addEventListener('resize',function(){
  var blCanvas=document.getElementById('cornerBL');
  if(blCanvas)initCornerBLDots(blCanvas.width,blCanvas.height);
});

/* ===== Resize accent canvases ===== */
function resizeAccentCanvases(){
  ['aboutAccTR','projAccBL','resumeAccTR','contactAccBL'].forEach(function(id){sizeCanvas(document.getElementById(id))});
}
resizeAccentCanvases();

/* ===== DYNAMIC FOOTER YEAR ===== */
(function(){
  var yEl = document.getElementById("footerYear");
  if (yEl) yEl.textContent = new Date().getFullYear();
})();

