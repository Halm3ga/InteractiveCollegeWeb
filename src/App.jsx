import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import campusMap from '../images.jpg';
import appleLabImage from '../Explorere/Apple lab.jpg';
import businessEntranceImage from '../Explorere/Fisat buisness school entrance_.jpg';
import canteenImage from '../Explorere/Canteen.jpg';
import businessOfficeImage from '../Explorere/Fisat buisness school office.jpg';
import ideaLabImage from '../Explorere/Idea Lab.jpg';
import microsoftHallwayImage from '../Explorere/Microsoft_Apple hallway.jpg';
import northBlockMainImage from '../Explorere/North block.jpg';
import northBlockAltImage from '../Explorere/North block(1).jpg';
import southBlockMainImage from '../Explorere/South block.jpg';
import southBlockAltImage from '../Explorere/South block2.jpg';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Departments', href: '#departments' },
  { label: 'Campus', href: '#campus' },
  { label: 'Innovation', href: '#innovation' },
  { label: 'Placements', href: '#placements' },
  { label: 'News', href: '#news' },
  { label: 'Contact', href: '#contact' },
];

const stats = [
  { value: '24+', label: 'Years of excellence' },
  { value: '2800+', label: 'Students on campus' },
  { value: '200+', label: 'Faculty & mentors' },
  { value: '120+', label: 'Recruiters annually' },
  { value: '92%', label: 'Placement assistance' },
];

const departments = [
  { name: 'CSE', title: 'Computer Science & Engineering', tag: 'AI • Cloud • Cyber', image: '/images/CSE-Banner-copy-scaled_0sl8.jpg' },
  { name: 'ECE', title: 'Electronics & Communication', tag: 'VLSI • IoT • 5G', image: '/images/ChatGPT-Image-Jun-2-2026-11_23_49-AM-copy_0sl8.jpg' },
  { name: 'EEE', title: 'Electrical & Electronics', tag: 'Power • EV • Grid', image: '/images/eee-1_0sl8.jpg' },
  { name: 'ME', title: 'Mechanical Engineering', tag: 'Design • Robotics', image: '/images/ME-1-e1790583360376_0sl8.jpeg' },
  { name: 'CE', title: 'Civil Engineering', tag: 'Structures • Survey', image: '/images/Surveying-scaled-1_0sl8.jpg' },
  { name: 'MBA', title: 'Management & Applied Sciences', tag: 'Leadership • Analytics', image: '/images/mca1-scaled-e1658138621201_0sl8.jpeg' },
];

const placements = [
  { name: 'TCS', value: 94 },
  { name: 'Infosys', value: 89 },
  { name: 'Wipro', value: 82 },
  { name: 'Cognizant', value: 76 },
  { name: 'Accenture', value: 73 },
];

const STORAGE_KEY = 'fisat-campus-zones-v2';

const campusZones = [
  {
    id: 'north-block',
    label: 'North Block',
    tag: 'Academic wing',
    title: 'North Block',
    description: 'North Block is one of the primary academic zones on campus, housing core learning spaces and student-focused activity.',
    x: 22,
    y: 30,
    images: [
      { src: northBlockMainImage, alt: 'North Block', label: 'North Block' },
      { src: northBlockAltImage, alt: 'North block second view', label: 'North block view' },
      { src: '', alt: '', label: '' },
    ],
  },
  {
    id: 'south-block',
    label: 'South Block',
    tag: 'Learning zone',
    title: 'South Block',
    description: 'South Block continues the academic structure of the campus and supports the day-to-day teaching and learning experience.',
    x: 38,
    y: 58,
    images: [
      { src: southBlockMainImage, alt: 'South Block academic zone', label: 'South academic' },
      { src: southBlockAltImage, alt: 'South block second view', label: 'South block view' },
      { src: '', alt: '', label: '' },
    ],
  },
  {
    id: 'decennial-block',
    label: 'Decennial Block',
    tag: 'Heritage zone',
    title: 'Decennial Block',
    description: 'Decennial Block marks a key landmark area of the campus, representing a major academic and institutional identity within the campus layout.',
    x: 52,
    y: 34,
    images: [
      { src: appleLabImage, alt: 'Apple lab', label: 'Apple lab' },
      { src: ideaLabImage, alt: 'Idea lab', label: 'Idea lab' },
      { src: microsoftHallwayImage, alt: 'Microsoft Apple hallway', label: 'Microsoft_Apple_hallway' },
    ],
  },
  {
    id: 'main-block',
    label: 'Main Block',
    tag: 'Campus core',
    title: 'Main Block',
    description: 'Main Block is the central campus landmark where the core academic identity and institutional activity are most visibly represented.',
    x: 69,
    y: 44,
    images: [
      { src: ideaLabImage, alt: 'Idea lab', label: 'Idea lab' },
      { src: '', alt: '', label: '' },
      { src: '', alt: '', label: '' },
    ],
  },
  {
    id: 'eatery',
    label: 'eatery',
    tag: 'Campus life',
    title: 'eatery',
    description: 'The eatery is a daily social and communal space that supports student life, breaks, and informal interaction across the campus.',
    x: 84,
    y: 58,
    images: [
      { src: canteenImage, alt: 'Canteen image', label: 'canteen' },
      { src: '', alt: '', label: '' },
      { src: '', alt: '', label: '' },
    ],
  },
];

const loadSavedZones = () => {
  try {
    localStorage.removeItem('fisat-campus-zones-v1');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return campusZones;

    const savedZones = JSON.parse(raw);
    if (!Array.isArray(savedZones)) return campusZones;

    const savedMap = new Map(
      savedZones
        .filter((zone) => zone && zone.id)
        .map((zone) => [zone.id, zone])
    );

    return campusZones.map((zone) => {
      const saved = savedMap.get(zone.id);
      const x = Number.isFinite(saved?.x) ? saved.x : zone.x;
      const y = Number.isFinite(saved?.y) ? saved.y : zone.y;

      return {
        ...zone,
        x,
        y,
      };
    });
  } catch (error) {
    console.error('Failed to load campus coordinates', error);
    return campusZones;
  }
};

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('#home');
  const [campusZonesState, setCampusZonesState] = useState(loadSavedZones);
  const [activeZone, setActiveZone] = useState(() => loadSavedZones()[0]);
  const [draggingZoneId, setDraggingZoneId] = useState(null);
  const mapFrameRef = useRef(null);

  useEffect(() => {
    const savedZones = campusZonesState.map(({ id, x, y }) => ({ id, x, y }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedZones));
  }, [campusZonesState]);

  useEffect(() => {
    setActiveZone((current) => campusZonesState.find((zone) => zone.id === current.id) || campusZonesState[0]);
  }, [campusZonesState]);

  useEffect(() => {
    if (!draggingZoneId) return;

    const handlePointerMove = (event) => {
      const frame = mapFrameRef.current;
      if (!frame) return;

      const rect = frame.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      setCampusZonesState((current) =>
        current.map((zone) =>
          zone.id === draggingZoneId
            ? {
                ...zone,
                x: Math.min(Math.max(x, 6), 94),
                y: Math.min(Math.max(y, 10), 90),
              }
            : zone
        )
      );
    };

    const handlePointerUp = () => setDraggingZoneId(null);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingZoneId]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero__item', {
        y: 28,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
      });

      gsap.from('.reveal', {
        y: 34,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.06,
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      gsap.to('.mobile-nav', {
        y: -18,
        opacity: 0,
        autoAlpha: 0,
        duration: 0.26,
        ease: 'power2.inOut',
      });
      return;
    }

    gsap.to('.mobile-nav', {
      y: 0,
      opacity: 1,
      autoAlpha: 1,
      duration: 0.38,
      ease: 'power3.out',
    });
  }, [mobileOpen]);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveNav(`#${visible.target.id}`);
        }
      },
      { threshold: [0.25, 0.5, 0.7], rootMargin: '-10% 0px -20% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const zoomTimeline = gsap.timeline();

    zoomTimeline
      .fromTo(
        '.campus-map-image',
        { scale: 1 },
        { scale: 1.12, duration: 0.7, ease: 'power3.inOut' }
      )
      .to('.campus-map-image', {
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
      });

    zoomTimeline.fromTo(
      '.collage-card',
      { opacity: 0, x: 32, y: 18 },
      { opacity: 1, x: 0, y: 0, duration: 0.45, stagger: 0.12, ease: 'power2.out' },
      '-=0.3'
    );

    return () => zoomTimeline.kill();
  }, [activeZone]);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    setActiveNav(href);

    const target = document.querySelector(href);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="site-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">
            <img src="/images/fisat-logo_0sl8.png" alt="FISAT" />
          </div>
          <div className="brand-copy">
            <span className="brand-name">FISAT</span>
            <span className="brand-sub">Future. Focus. Foundation.</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className={activeNav === item.href ? 'nav-link active' : 'nav-link'}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-meta">
          <span>Admissions 2026</span>
          <span>Apply now</span>
        </div>
      </aside>

      <div className="page-shell">
        <header className="topbar">
          <div className="topbar__left">
            <span className="topbar__label">FISAT / Engineering for the next era</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle mobile navigation"
            className="menu-button"
          >
            <span>Menu</span>
            <span className="menu-icon">
              <span className={mobileOpen ? 'line line--top open' : 'line line--top'} />
              <span className={mobileOpen ? 'line line--mid open' : 'line line--mid'} />
              <span className={mobileOpen ? 'line line--bottom open' : 'line line--bottom'} />
            </span>
          </button>
        </header>

        {mobileOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className={activeNav === item.href ? 'mobile-link active' : 'mobile-link'}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <main className="content">
          <section id="home" className="panel hero reveal">
            <div className="hero__content">
              <div className="hero__item hero__eyebrow">Engineering for the next era</div>
              <h1 className="hero__item hero__title">
                Designing the future <span>with ambition</span> at every step.
              </h1>
              <p className="hero__item hero__text">
                A premier engineering institution shaping students through innovation, research, leadership, and outcomes that reach beyond campus.
              </p>

              <div className="hero__item hero__actions">
                <button type="button" onClick={() => handleNavClick('#contact')} className="primary-btn">Explore Admissions</button>
                <button type="button" onClick={() => handleNavClick('#departments')} className="secondary-btn">View Programs</button>
              </div>
            </div>

            <div className="hero__media hero__item">
              <div className="media-frame">
                <img src="/images/FISAT_0sl8.jpeg" alt="FISAT campus" />
              </div>
              <div className="media-badge">
                <span>Campus life</span>
                <strong>Ranked & rising</strong>
              </div>
            </div>
          </section>

          <section className="panel metrics reveal">
            <div className="metrics-grid">
              {stats.map((stat) => (
                <div key={stat.label} className="metric-card">
                  <div className="metric-value">{stat.value}</div>
                  <div className="metric-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="about" className="panel about reveal">
            <div className="section-heading">
              <span>About FISAT</span>
              <h2>A campus shaped for growth, creativity, and real world momentum.</h2>
            </div>

            <div className="about-grid">
              <div className="about-copy">
                <p>
                  FISAT has built a culture of academic excellence and student-led innovation, combining deep engineering foundations with creative exploration, mentorship, and a strong sense of community.
                </p>

                <div className="pill-group">
                  <span>Mission</span>
                  <span>Vision</span>
                  <span>Why FISAT</span>
                </div>

                <div className="statement-box">
                  To provide world-class engineering education that helps students lead responsibly, innovate confidently, and create impact in every field they pursue.
                </div>
              </div>

              <div className="about-images">
                <img className="img-lg" src="/images/IMG_20200125_223711_837-scaled-1-e1658661535425_0sl8.jpg" alt="Academic block" />
                <img src="/images/library-scaled_0sl8.jpg" alt="Library" />
                <img src="/images/DSC02156-scaled-e1707299276592_0sl8.jpg" alt="Students" />
              </div>
            </div>
          </section>

          <section id="departments" className="panel reveal">
            <div className="section-heading split">
              <div>
                <span>Academics</span>
                <h2>Find your department.</h2>
              </div>
              <div className="tag">7 schools · 15+ programs</div>
            </div>

            <div className="departments-grid">
              <div className="department-cards">
                {departments.map((dept) => (
                  <article key={dept.name} className="department-card">
                    <img src={dept.image} alt={dept.name} />
                    <div className="department-body">
                      <span className="department-tag">{dept.tag}</span>
                      <h3>{dept.name}</h3>
                      <p>{dept.title}</p>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="spotlight-panel">
                <img src="/images/cse-banner_0sl8.jpg" alt="CSE featured" />
                <h3>CSE — Computer Science & Engineering</h3>
                <p>AI/ML, cloud, cybersecurity and product engineering with a strong maker culture from the very start.</p>
                <ul>
                  <li>Seats: 240 + honours in AI & Data Science</li>
                  <li>Labs: HPC, Networks, Project Factory</li>
                  <li>Clubs: FOSS, GDSC, CP & CTF teams</li>
                </ul>
              </aside>
            </div>
          </section>

          <section id="campus" className="panel reveal">
            <div className="section-heading split">
              <div>
                <span>Campus life</span>
                <h2>A living campus built for learning.</h2>
              </div>
              <div className="tag">Live learning · Research · Culture</div>
            </div>

            <div className="gallery-grid">
              {[
                { src: '/images/IMG_20200125_223711_837-scaled-1-e1658661535425_0sl8.jpg', label: 'Academic block' },
                { src: '/images/library-scaled_0sl8.jpg', label: 'Learning spaces' },
                { src: '/images/DSC02156-scaled-e1707299276592_0sl8.jpg', label: 'Student collaboration' },
                { src: '/images/FISAT_0sl8.jpeg', label: 'Campus view' },
              ].map((image) => (
                <figure key={image.label} className="gallery-card">
                  <img src={image.src} alt={image.label} />
                  <figcaption>{image.label}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section id="campus" className="panel reveal campus-section">
            <div className="section-heading split">
              <div>
                <span>Campus explorer</span>
                <h2>Explore the campus by moment, space, and story.</h2>
              </div>
              <div className="tag">Interactive map · collage view</div>
            </div>

            <div className="campus-explorer">
              <div className="campus-map-shell">
                <div className="campus-map-frame" ref={mapFrameRef}>
                  <img className="campus-map-image" src={campusMap} alt="FISAT campus map" />

                  <div className="drag-hint">Drag labels to reposition</div>

                  {campusZonesState.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      className={activeZone.id === zone.id ? 'campus-hotspot active' : 'campus-hotspot'}
                      style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                      onClick={() => setActiveZone(zone)}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        setDraggingZoneId(zone.id);
                        setActiveZone(zone);
                      }}
                    >
                      <span>{zone.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="campus-info-panel">
                <div className="campus-focus-card">
                  <span className="campus-focus-tag">{activeZone.tag}</span>
                  <h3>{activeZone.title}</h3>
                  <p>{activeZone.description}</p>
                </div>

                <div className="collage-stage" aria-live="polite">
                  {activeZone.images
                    .filter((item) => item && item.src)
                    .map((item, index) => (
                      <div key={`${activeZone.id}-${item.label || index}`} className="collage-card" style={{ animationDelay: `${index * 120}ms` }}>
                        <img src={item.src} alt={item.alt} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>

          <section id="innovation" className="panel reveal">
            <div className="section-heading">
              <span>Innovation</span>
              <h2>Built for experimentation and impact.</h2>
            </div>

            <div className="innovation-grid">
              {[
                { title: 'IDEA Lab', text: '3D printers, laser cutters, CNC, PCB milling and fabrication for student innovation.', badge: 'Prototype' },
                { title: 'Centre for Future Skills', text: 'AI, cloud, cybersecurity, automation and product engineering training from day one.', badge: 'Career Ready' },
                { title: 'Research Culture', text: 'Faculty-guided projects, funding support and industry-linked problem solving.', badge: 'Research' },
              ].map((item) => (
                <article key={item.title} className="innovation-card">
                  <span className="mini-badge">{item.badge}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="placements" className="panel reveal placement-panel">
            <div className="placement-copy">
              <span>Placements</span>
              <h2>Career outcomes built for impact.</h2>
              <p>FISAT prepares students with mentoring, employer connection, and project experience that turns potential into opportunity.</p>

              <div className="bars">
                {placements.map((company) => (
                  <div key={company.name} className="bar-row">
                    <span>{company.name}</span>
                    <div className="bar-track"><i style={{ width: `${company.value}%` }} /></div>
                    <strong>{company.value}%</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="quote-card">
              <img src="/images/IDEA-LAB-BANNER-scaled_0sl8.jpg" alt="Placement highlight" />
              <blockquote>
                “The placement experience here is hands-on, practical and deeply supportive — from resume building to final interviews.”
              </blockquote>
            </div>
          </section>

          <section id="news" className="panel reveal">
            <div className="section-heading">
              <span>News</span>
              <h2>Latest stories and updates.</h2>
            </div>

            <div className="news-grid">
              {[
                { title: 'National rankings momentum', description: 'FISAT continues to strengthen outcomes with strong research, placements and student support.' },
                { title: 'Tech conclaves and projects', description: 'Robotics, coding and design workshops shape student curiosity into applied learning.' },
                { title: 'Industry partnerships', description: 'New tie-ups continue to expand domain exposure and internship opportunities across schools.' },
              ].map((item, index) => (
                <article key={item.title} className="news-card">
                  <small>News {index + 1}</small>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="contact" className="panel reveal contact-panel">
            <div className="contact-copy">
              <span>Admissions</span>
              <h2>Let’s shape your next chapter.</h2>
              <div className="contact-card">
                <p>FISAT, Mookkannoor, Angamaly, Kerala 683577</p>
                <p>admissions@fisat.ac.in</p>
                <p>+91 484 272 1234</p>
              </div>
            </div>

            <form className="contact-form">
              <label>
                <span>Full name</span>
                <input type="text" placeholder="Your name" />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" placeholder="Mobile number" />
              </label>
              <label className="full-width">
                <span>Email</span>
                <input type="email" placeholder="name@example.com" />
              </label>
              <label className="full-width">
                <span>Program of interest</span>
                <select>
                  <option>B.Tech</option>
                  <option>M.Tech</option>
                  <option>MCA</option>
                  <option>MBA</option>
                  <option>Research</option>
                </select>
              </label>
              <button type="submit" className="primary-btn full-width">Request counselling</button>
            </form>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-grid">
            <div>
              <div className="brand-footer">FISAT</div>
              <p>Autonomous and industry-led engineering education for future-ready careers.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li>About</li>
                <li>Departments</li>
                <li>Placements</li>
                <li>Admissions</li>
              </ul>
            </div>
            <div>
              <h4>Programs</h4>
              <ul>
                <li>B.Tech</li>
                <li>M.Tech</li>
                <li>MCA</li>
                <li>MBA</li>
              </ul>
            </div>
            <div>
              <h4>Visit</h4>
              <ul>
                <li>Angamaly, Kerala</li>
                <li>Mon-Sat</li>
                <li>9:00 AM - 4:30 PM</li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
