"use client";

import { useEffect, useMemo, useState } from "react";
import { optimizeImageUrl } from "@/lib/cloudinary";
import type { ProjectItem, PublishedSiteData } from "@/lib/cms/types";

interface Props {
  initialData: PublishedSiteData;
}

export default function ContourWebsiteClient({ initialData }: Props) {
  const {
    settings,
    navigation,
    heroSlides,
    about,
    achievements,
    milestones,
    services,
    whyPebBenefits,
    facilities,
    qualityItems,
    qualityStandards,
    projects,
    offices,
    footer,
  } = initialData;

  const vis = settings.section_visibility;
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Enquiry form state
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectRequirements, setProjectRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const slideCount = heroSlides.length;
  const safeSlideIndex = slideCount > 0 ? activeSlide % slideCount : 0;
  const currentSlide = slideCount > 0 ? heroSlides[safeSlideIndex] : null;
  const slideDuration = Math.max(2500, settings.hero_slide_duration_ms || 5500);

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slideCount),
      slideDuration,
    );
    return () => window.clearInterval(timer);
  }, [slideCount, slideDuration]);

  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    const preventMediaDrag = (event: DragEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("img, video, .heroSlide")) event.preventDefault();
    };
    const preventSaveShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s")
        event.preventDefault();
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

  const regularNav = navigation.filter((n) => !n.is_cta);
  const ctaNav = navigation.find((n) => n.is_cta) ?? {
    id: "cta-default",
    label: "Request a Quote",
    url: "#contact",
  };

  const heroFacility = facilities.find((f) => f.kind === "hero");
  const machineFacilities = facilities.filter((f) => f.kind === "machine");
  const secondaryFacilities = facilities.filter((f) => f.kind === "secondary");

  const contactOffices = offices.filter((o) => o.show_in_contact);

  const projectFilterCategories = useMemo(() => {
    const names = new Set<string>();
    for (const p of projects) {
      if (p.category_name) names.add(p.category_name);
    }
    return ["All", ...Array.from(names)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category_name === activeCategory);
  }, [projects, activeCategory]);

  const previousSlide = () => {
    if (slideCount === 0) return;
    setActiveSlide((safeSlideIndex - 1 + slideCount) % slideCount);
  };
  const nextSlide = () => {
    if (slideCount === 0) return;
    setActiveSlide((safeSlideIndex + 1) % slideCount);
  };

  async function handleEnquirySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormMessage(null);

    const trimmedContact = contactInfo.trim();
    const isEmail = trimmedContact.includes("@");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          company_name: companyName.trim(),
          phone: isEmail ? "" : trimmedContact,
          email: isEmail ? trimmedContact : "",
          project_location: projectLocation.trim(),
          project_requirements: projectRequirements.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFormMessage({
          type: "error",
          text:
            result.error ||
            "Could not submit your enquiry. Please try again or call us directly.",
        });
      } else {
        setFormMessage({
          type: "success",
          text:
            result.message ||
            "Thank you! Your enquiry has been submitted successfully.",
        });
        setCustomerName("");
        setCompanyName("");
        setContactInfo("");
        setProjectLocation("");
        setProjectRequirements("");
      }
    } catch {
      setFormMessage({
        type: "error",
        text: "Network error while sending enquiry. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      {vis.hero !== false && (
        <section className="hero" id="home">
          <div className="slideStage" aria-live="polite">
            {heroSlides.map((slide, index) => {
              const rawImg =
                isMobile && slide.mobile_image_url
                  ? slide.mobile_image_url
                  : slide.desktop_image_url;
              const bgImg = optimizeImageUrl(rawImg, isMobile ? 1080 : 1920);
              return (
                <div
                  key={slide.id}
                  className={`heroSlide ${index === safeSlideIndex ? "isActive" : ""}`}
                  style={{ backgroundImage: `url(${bgImg})` }}
                  aria-hidden={index !== safeSlideIndex}
                >
                  {slide.video_url && (
                    <video
                      className="originalHeroReel"
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={bgImg}
                    >
                      <source src={slide.video_url} type="video/mp4" />
                    </video>
                  )}
                  <div className="heroShade" />
                </div>
              );
            })}
          </div>

          <header className="siteHeader shell">
            <a className="brand" href="#home" aria-label="Contour Steel home">
              <span className="slideLogo">
                <img
                  src={optimizeImageUrl(settings.logo_url, 430)}
                  alt={`${settings.company_name} trademark`}
                />
              </span>
            </a>
            <nav className="desktopNav" aria-label="Main navigation">
              {regularNav.map((item) => (
                <a key={item.id} href={item.url}>
                  {item.label}
                </a>
              ))}
            </nav>
            <a className="headerCta" href={ctaNav.url}>
              {ctaNav.label}
            </a>
            <button
              type="button"
              className={`menuButton ${menuOpen ? "isOpen" : ""}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </header>

          <nav
            id="mobile-navigation"
            className={`mobileNav ${menuOpen ? "isOpen" : ""}`}
            aria-label="Mobile navigation"
          >
            {regularNav.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              className="mobileNavCta"
              href={ctaNav.url}
              onClick={() => setMenuOpen(false)}
            >
              {ctaNav.label} <span>→</span>
            </a>
          </nav>

          {currentSlide && (
            <div className="heroContent shell" key={currentSlide.id}>
              <span className="slideLogo heroTrademark">
                <img
                  src={optimizeImageUrl(settings.logo_url, 430)}
                  alt={`${settings.company_name} trademark`}
                />
              </span>
              <p className="eyebrow">
                <span /> {currentSlide.kicker}
              </p>
              <h1>{currentSlide.title}</h1>
              <p className="heroCopy">{currentSlide.copy}</p>
              <div className="heroActions">
                <a className="button buttonPrimary" href={currentSlide.primary_cta_url}>
                  {currentSlide.primary_cta_label} <span>↗</span>
                </a>
                <a className="button buttonGhost" href={currentSlide.secondary_cta_url || "#contact"}>
                  {currentSlide.secondary_cta_label || "Request a Quote"} <span>→</span>
                </a>
              </div>
            </div>
          )}

          {slideCount > 0 && (
            <div className="slideControls shell">
              <button type="button" onClick={previousSlide} aria-label="Previous slide">
                ←
              </button>
              <div
                className="slideDots"
                style={{ gridTemplateColumns: `repeat(${slideCount}, 1fr)` }}
              >
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={index === safeSlideIndex ? "active" : ""}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show ${slide.tag} slide`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {slide.tag}
                  </button>
                ))}
              </div>
              <button type="button" onClick={nextSlide} aria-label="Next slide">
                →
              </button>
            </div>
          )}

          <div className="stats shell" aria-label="Company achievements">
            <div className="achievementLead">
              <span>{settings.hero_stats_kicker}</span>
              <b>{settings.hero_stats_heading}</b>
            </div>
            {settings.hero_stats.map((stat, idx) => (
              <div key={`${stat.label}-${idx}`}>
                <strong>{stat.figure}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {vis.about !== false && about.is_published && (
        <section className="intro section shell" id="about">
          <div className="sectionLabel">
            <span>{about.section_number}</span> {about.section_heading}
          </div>
          <div className="introGrid">
            <div>
              <h2>{about.main_title}</h2>
              {about.image_url && (
                <div style={{ marginTop: 28, border: "1px solid #d7dadd", overflow: "hidden" }}>
                  <img
                    src={optimizeImageUrl(about.image_url, 960)}
                    alt={about.main_title}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              )}
            </div>
            <div>
              <p>{about.description}</p>
              {Array.isArray(about.additional_paragraphs) &&
                about.additional_paragraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              {about.cta_text && (
                <a className="textLink" href={about.cta_url || "#capabilities"}>
                  {about.cta_text} <span>→</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {vis.achievements !== false && (
        <section className="achievements section" id="achievements">
          <div className="shell">
            <div className="achievementHeader">
              <div className="sectionLabel">
                <span>{settings.achievements_kicker}</span> {settings.achievements_label}
              </div>
              <div>
                <h2>
                  {settings.achievements_heading}
                  <br />
                  <span>{settings.achievements_subheading}</span>
                </h2>
                <p>{settings.achievements_description}</p>
              </div>
            </div>
            <div className="achievementGrid">
              {achievements.map((item, index) => (
                <article
                  key={item.id}
                  className={item.is_featured ? "featuredAchievement" : ""}
                >
                  <div className="achievementIcon" aria-hidden="true">
                    {item.icon}
                  </div>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.figure}</strong>
                  <h3>{item.unit}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>

            {milestones.length > 0 && (
              <div className="milestoneStrip">
                {milestones.map((m) => (
                  <article key={m.id} className="milestoneCard">
                    <span className="milestoneYear">{m.year_label}</span>
                    <h3>{m.title}</h3>
                    {m.subtitle && <small>{m.subtitle}</small>}
                    {m.description && <p>{m.description}</p>}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {vis.services !== false && (
        <section className="capabilities section" id="capabilities">
          <div className="shell">
            <div className="sectionTop">
              <div className="sectionLabel light">
                <span>{settings.services_kicker}</span> {settings.services_label}
              </div>
              <h2>{settings.services_heading}</h2>
            </div>
            <div className="capGrid">
              {services.map((item, idx) => (
                <article key={item.id}>
                  <span>{item.item_number || String(idx + 1).padStart(2, "0")}</span>
                  {item.image_url && (
                    <img
                      src={optimizeImageUrl(item.image_url, 600)}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: 150,
                        objectFit: "cover",
                        marginTop: 18,
                      }}
                    />
                  )}
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a
                    href={item.cta_url || "#contact"}
                    aria-label={`Enquire about ${item.title}`}
                  >
                    {item.icon || "↗"}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {vis.why_peb !== false && (
        <section className="why section shell" id="why-peb">
          <div className="sectionLabel">
            <span>{settings.why_peb_kicker}</span> {settings.why_peb_label}
          </div>
          <div className="whyGrid">
            <div>
              <h2>{settings.why_peb_heading}</h2>
              <p>{settings.why_peb_description}</p>
            </div>
            <ul>
              {whyPebBenefits.map((benefit) => (
                <li key={benefit.id}>
                  <span>✓</span>
                  {benefit.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="applicationStrip">
            {(settings.why_peb_applications || []).map((app) => (
              <span key={app}>{app}</span>
            ))}
          </div>
        </section>
      )}

      {vis.facilities !== false && (
        <section className="facilities section shell" id="facilities">
          <div className="sectionTop dark">
            <div className="sectionLabel">
              <span>{settings.facilities_kicker}</span> {settings.facilities_label}
            </div>
            <div>
              <h2>{settings.facilities_heading}</h2>
              <p>{settings.facilities_description}</p>
            </div>
          </div>

          {heroFacility && (
            <div className="facilityHero">
              <img
                src={optimizeImageUrl(heroFacility.image_url || "/facilities.jpg", 1200)}
                alt={heroFacility.title}
              />
              <div>
                <strong>{heroFacility.subtitle || "5 Acres"}</strong>
                <span>{heroFacility.title}</span>
                <p>{heroFacility.description}</p>
              </div>
            </div>
          )}

          {machineFacilities.length > 0 && (
            <div className="machineGrid">
              {machineFacilities.map((machine, idx) => (
                <article key={machine.id}>
                  {machine.image_url && (
                    <img
                      src={optimizeImageUrl(machine.image_url, 800)}
                      alt={machine.title}
                    />
                  )}
                  <div>
                    <span>{machine.item_number || String(idx + 1).padStart(2, "0")}</span>
                    <h3>{machine.title}</h3>
                    <p>{machine.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {secondaryFacilities.map((sec) => (
            <div className="secondaryFab" key={sec.id}>
              <h3>{sec.title}</h3>
              <p>{sec.description}</p>
            </div>
          ))}
        </section>
      )}

      {vis.quality !== false && (
        <section className="quality section" id="quality">
          <div className="shell qualityGrid">
            <div>
              <div className="sectionLabel light">
                <span>{settings.quality_kicker}</span> {settings.quality_label}
              </div>
              <h2>{settings.quality_heading}</h2>
              <p>{settings.quality_description}</p>
            </div>
            <div className="qualityList">
              {qualityItems.map((q, idx) => (
                <div key={q.id}>
                  <b>{q.item_number || String(idx + 1).padStart(2, "0")}</b>
                  <span>
                    <strong>{q.title}</strong>
                    {q.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="shell standards">
            <h3>{settings.quality_references_heading}</h3>
            <div>
              {qualityStandards.map((standard) => (
                <span key={standard.id}>{standard.name}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {vis.projects !== false && (
        <section className="projects section shell" id="projects">
          <div className="sectionTop dark">
            <div className="sectionLabel">
              <span>{settings.projects_kicker}</span> {settings.projects_label}
            </div>
            <div>
              <h2>{settings.projects_heading}</h2>
              <p>{settings.projects_description}</p>
            </div>
          </div>

          {projectFilterCategories.length > 2 && (
            <div className="projectFilters" role="tablist" aria-label="Filter projects by category">
              {projectFilterCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={activeCategory === cat ? "isActive" : ""}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="galleryGrid">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                onClick={() => {
                  if (project.description || (project.gallery && project.gallery.length > 0)) {
                    setSelectedProject(project);
                  }
                }}
                style={{
                  cursor:
                    project.description || (project.gallery && project.gallery.length > 0)
                      ? "pointer"
                      : "default",
                }}
              >
                <div className="galleryPhoto">
                  <img
                    src={optimizeImageUrl(project.cover_image_url, 800)}
                    alt={`${project.title} by Contour Steel`}
                    loading="lazy"
                  />
                </div>
                <div>
                  {(project.category_name || project.status_label) && (
                    <span>{project.category_name || project.status_label}</span>
                  )}
                  <h3>{project.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {selectedProject && (
        <div
          className="projectModalBackdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedProject(null)}
        >
          <div className="projectModal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="projectModalClose"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
            >
              ✕
            </button>
            <img
              src={optimizeImageUrl(selectedProject.cover_image_url, 1200)}
              alt={selectedProject.title}
            />
            <div className="projectModalBody">
              <span>{selectedProject.category_name || selectedProject.status_label}</span>
              <h3>{selectedProject.title}</h3>
              {(selectedProject.location || selectedProject.area_sqft) && (
                <p className="projectModalMeta">
                  {[selectedProject.location, selectedProject.area_sqft].filter(Boolean).join(" · ")}
                </p>
              )}
              {selectedProject.description && <p>{selectedProject.description}</p>}
              {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                <div className="projectModalGallery">
                  {selectedProject.gallery.map((g) => (
                    <img
                      key={g.id}
                      src={optimizeImageUrl(g.image_url, 600)}
                      alt={g.caption || selectedProject.title}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {vis.locations !== false && (
        <section className="locations section" id="locations">
          <div className="shell">
            <div className="locationHeader">
              <div className="sectionLabel">
                <span>{settings.locations_kicker}</span> {settings.locations_label}
              </div>
              <div>
                <h2>{settings.locations_heading}</h2>
                <p>{settings.locations_description}</p>
              </div>
            </div>
            <div className="locationGrid">
              {offices.map((office) => (
                <article key={office.id}>
                  <div className="mapWrap">
                    {office.image_url ? (
                      <img
                        src={optimizeImageUrl(office.image_url, 800)}
                        alt={`${office.city} ${office.office_type}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <iframe
                        title={`Contour Steel ${office.city} ${office.office_type} map`}
                        src={office.map_embed_url}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    )}
                  </div>
                  <div className="locationInfo">
                    <span>{office.office_type}</span>
                    <h3>{office.city}</h3>
                    <p style={{ whiteSpace: "pre-line" }}>{office.address}</p>
                    {office.phone && (
                      <a href={`tel:${office.phone.replace(/\s+/g, "")}`}>
                        {office.phone}
                      </a>
                    )}
                    {office.email && (
                      <a href={`mailto:${office.email}`}>{office.email}</a>
                    )}
                    {office.directions_url && (
                      <a
                        className="directionLink"
                        href={office.directions_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get Directions <b>↗</b>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {vis.contact !== false && (
        <section className="contact section" id="contact">
          <div className="shell contactGrid">
            <div>
              <div className="sectionLabel light">
                <span>{settings.locations_kicker}</span> {settings.locations_label}
              </div>
              <h2>{settings.contact_heading}</h2>
              <p>{settings.contact_description}</p>
              <div className="contactDetails">
                {contactOffices[0]?.phone && (
                  <a href={`tel:${contactOffices[0].phone.replace(/\s+/g, "")}`}>
                    {contactOffices[0].phone}
                  </a>
                )}
                <a href={`mailto:${settings.enquiry_email}`}>
                  {settings.enquiry_email}
                </a>
                {contactOffices.map((office) => (
                  <div className="officeAddress" key={office.id}>
                    <strong>
                      {office.office_type} — {office.city}
                    </strong>
                    <span style={{ whiteSpace: "pre-line" }}>{office.address}</span>
                    {office.phone && (
                      <a href={`tel:${office.phone.replace(/\s+/g, "")}`}>
                        {office.phone}
                      </a>
                    )}
                    {office.email && (
                      <a href={`mailto:${office.email}`}>{office.email}</a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleEnquirySubmit}>
              <label>
                Name
                <input
                  name="name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                />
              </label>
              <label>
                Company
                <input
                  name="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company name"
                />
              </label>
              <label>
                Phone / Email
                <input
                  name="contact"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="How should we reach you?"
                />
              </label>
              <label>
                Project Location
                <input
                  name="location"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="City / State (optional)"
                />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Project brief
                <textarea
                  name="project"
                  required
                  value={projectRequirements}
                  onChange={(e) => setProjectRequirements(e.target.value)}
                  placeholder="Location, building use and approximate area"
                />
              </label>
              {formMessage && (
                <div
                  role="status"
                  style={{
                    gridColumn: "1 / -1",
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    background:
                      formMessage.type === "success"
                        ? "rgba(22, 163, 74, 0.18)"
                        : "rgba(217, 39, 46, 0.2)",
                    border:
                      formMessage.type === "success"
                        ? "1px solid rgba(74, 222, 128, 0.5)"
                        : "1px solid rgba(248, 113, 113, 0.5)",
                    color: "#fff",
                  }}
                >
                  {formMessage.text}
                </div>
              )}
              <button
                className="button buttonPrimary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Enquiry"} <span>↗</span>
              </button>
            </form>
          </div>
        </section>
      )}

      {footer.is_published !== false && (
        <footer>
          <div className="shell footerGrid">
            <div className="brand">
              <span className="slideLogo">
                <img
                  src={optimizeImageUrl(footer.logo_url || settings.logo_url, 430)}
                  alt={`${settings.company_name} trademark`}
                />
              </span>
            </div>
            <p>{footer.summary_text}</p>
            <div>
              {(footer.nav_links || []).map((link, i) => (
                <a key={`${link.url}-${i}`} href={link.url}>
                  {link.label}
                </a>
              ))}
              {(footer.social_links || []).map((social, i) => (
                <a
                  key={`${social.url}-${i}`}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.label}
                </a>
              ))}
            </div>
            <span>{footer.copyright_text}</span>
          </div>
        </footer>
      )}
    </main>
  );
}
