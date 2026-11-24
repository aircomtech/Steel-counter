"use client";

import { useEffect, useState } from "react";

const ENQUIRY_EMAIL = "hydsales@contoursteel.co.in";

const capabilities = [
  { n: "01", title: "Pre-Engineered Buildings", text: "Optimized primary and secondary framing engineered for speed, economy and dependable performance." },
  { n: "02", title: "Turnkey Project Delivery", text: "One accountable partner—from concept to design, engineering and detailing through fabrication, dispatch and erection." },
  { n: "03", title: "Steel Structures", text: "Factories, warehouses, workshops, showrooms, convention centres, commercial buildings, logistics facilities and custom long-span applications." },
  { n: "04", title: "Accessories & Systems", text: "Mezzanines, crane beams, roofing, cladding, ventilation and integrated building accessories." },
];

const applications = ["Factories", "Warehouses", "Commercial", "Convention", "Institutional", "Heavy Industry"];

const projectGallery = [
  { image: "/project-industrial-complex-aerial.jpeg", title: "Industrial Manufacturing Complex", type: "Aerial View" },
  { image: "/project-process-plant.jpeg", title: "Process Plant Structure", type: "Industrial" },
  { image: "/project-multistorey-facility.jpeg", title: "Multi-Storey Industrial Facility", type: "Industrial" },
  { image: "/project-preengineered-warehouse.jpeg", title: "Pre-Engineered Warehouse", type: "Completed Project" },
  { image: "/new-project-dark-facility.jpeg", title: "Modern Industrial Facility", type: "Completed Project" },
  { image: "/new-project-green-facility.jpeg", title: "Manufacturing Facility", type: "Completed Project" },
  { image: "/new-project-blue-facility.jpeg", title: "Pre-Engineered Factory", type: "Completed Project" },
  { image: "/new-project-herbochem.png", title: "Industrial Facility", type: "" },
  { image: "/new-project-steel-frame.jpeg", title: "Industrial Steel Frame", type: "Work in Progress" },
  { image: "/new-project-multilevel-frame.jpeg", title: "Multi-Level Steel Structure", type: "Work in Progress" },
  { image: "/new-project-roofing-progress.jpeg", title: "Roofing & Structural Progress", type: "Work in Progress" },
  { image: "/steel-erection-aerial-02.jpeg", title: "Roof Framing Installation", type: "Work in Progress" },
  { image: "/steel-structure-erection.jpeg", title: "Multi-Storey Steel Structure — Erection", type: "Work in Progress" },
  { image: "/hmda-truck-dock-logistics-township.jpeg", title: "HMDA Truck Dock Logistics Township", type: "Logistics" },
  { image: "/warehouse-cluster.jpeg", title: "Warehouse Cluster", type: "Logistics" },
  { image: "/warehouse-interior-racking.jpeg", title: "Warehouse Interior & Racking", type: "Completed Project" },
  { image: "/netra-furniture-mall.jpeg", title: "Netra Furniture Mall", type: "Commercial" },
  { image: "/multi-level-steel-frame-01.jpeg", title: "Multi-Level Steel Frame", type: "Structural Steel" },
  { image: "/decking-installation.jpeg", title: "Decking Installation", type: "Work in Progress" },
  { image: "/project-progress-aerial.jpeg", title: "Project Progress — Aerial View", type: "Work in Progress" },
  { image: "/boiler-house.jpg", title: "Boiler House", type: "Industrial" },
  { image: "/car-showroom.jpg", title: "Car Showroom", type: "Commercial" },
  { image: "/cold-storage.jpg", title: "Cold Storage", type: "Temperature Controlled" },
  { image: "/feed-mill.jpg", title: "Feed Mill", type: "Agri Industrial" },
  { image: "/logistics-ware-house.jpg", title: "Logistics Warehouse", type: "Logistics" },
  { image: "/refinery.jpg", title: "Refinery Structure", type: "Heavy Industrial" },
  { image: "/steel-rolling-mill.jpg", title: "Steel Rolling Mill", type: "Heavy Industrial" },
];

const standards = ["IS Building Codes", "AISC Steel Construction Manual", "AISI Cold-Formed Steel Specification", "MBMA Recommended Design Practices", "ASTM", "American Welding Society (AWS)", "IS 875 — Wind Loads", "Uniform Building Code (UBC)"];

const heroSlides = [
  { image: "/new-project-dark-facility.jpeg", video: "https://www.contoursteel.co.in/video/home.mp4", kicker: "19 years of steel-building expertise", title: "Engineering certainty. From concept to completion.", copy: "Turnkey pre-engineered building solutions designed, manufactured and delivered around your commercial goals.", label: "Discover Contour", href: "#about", tag: "About Us" },
  { image: "/boiler-house.jpg", video: null, kicker: "30 million sq. ft. delivered", title: "Build faster. Expand easier. Perform longer.", copy: "Economical structural systems, long clear spans, factory-controlled quality and faster on-site assembly.", label: "Why PEB", href: "#why-peb", tag: "Why PEB" },
  { image: "/facilities.jpg", video: null, kicker: "Total factory area · 20,234 sq. m.", title: "Modern manufacturing. Controlled at every stage.", copy: "Five acres equipped for CNC cutting, H-beam assembly, automated SAW welding, roll forming and secondary fabrication.", label: "Explore Facilities", href: "#facilities", tag: "Facilities" },
  { image: "/multitorch.jpg", video: null, kicker: "International standards", title: "Predictable quality at every stage.", copy: "Structured assurance, control, inspection and planning—from incoming raw material to final dispatch.", label: "Our Quality System", href: "#quality", tag: "Quality" },
  { image: "/new-project-green-facility.jpeg", video: null, kicker: "1,100+ completed projects", title: "Built across industries. Proven in the field.", copy: "Factories, warehouses, mills, commercial facilities and specialist steel structures delivered across India.", label: "View Projects", href: "#projects", tag: "Projects" },
  { image: "/logistics-ware-house.jpg", video: null, kicker: "Let’s build your next project", title: "Start with a conversation. Finish with certainty.", copy: "Share your project location, intended use and approximate area with our Hyderabad or Pune teams.", label: "Contact Our Team", href: "#contact", tag: "Contact" },
];

const achievements = [
  { icon: "XIX", figure: "19", unit: "Years", text: "Of uncompromising quality in steel buildings." },
  { icon: "▦", figure: "1,100+", unit: "Structures", text: "Successfully delivered pan-India." },
  { icon: "□", figure: "30 Million", unit: "Sq. Ft.", text: "Of total engineered PEB space." },
  { icon: "↔", figure: "45-Meter", unit: "Clear Span", text: "Maximum span designed to withstand 180 kmph winds." },
  { icon: "↕", figure: "25-Meter", unit: "Height", text: "Maximum clear building height achieved." },
  { icon: "▤", figure: "11-Floor", unit: "Refinery", text: "Complex vertical engineering for edible-oil plants." },
  { icon: "▰", figure: "200,000", unit: "Sq. Ft.", text: "Our single largest footprint factory building." },
  { icon: "P", figure: "3,000", unit: "Vehicles", text: "Massive five-level multi-level car park infrastructure." },
  { icon: "⌁", figure: "70 + 30 MT", unit: "Load", text: "Maximum EOT crane capacity on a 24-meter clear span." },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    const preventMediaDrag = (event: DragEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("img, video, .heroSlide")) event.preventDefault();
    };
    const preventSaveShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") event.preventDefault();
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("dragstart", preventMediaDrag);
    document.addEventListener("keydown", preventSaveShortcut);
    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("dragstart", preventMediaDrag);
      document.removeEventListener("keydown", preventSaveShortcut);
    };
  }, []);

  const previousSlide = () => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => setActiveSlide((activeSlide + 1) % heroSlides.length);

  return (
    <main>
      <section className="hero" id="home">
        <div className="slideStage" aria-live="polite">
          {heroSlides.map((slide, index) => <div key={slide.tag} className={`heroSlide ${index === activeSlide ? "isActive" : ""}`} style={{ backgroundImage: `url(${slide.image})` }} aria-hidden={index !== activeSlide}>{slide.video && <video className="originalHeroReel" autoPlay muted loop playsInline poster={slide.image}><source src={slide.video} type="video/mp4" /></video>}<div className="heroShade" /></div>)}
        </div>
        <header className="siteHeader shell">
          <a className="brand" href="#home" aria-label="Contour Steel home">
            <span className="slideLogo"><img src="/contour-trademark-2026.png" alt="Contour Steel Engineering India (P) Ltd. trademark" /></span>
          </a>
          <nav className="desktopNav" aria-label="Main navigation">
            <a href="#about">About Us</a><a href="#why-peb">Why PEB</a><a href="#facilities">Facilities</a><a href="#quality">Quality System</a><a href="#projects">Projects</a><a href="#contact">Contact Our Team</a>
          </nav>
          <a className="headerCta" href="#contact">Request a Quote</a>
          <button type="button" className={`menuButton ${menuOpen ? "isOpen" : ""}`} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
        </header>
        <nav id="mobile-navigation" className={`mobileNav ${menuOpen ? "isOpen" : ""}`} aria-label="Mobile navigation">
          <a href="#about" onClick={() => setMenuOpen(false)}>About Us</a>
          <a href="#why-peb" onClick={() => setMenuOpen(false)}>Why PEB</a>
          <a href="#facilities" onClick={() => setMenuOpen(false)}>Facilities</a>
          <a href="#quality" onClick={() => setMenuOpen(false)}>Quality System</a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact Our Team</a>
          <a className="mobileNavCta" href="#contact" onClick={() => setMenuOpen(false)}>Request a Quote <span>→</span></a>
        </nav>

        <div className="heroContent shell" key={activeSlide}>
          <span className="slideLogo heroTrademark"><img src="/contour-trademark-2026.png" alt="Contour Steel Engineering India (P) Ltd. trademark" /></span>
          <p className="eyebrow"><span /> {heroSlides[activeSlide].kicker}</p>
          <h1>{heroSlides[activeSlide].title}</h1>
          <p className="heroCopy">{heroSlides[activeSlide].copy}</p>
          <div className="heroActions">
            <a className="button buttonPrimary" href={heroSlides[activeSlide].href}>{heroSlides[activeSlide].label} <span>↗</span></a>
            <a className="button buttonGhost" href="#contact">Request a Quote <span>→</span></a>
          </div>
        </div>

        <div className="slideControls shell">
          <button type="button" onClick={previousSlide} aria-label="Previous slide">←</button>
          <div className="slideDots">{heroSlides.map((slide, index) => <button key={slide.tag} type="button" className={index === activeSlide ? "active" : ""} onClick={() => setActiveSlide(index)} aria-label={`Show ${slide.tag} slide`}><span>{String(index + 1).padStart(2, "0")}</span>{slide.tag}</button>)}</div>
          <button type="button" onClick={nextSlide} aria-label="Next slide">→</button>
        </div>

        <div className="stats shell" aria-label="Company achievements">
          <div className="achievementLead"><span>Our Achievements</span><b>Steel certainty,<br />proven at scale.</b></div>
          <div><strong>19</strong><span>Years Completed</span></div>
          <div><strong>1,100+</strong><span>Completed Projects</span></div>
          <div><strong>30M</strong><span>Sq. Ft. Delivered</span></div>
        </div>
      </section>

      <section className="intro section shell" id="about">
        <div className="sectionLabel"><span>01</span> About Us</div>
        <div className="introGrid">
          <h2>Engineering certainty into every square foot.</h2>
          <div><p>Contour Steel Engineering India delivers turnkey steel building solutions with international quality standards and commercial discipline.</p><p>Our technical teams support clients from the first enquiry through design, fabrication, delivery and project completion—helping them save time, avoid complexity and build with confidence.</p><a className="textLink" href="#capabilities">Discover our capabilities <span>→</span></a></div>
        </div>
      </section>

      <section className="achievements section" id="achievements">
        <div className="shell">
          <div className="achievementHeader">
            <div className="sectionLabel"><span>Milestones</span> Our Achievements</div>
            <div><h2>19 Years. 1,100+ Structures.<br /><span>Pre-Engineered Buildings (PEB) Without Compromise.</span></h2><p>For nearly two decades, Contour Steel has transformed complex blueprints into robust, scalable steel buildings across India. From sprawling single-floor factories to heavy-duty industrial refineries, we engineer Pre-Engineered Buildings (PEB) that push the boundaries of space, strength and structural integrity.</p></div>
          </div>
          <div className="achievementGrid">{achievements.map((item, index) => <article key={item.unit + item.figure} className={index < 3 ? "featuredAchievement" : ""}><div className="achievementIcon" aria-hidden="true">{item.icon}</div><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.figure}</strong><h3>{item.unit}</h3><p>{item.text}</p></article>)}</div>
        </div>
      </section>

      <section className="capabilities section" id="capabilities">
        <div className="shell">
          <div className="sectionTop"><div className="sectionLabel light"><span>01</span> What we deliver</div><h2>One partner.<br />Every critical stage.</h2></div>
          <div className="capGrid">{capabilities.map((item) => <article key={item.n}><span>{item.n}</span><h3>{item.title}</h3><p>{item.text}</p><a href="#contact" aria-label={`Enquire about ${item.title}`}>↗</a></article>)}</div>
        </div>
      </section>

      <section className="why section shell" id="why-peb">
        <div className="sectionLabel"><span>02</span> Why PEB</div>
        <div className="whyGrid"><div><h2>Build faster. Expand easier. Perform longer.</h2><p>Pre-engineered steel buildings combine factory-controlled quality with faster on-site assembly and flexible future growth.</p></div><ul>{["Faster project delivery", "Economical structural systems", "Long clear spans", "Lower foundation demand", "Easy expansion and relocation", "High seismic performance"].map(x => <li key={x}><span>✓</span>{x}</li>)}</ul></div>
        <div className="applicationStrip">{applications.map(x => <span key={x}>{x}</span>)}</div>
      </section>

      <section className="facilities section shell" id="facilities">
        <div className="sectionTop dark"><div className="sectionLabel"><span>03</span> Facilities</div><div><h2>Five acres equipped from design to dispatch.</h2><p>Contour Steel&apos;s 20,234 sq. m. factory combines an automated H-beam line with CNC cutting, assembly, welding, roll forming and secondary fabrication equipment.</p></div></div>
        <div className="facilityHero"><img src="/facilities.jpg" alt="Contour Steel manufacturing facility" /><div><strong>5 Acres</strong><span>Integrated production facility</span><p>Complete primary and secondary fabrication capability under one controlled manufacturing system.</p></div></div>
        <div className="machineGrid">
          <article><img src="/multitorch.jpg" alt="Multi torch CNC cutting machine" /><div><span>01</span><h3>Multi Torch CNC Cutting</h3><p>High-efficiency, high-precision oxy-fuel cutting combining numerical control with precision machinery transmission.</p></div></article>
          <article><img src="/hbeam.jpg" alt="H beam automatic assembly line" /><div><span>02</span><h3>H-Beam Automatic Assembly</h3><p>Automated assembly and spot welding for symmetrical, asymmetrical, eccentric and variable cross-section H-type steel.</p></div></article>
          <article><img src="/automaticsaw.jpg" alt="Automated submerged arc welding machine" /><div><span>03</span><h3>Automated SAW Welding</h3><p>Two fully automated submerged-arc welding machines deliver consistent weld quality with automatic flux recovery.</p></div></article>
        </div>
        <div className="secondaryFab"><h3>Secondary fabrication & roll forming</h3><p>MIG welding, arc welding, shearing, bending, iron working, drilling and punching support secondary fabrication. The cold-roll forming section produces three profiles, including Z and C purlins with online round/slot punching and pre-cut capability. Roofing accessories—crimping, curving, flashings and four-metre gutters—are produced using hydraulic press brakes and dedicated forming machines.</p></div>
      </section>

      <section className="quality section" id="quality">
        <div className="shell qualityGrid">
          <div><div className="sectionLabel light"><span>04</span> Quality System</div><h2>Predictable quality at every stage.</h2><p>Every manufactured product follows a standard inspection and testing plan. Quality is treated as a continuous process—balancing international standards with economy, buildability, functionality and sustainability.</p></div>
          <div className="qualityList"><div><b>01</b><span><strong>Quality Assurance</strong>A proactive system that improves workflow effectiveness and consistently meets client expectations.</span></div><div><b>02</b><span><strong>Quality Control</strong>Inspection begins with raw-material compliance and continues throughout fabrication and roll forming, with records retained for reference.</span></div><div><b>03</b><span><strong>Quality Planning</strong>Process adherence, improvement plans and good practices maintain high standards across every project.</span></div></div>
        </div>
        <div className="shell standards"><h3>Design & fabrication references</h3><div>{standards.map((standard) => <span key={standard}>{standard}</span>)}</div></div>
      </section>

      <section className="projects section shell" id="projects">
        <div className="sectionTop dark"><div className="sectionLabel"><span>05</span> Projects</div><div><h2>Built across industries. Proven in the field.</h2><p>A selection from Contour Steel&apos;s original portfolio of factories, warehouses, mills, commercial facilities and specialist structures.</p></div></div>
        <div className="galleryGrid">{projectGallery.map((project) => <article key={project.title}><div className="galleryPhoto"><img src={project.image} alt={`${project.title} by Contour Steel`} loading="lazy" /></div><div>{project.type && <span>{project.type}</span>}<h3>{project.title}</h3></div></article>)}</div>
      </section>

      <section className="locations section" id="locations">
        <div className="shell">
          <div className="locationHeader"><div className="sectionLabel"><span>06</span> Contact Our Team</div><div><h2>Our offices.<br />Your project partners.</h2><p>Connect with our Hyderabad head office or Pune branch for enquiries, project discussions and technical coordination.</p></div></div>
          <div className="locationGrid">
            <article>
              <div className="mapWrap"><iframe title="Contour Steel Hyderabad head office map" src="https://www.google.com/maps?q=H%20No%209-4-77%2FA%2F249%20Rauf%20Plaza%20Toli%20Chowki%20Hyderabad%20500008&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
              <div className="locationInfo"><span>Head Office</span><h3>Hyderabad</h3><p>H No: 9-4-77/A/249, 3rd Floor, Rauf Plaza,<br />Al Hasnath Colony, Toli Chowki,<br />Hyderabad – 500 008, Telangana, India</p><a href="tel:+919100996655">+91 91009 96655</a><a href={`mailto:${ENQUIRY_EMAIL}`}>{ENQUIRY_EMAIL}</a><a className="directionLink" href="https://www.google.com/maps/search/?api=1&query=H+No+9-4-77%2FA%2F249+Rauf+Plaza+Toli+Chowki+Hyderabad+500008" target="_blank" rel="noreferrer">Get Directions <b>↗</b></a></div>
            </article>
            <article>
              <div className="mapWrap"><iframe title="Contour Steel Pune branch office map" src="https://www.google.com/maps?q=Ajinkyatara%20Building%20Sinhagad%20Road%20Pune%20411030&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
              <div className="locationInfo"><span>Branch Office</span><h3>Pune</h3><p>#209, 2nd Floor, Ajinkyatara Building,<br />Above Airtel Showroom, Sinhagad Road,<br />Pune – 411030, Maharashtra, India</p><a href="tel:+919326863516">+91 93268 63516</a><a href="mailto:punesales@contoursteel.co.in">punesales@contoursteel.co.in</a><a className="directionLink" href="https://www.google.com/maps/search/?api=1&query=Ajinkyatara+Building+Sinhagad+Road+Pune+411030" target="_blank" rel="noreferrer">Get Directions <b>↗</b></a></div>
            </article>
            <article>
              <div className="mapWrap"><iframe title="Contour Steel manufacturing plant map" src="https://www.google.com/maps?q=Contour%20Steel%20Engineering%20Plant%20Seriguda%20Telangana%20509202&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
              <div className="locationInfo"><span>Manufacturing Plant</span><h3>Seriguda</h3><p>Contour Steel Engineering (Plant),<br />Seriguda, Telangana – 509202,<br />India</p><a href={`mailto:${ENQUIRY_EMAIL}`}>{ENQUIRY_EMAIL}</a><a className="directionLink" href="https://maps.app.goo.gl/1qhkkapxAFiX8PjZA?g_st=iw" target="_blank" rel="noreferrer">Get Directions <b>↗</b></a></div>
            </article>
          </div>
        </div>
      </section>

      <section className="contact section" id="contact">
        <div className="shell contactGrid"><div><div className="sectionLabel light"><span>06</span> Contact Our Team</div><h2>Tell us what you need to build.</h2><p>Share your project location, approximate area and intended use. Our team will help shape the right next step.</p><div className="contactDetails"><a href="tel:+919100996655">+91 91009 96655</a><a href={`mailto:${ENQUIRY_EMAIL}`}>{ENQUIRY_EMAIL}</a><div className="officeAddress"><strong>Head Office — Hyderabad</strong><span>H No: 9-4-77/A/249, 3rd Floor, Rauf Plaza,<br />Al Hasnath Colony, Toli Chowki, Hyderabad – 500 008,<br />Telangana, India</span></div><div className="officeAddress"><strong>Branch Office — Pune</strong><span>#209, 2nd Floor, Ajinkyatara Building, Above Airtel Showroom,<br />Sinhagad Road, Pune – 411030</span><a href="tel:+919326863516">+91 93268 63516</a><a href="mailto:punesales@contoursteel.co.in">punesales@contoursteel.co.in</a></div></div></div><form action={`mailto:${ENQUIRY_EMAIL}`} method="post" encType="text/plain"><label>Name<input name="name" required placeholder="Your full name" /></label><label>Company<input name="company" placeholder="Company name" /></label><label>Phone / Email<input name="contact" required placeholder="How should we reach you?" /></label><label>Project brief<textarea name="project" required placeholder="Location, building use and approximate area" /></label><button className="button buttonPrimary" type="submit">Send Enquiry <span>↗</span></button></form></div>
      </section>

      <footer><div className="shell footerGrid"><div className="brand"><span className="slideLogo"><img src="/contour-trademark-2026.png" alt="Contour Steel Engineering India (P) Ltd. trademark" /></span></div><p>19 years · 1,100+ projects · 30 million sq. ft.</p><div><a href="#facilities">Facilities</a><a href="#projects">Projects</a><a href="#locations">Locations</a></div><span>© 2026 Contour Steel Engineering India (P) Ltd.</span></div></footer>
    </main>
  );
}
