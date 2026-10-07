// FISAT entry — Vite injects/bundles style via this import.
import './style.css';

// FISAT interactive behaviours
(function(){
  const $ = (s, c=document)=>c.querySelector(s);
  const $$ = (s, c=document)=>[...c.querySelectorAll(s)];

  // Section page transition with protected navigation behavior
  const header = $('#siteHeader');
  const menuBtn=$('#menuBtn'), nav=$('#mainNav');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageSections = $$('main section[id]');
  function headerOffset(){ return (header?.offsetHeight || 72) + 14; }
  function scrollToSection(hash){
    const target = hash && $(hash);
    if(!target) return false;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
    target.setAttribute('tabindex','-1');
    setTimeout(()=>{ target.focus({preventScroll:true}); }, reduceMotion ? 0 : 520);
    return true;
  }
  function triggerPageTransition(hash){
    const target = hash && $(hash);
    if(!target) return false;

    const current = pageSections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.2;
    }) || pageSections[0];

    pageSections.forEach(section => {
      section.classList.remove('page-active', 'page-animate-in', 'page-exit');
      section.style.pointerEvents = 'none';
    });

    if (current && current !== target) {
      current.classList.add('page-exit');
      setTimeout(() => current.classList.remove('page-exit'), 420);
    }

    target.classList.remove('page-animate-in');
    void target.offsetWidth;
    target.classList.add('page-animate-in', 'page-active');
    target.style.pointerEvents = 'auto';

    document.body.classList.add('nav-transition');
    setTimeout(() => {
      document.body.classList.remove('nav-transition');
      pageSections.forEach(section => section.style.pointerEvents = '');
      target.classList.remove('page-animate-in');
    }, 700);

    setTimeout(() => {
      if (scrollToSection(hash)) {
        target.setAttribute('tabindex','-1');
      }
    }, 120);

    return true;
  }

  // Intercept all in-page links (nav, topbar, CTAs, footer, back-to-top link)
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const hash = a.getAttribute('href');
      if(hash.length < 2) return;
      if(triggerPageTransition(hash)){
        e.preventDefault();
        history.pushState(null, '', hash);
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded','false');
      }
    });
  });

  // Deep-link on load (e.g. site.com/#placements)
  if(location.hash) setTimeout(()=>triggerPageTransition(location.hash), 80);

  // Scroll progress + header + toTop
  const bar = $('#scrollProgress'), toTop = $('#toTop');
  const onScroll = ()=>{
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = (p*100)+'%';
    toTop.classList.toggle('show', h.scrollTop>600);
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  function syncHeader(){ header?.classList.toggle('scrolled', window.scrollY > 24); }
  document.addEventListener('scroll', syncHeader, {passive:true}); syncHeader();
  toTop.addEventListener('click',()=>scrollToSection('#home'));

  // Mobile menu (nav const defined above for scroll handler)
  menuBtn.addEventListener('click',()=>{
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open?'Close menu':'Open menu');
  });
  $$('.nav-link',nav).forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

  // Active nav highlighting
  const links = $$('.nav-link');
  const secs = links.map(a=>$(a.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ links.forEach(l=>l.classList.toggle('is-active', l.getAttribute('href')==='#'+e.target.id)); }});
  },{rootMargin:'-40% 0px -55% 0px'});
  secs.forEach(s=>io.observe(s));

  // Reveal on scroll — 3D entrances with stagger
  // Auto-assign directions: left col slides from left, right col from right
  $$('.two-col').forEach(grid=>{
    const kids = [...grid.children];
    if(kids[0] && !kids[0].dataset.reveal) kids[0].dataset.reveal = 'left';
    if(kids[1] && !kids[1].dataset.reveal) kids[1].dataset.reveal = 'right';
  });
  $$('.stats-grid .stat').forEach((el,i)=>{ el.dataset.reveal='zoom'; el.style.transitionDelay=(i*70)+'ms'; });
  $$('.dept-grid .dept-card, .cards-3 > *, .gallery .g-item').forEach((el,i)=>{
    if(!el.dataset.reveal) el.dataset.reveal = (i%2===0) ? 'left' : 'right';
  });
  const rio = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      // clear stagger delay after entrance so hovers stay snappy
      setTimeout(()=>{ e.target.style.transitionDelay=''; }, 900);
      rio.unobserve(e.target);
    }
  }),{threshold:.12, rootMargin:'0px 0px -6% 0px'});
  $$('.reveal').forEach(el=>rio.observe(el));

  // Counters
  const cio = new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting) return; cio.unobserve(e.target);
    const el=e.target, target=+el.dataset.target; const t0=performance.now(), dur=1400;
    const step=(t)=>{ const p=Math.min(1,(t-t0)/dur); el.textContent=Math.round(target*(1-Math.pow(1-p,3))).toLocaleString('en-IN'); if(p<1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }),{threshold:.6});
  $$('.counter').forEach(el=>cio.observe(el));

  // Placement bars
  const bio = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ $$('.bar span',e.target).forEach(s=>s.style.width=s.style.getPropertyValue('--w')); bio.unobserve(e.target);} }),{threshold:.4});
  const bars=$('.bars'); if(bars) bio.observe(bars);

  // Hero slider — 3D directional transitions
  const slides=$$('#heroSlides .slide'), dotsWrap=$('#heroDots'), sBar=$('#sliderBar');
  let cur=0, timer, AUTOPLAY=6000, startT=Date.now();
  slides.forEach((s,i)=>{ s.style.setProperty('--dir', 1); const b=document.createElement('button'); b.setAttribute('aria-label','Go to slide '+(i+1)); b.setAttribute('role','tab'); if(i===0)b.classList.add('is-active'); b.addEventListener('click',()=>go(i,true)); dotsWrap.appendChild(b); });
  const dots=$$('button',dotsWrap);
  function go(i, manual){
    const next=(i+slides.length)%slides.length;
    if(next===cur){ startT=Date.now(); if(manual) restart(); return; }
    const dir = (next > cur || (cur===slides.length-1 && next===0)) ? 1 : -1;
    const prev = slides[cur];
    prev.classList.remove('is-active'); prev.classList.add('is-leaving');
    prev.style.setProperty('--dir', dir);
    setTimeout(()=>prev.classList.remove('is-leaving'), 800);
    cur=next;
    const active = slides[cur];
    active.style.setProperty('--dir', dir);
    // force reflow so 3D entrance replays
    void active.offsetWidth;
    slides.forEach((s,k)=>s.classList.toggle('is-active',k===cur));
    dots.forEach((d,k)=>d.classList.toggle('is-active',k===cur));
    startT=Date.now(); if(manual) restart();
  }
  function restart(){ clearInterval(timer); timer=setInterval(()=>go(cur+1),AUTOPLAY); }
  (function tick(){ const p=((Date.now()-startT)/AUTOPLAY)*100; if(sBar) sBar.style.width=Math.min(100,p)+'%'; requestAnimationFrame(tick); })();
  $('#prevSlide').addEventListener('click',()=>go(cur-1,true));
  $('#nextSlide').addEventListener('click',()=>go(cur+1,true));
  document.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'&&document.activeElement?.closest?.('.hero-slider')) go(cur+1,true); if(e.key==='ArrowLeft'&&document.activeElement?.closest?.('.hero-slider')) go(cur-1,true); });
  restart();
  // pause on hover
  $('.hero-slider').addEventListener('mouseenter',()=>clearInterval(timer));
  $('.hero-slider').addEventListener('mouseleave',restart);

  // Hero video button -> scroll to campus
  $('#heroVideoBtn').addEventListener('click',()=>scrollToSection('#campus'));

  // 3D tilt + hero parallax (desktop, motion-safe only)
  const motionSafe = matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;
  if(motionSafe){
    // Tilt on major cards — subtle rotateX/Y with lift
    $$('.dept-card, .feature, .news, .stat, .place-card, .g-item, .trust').forEach(card=>{
      card.classList.add('tilt');
      let raf = null;
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(()=>{
          card.style.transform = `rotateY(${px*10}deg) rotateX(${-py*10}deg) translateZ(6px)`;
        });
      });
      card.addEventListener('mouseleave', ()=>{
        cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
    // Hero parallax — orbs drift, slider tilts toward cursor
    const hero = $('.hero'), heroSlider = $('.hero-slider');
    const orb1 = $('.orb-1'), orb2 = $('.orb-2');
    if(hero){
      hero.addEventListener('mousemove', e=>{
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        if(orb1) orb1.style.transform = `translate(${px*40}px, ${py*30}px)`;
        if(orb2) orb2.style.transform = `translate(${px*-50}px, ${py*-30}px)`;
        if(heroSlider) heroSlider.style.transform = `rotateY(${px*5}deg) rotateX(${-py*5}deg)`;
      });
      hero.addEventListener('mouseleave', ()=>{
        if(orb1) orb1.style.transform = ''; if(orb2) orb2.style.transform = '';
        if(heroSlider) heroSlider.style.transform = '';
      });
    }
  }

  // About tabs
  const tabs=$$('.tab');
  tabs.forEach(t=>t.addEventListener('click',()=>{
    tabs.forEach(x=>{x.classList.remove('is-active'); x.setAttribute('aria-selected','false');});
    t.classList.add('is-active'); t.setAttribute('aria-selected','true');
    $$('.tab-panel').forEach(p=>p.classList.toggle('is-active', p.id==='panel-'+t.dataset.tab));
  }));

  // Departments data + interaction
  const DEPTS={
    cse:{title:'CSE — Computer Science & Engineering', img:'images/CSE-Banner-copy-scaled_0sl8.jpg', desc:'AI/ML, cybersecurity, cloud and full-stack tracks with 24×7 coding labs, hackathons and product internships from year two.', points:['Seats: 240 + honours in AI & Data Science','Labs: HPC, Networks, Project Factory','Clubs: FOSS, GDSC, CP & CTF teams']},
    ece:{title:'ECE — Electronics & Communication', img:'images/ChatGPT-Image-Jun-2-2026-11_23_49-AM-copy_0sl8.jpg', desc:'VLSI, embedded, IoT and 5G labs with Cadence/Synopsys flow and industry tape-out exposure.', points:['Seats: 180 · M.Tech VLSI Design','Labs: DSP, Microwave, Fabrication','Chapters: IEEE ComSoc, IETE']},
    eee:{title:'EEE — Electrical & Electronics', img:'images/eee-1_0sl8.jpg', desc:'Power systems, EV drives and smart-grid research with France Connect exchange and industrial visits.', points:['Seats: 120 · M.Tech Power Electronics','Labs: Machines, Drives, Smart Grid','Add-on: EV & Energy Audit cert.']},
    eie:{title:'EIE — Electronics & Instrumentation', img:'images/EIE-COVER-PAGE-scaled_0sl8.png', desc:'Sensors, control and industrial automation — PLC/SCADA, process loops and biomedical instrumentation.', points:['Seats: 60 · M.Tech Control & Instr.','Labs: Transducers, Process Control','Careers: Core + IT dual track']},
    me:{title:'ME — Mechanical Engineering', img:'images/ME-1-e1790583360376_0sl8.jpeg', desc:'Design, thermal and manufacturing with CNC, composites and robotics cells plus ASME chapter builds.', points:['Seats: 120 · M.Tech Production','Labs: CAD/CAM, Thermal, Metrology','Flagship: Go-kart & EV buggy teams']},
    ce:{title:'CE — Civil Engineering', img:'images/Surveying-scaled-1_0sl8.jpg', desc:'Structures, geotech and sustainable construction with total-station surveying camps and site internships.', points:['Seats: 60 · M.Tech Structural Engg.','Labs: Concrete, Soil, Highway','Field: Live-site studios each sem']},
    mca:{title:'MCA · MBA · Sciences & Humanities', img:'images/mca1-scaled-e1658138621201_0sl8.jpeg', desc:'Applications, analytics and management plus strong S&H foundation in maths, physics and communication.', points:['MCA 120 · MBA 60 · PhD guides','Labs: Data Science, Language Lab','Cell: Startup & incubation desk']}
  };
  const cards=$$('.dept-card'), dImg=$('#deptImg'), dTitle=$('#deptTitle'), dDesc=$('#deptDesc'), dPoints=$('#deptPoints');
  const deptDetail = $('#deptDetail');
  function selectDept(key, card){
    const d=DEPTS[key]; if(!d) return;
    cards.forEach(c=>c.classList.remove('is-active')); card?.classList.add('is-active');
    // 3D card swap — quick rotateY out/in
    if(motionSafe && deptDetail && !reduceMotion){
      deptDetail.style.transition = 'transform .22s ease-in, opacity .22s';
      deptDetail.style.transform = 'rotateY(12deg) translateZ(-30px)';
      deptDetail.style.opacity = '.4';
      setTimeout(()=>{
        dImg.src=d.img; dImg.alt=d.title; dTitle.textContent=d.title; dDesc.textContent=d.desc;
        dPoints.innerHTML=d.points.map(p=>`<li>${p}</li>`).join('');
        deptDetail.style.transition = 'transform .38s cubic-bezier(.2,.7,.2,1.2), opacity .3s';
        deptDetail.style.transform = 'rotateY(0) translateZ(0)';
        deptDetail.style.opacity = '1';
        setTimeout(()=>{ deptDetail.style.transition=''; deptDetail.style.transform=''; deptDetail.style.opacity=''; }, 420);
      }, 200);
    } else {
      dImg.src=d.img; dImg.alt=d.title; dTitle.textContent=d.title; dDesc.textContent=d.desc;
      dPoints.innerHTML=d.points.map(p=>`<li>${p}</li>`).join('');
    }
  }
  cards.forEach(c=>{
    const k=c.dataset.dept;
    c.addEventListener('click',()=>selectDept(k,c));
    c.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selectDept(k,c);} });
  });
  $('#deptSearch').addEventListener('input',e=>{
    const q=e.target.value.trim().toLowerCase();
    cards.forEach(c=>{
      const hit = !q || (c.dataset.tags+' '+c.textContent.toLowerCase()).includes(q);
      c.style.display = hit?'':'none';
    });
  });

  // Replayable pop-in for newly shown items (CSS .flash keyframes)
  function flashShown(items){
    if(reduceMotion) return;
    items.forEach(el=>{
      if(el.style.display==='none') return;
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    });
  }

  document.addEventListener('animationend', e=>{
    if(e.target.classList?.contains('flash')) e.target.classList.remove('flash');
  });

  // Gallery filter + lightbox
  const gItems=$$('.g-item');
  $$('#campus .filter').forEach(b=>b.addEventListener('click',()=>{
    $$('#campus .filter').forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active');
    const f=b.dataset.filter;
    gItems.forEach(g=>g.style.display=(f==='all'||g.dataset.cat===f)?'':'none');
    flashShown(gItems);
  }));
  const lb=$('#lightbox'), lbImg=$('#lbImg'), lbCap=$('#lbCap');
  let lbList=[...gItems], lbIdx=0;
  function openLb(item){
    lbList=gItems.filter(g=>g.style.display!=='none');
    lbIdx=Math.max(0,lbList.indexOf(item));
    renderLb(); lb.hidden=false; $('#lbClose').focus(); document.body.style.overflow='hidden';
  }
  function renderLb(){ const g=lbList[lbIdx]; const img=$('img',g); lbImg.src=img.src; lbImg.alt=img.alt; lbCap.textContent=(g.dataset.caption||img.alt)+`  (${lbIdx+1}/${lbList.length})`; }
  function closeLb(){ lb.hidden=true; document.body.style.overflow=''; }
  gItems.forEach(g=>g.addEventListener('click',()=>openLb(g)));
  $('#lbClose').addEventListener('click',closeLb);
  $('#lbPrev').addEventListener('click',()=>{ lbIdx=(lbIdx-1+lbList.length)%lbList.length; renderLb(); });
  $('#lbNext').addEventListener('click',()=>{ lbIdx=(lbIdx+1)%lbList.length; renderLb(); });
  lb.addEventListener('click',e=>{ if(e.target===lb) closeLb(); });
  document.addEventListener('keydown',e=>{ if(lb.hidden) return; if(e.key==='Escape') closeLb(); if(e.key==='ArrowRight') $('#lbNext').click(); if(e.key==='ArrowLeft') $('#lbPrev').click(); });

  // News filter + modal
  const newsCards=$$('#newsGrid .news');
  $$('.news-filters .filter').forEach(b=>b.addEventListener('click',()=>{
    $$('.news-filters .filter').forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active');
    const f=b.dataset.news; newsCards.forEach(n=>n.style.display=(f==='all'||n.dataset.cat===f)?'':'none');
    flashShown(newsCards);
  }));
  const STORIES={
    n1:{t:'Triple crown: rankings 2026', b:'FISAT secured CSR 3rd nationally, Times Engineering No.1 in Kerala and THE WEEK 2nd among private colleges in Kerala — driven by placement outcomes, research output and student support scores.'},
    n2:{t:'Bharatham & technical conclaves', b:'Three-day fest with 2,000+ participants: project expo, line-follower robotics, hack-night, and alumni panels on careers in product, core and research.'},
    n3:{t:'France Connect pathway', b:'EEE hosted Campus France: MS in power, automation and signal processing, scholarships, and 6-month industry internships for selected students.'},
    n4:{t:'Sustainable manufacturing conference', b:'ME national conference: 80+ papers, keynotes from automotive and energy sectors, live CNC/composites demos for UG students.'},
    n5:{t:'Autonomous curriculum refresh', b:'40+ new electives and minors in AI, EV, Cybersecurity and Construction Tech. Mandatory internship + capstone with industry mentors.'},
    n6:{t:'NAAC A+ & NBA', b:'Six B.Tech programs NBA accredited through 2027. ISO 21001 surveillance completed with appreciation for mentoring and lab safety systems.'}
  };
  const modal=$('#newsModal'), mT=$('#modalTitle'), mB=$('#modalBody');
  $$('[data-modal]').forEach(btn=>btn.addEventListener('click',()=>{
    const s=STORIES[btn.dataset.modal]; if(!s) return;
    mT.textContent=s.t; mB.textContent=s.b; modal.hidden=false; $('#modalClose').focus();
  }));
  $('#modalClose').addEventListener('click',()=>modal.hidden=true);
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.hidden=true; });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') modal.hidden=true; });

  // Testimonials
  const quotes=$$('#testiTrack blockquote'), tDots=$('#testiDots'); let ti=0, tTimer;
  quotes.forEach((_,i)=>{ const b=document.createElement('button'); if(i===0)b.classList.add('is-active'); b.setAttribute('aria-label','Show testimonial '+(i+1)); b.addEventListener('click',()=>tGo(i,true)); tDots.appendChild(b); });
  const tBtns=$$('button',tDots);
  function tGo(i,man){ ti=(i+quotes.length)%quotes.length; quotes.forEach((q,k)=>q.classList.toggle('is-active',k===ti)); tBtns.forEach((d,k)=>d.classList.toggle('is-active',k===ti)); if(man) tRestart(); }
  function tRestart(){ clearInterval(tTimer); tTimer=setInterval(()=>tGo(ti+1),5000); }
  $('#tPrev').addEventListener('click',()=>tGo(ti-1,true)); $('#tNext').addEventListener('click',()=>tGo(ti+1,true)); tRestart();

  // Forms
  const form=$('#enquiryForm'), note=$('#formNote');
  function setErr(input,msg){ const f=input.closest('.field'); if(!f) return; f.classList.toggle('invalid',!!msg); const s=$('.err',f); if(s) s.textContent=msg||''; }
  form.addEventListener('submit',e=>{
    e.preventDefault(); let ok=true;
    const name=$('#fName'), phone=$('#fPhone'), email=$('#fEmail'), course=$('#fCourse');
    if(name.value.trim().length<3){ setErr(name,'Enter your full name.'); ok=false; } else setErr(name,'');
    if(!/^[6-9]\d{9}$/.test(phone.value.replace(/[\s-]/g,''))){ setErr(phone,'Enter a valid 10-digit mobile number.'); ok=false; } else setErr(phone,'');
    if(email.value && !/^\S+@\S+\.\S+$/.test(email.value)){ setErr(email,'Enter a valid email or leave blank.'); ok=false; } else setErr(email,'');
    if(!course.value){ setErr(course,'Choose a program.'); ok=false; } else setErr(course,'');
    if(!$('#fConsent').checked){ note.textContent='Please accept the contact consent to continue.'; note.className='form-note bad'; return; }
    if(!ok){ note.textContent='Please fix the highlighted fields.'; note.className='form-note bad'; return; }
    note.textContent='Thanks '+name.value.trim().split(' ')[0]+'! Counsellor will call about '+course.value+' shortly.'; note.className='form-note ok';
    form.reset(); setTimeout(()=>note.textContent='',6000);
  });
  $('#newsForm').addEventListener('submit',e=>{ e.preventDefault(); const em=$('#nEmail'); if(!/^\S+@\S+\.\S+$/.test(em.value)){ $('#newsNote').textContent='Enter a valid email.'; return; } $('#newsNote').textContent='Subscribed! Welcome to FISAT updates.'; em.value=''; });
})();
