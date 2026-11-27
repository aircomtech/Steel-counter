"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Award,
  Briefcase,
  Building2,
  CheckSquare,
  Compass,
  ExternalLink,
  Factory,
  FolderKanban,
  Globe,
  History,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  PanelBottom,
  Phone,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SITE_DATA } from "@/lib/cms/defaults";
import type {
  AboutSection,
  Achievement,
  AdminActivityLog,
  ContactEnquiry,
  FacilityItem,
  FooterSettings,
  HeroSlide,
  MediaLibraryItem,
  Milestone,
  NavigationItem,
  OfficeLocation,
  ProjectCategory,
  ProjectGalleryImage,
  ProjectItem,
  QualityItem,
  QualityStandard,
  SeoSettings,
  ServiceItem,
  SiteSettings,
  WhyPebBenefit,
} from "@/lib/cms/types";
import type { UploadedMediaResult } from "@/lib/cloudinary";
import {
  ConfirmDialog,
  ToastBanner,
  type AdminTab,
  type ConfirmState,
  type ToastState,
} from "./AdminShared";
import AdminOverviewSection from "./AdminOverviewSection";
import {
  ActivityLogsPanel,
  AdminSettingsPanel,
  FooterPanel,
  NavigationPanel,
  SeoPanel,
  WebsiteSettingsPanel,
} from "./AdminSiteAndNavSection";
import {
  AboutPanel,
  AchievementsPanel,
  HeroSliderPanel,
  MilestonesPanel,
} from "./AdminHeroAndAboutSection";
import {
  FacilitiesPanel,
  QualityPanel,
  ServicesPanel,
  WhyPebPanel,
} from "./AdminServicesAndPebSection";
import {
  ContactInfoPanel,
  OfficesPanel,
  ProjectsPanel,
} from "./AdminProjectsAndOfficesSection";
import {
  EnquiriesPanel,
  MediaLibraryPanel,
} from "./AdminEnquiriesAndMediaSection";

const SIDEBAR_ITEMS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "website-settings", label: "Website Settings", icon: Settings },
  { id: "navigation", label: "Navigation Management", icon: Compass },
  { id: "hero-slider", label: "Hero Slider Management", icon: SlidersHorizontal },
  { id: "about", label: "About Us Management", icon: Info },
  { id: "achievements", label: "Achievements Management", icon: Award },
  { id: "milestones", label: "Milestones Management", icon: History },
  { id: "services", label: "Services Management", icon: Briefcase },
  { id: "why-peb", label: "Why PEB Management", icon: CheckSquare },
  { id: "facilities", label: "Facilities Management", icon: Factory },
  { id: "quality", label: "Quality System Management", icon: ShieldCheck },
  { id: "projects", label: "Projects / Portfolio", icon: FolderKanban },
  { id: "offices", label: "Office Locations", icon: MapPin },
  { id: "contact-info", label: "Contact Information", icon: Phone },
  { id: "enquiries", label: "Enquiry Management", icon: MessageSquare },
  { id: "footer", label: "Footer Management", icon: PanelBottom },
  { id: "media", label: "Media Library", icon: ImageIcon },
  { id: "seo", label: "SEO Management", icon: Globe },
  { id: "admin-settings", label: "Admin Settings", icon: Building2 },
  { id: "activity-logs", label: "Activity Logs", icon: Activity },
];

export default function AdminDashboardClient({
  userEmail,
}: {
  userEmail: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  // CMS Data State
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_DATA.settings);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [about, setAbout] = useState<AboutSection>(DEFAULT_SITE_DATA.about);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [whyPebBenefits, setWhyPebBenefits] = useState<WhyPebBenefit[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [qualityItems, setQualityItems] = useState<QualityItem[]>([]);
  const [qualityStandards, setQualityStandards] = useState<QualityStandard[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_SITE_DATA.footer);
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SITE_DATA.seo);
  const [media, setMedia] = useState<MediaLibraryItem[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);

  const notify = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToast({ id, type, message });
    window.setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [
        settingsRes,
        navRes,
        slidesRes,
        aboutRes,
        achRes,
        milestonesRes,
        svcRes,
        pebRes,
        facRes,
        qiRes,
        qsRes,
        catRes,
        prjRes,
        galRes,
        offRes,
        enqRes,
        footerRes,
        seoRes,
        mediaRes,
        logsRes,
      ] = await Promise.all([
        supabase.from("site_settings").select("*").eq("key", "default").maybeSingle(),
        supabase.from("navigation_items").select("*").order("display_order"),
        supabase.from("hero_slides").select("*").order("display_order"),
        supabase.from("about_sections").select("*").eq("key", "main").maybeSingle(),
        supabase.from("achievements").select("*").order("display_order"),
        supabase.from("milestones").select("*").order("display_order"),
        supabase.from("services").select("*").order("display_order"),
        supabase.from("why_peb_benefits").select("*").order("display_order"),
        supabase.from("facilities").select("*").order("display_order"),
        supabase.from("quality_items").select("*").order("display_order"),
        supabase.from("quality_standards").select("*").order("display_order"),
        supabase.from("project_categories").select("*").order("display_order"),
        supabase.from("projects").select("*").order("display_order"),
        supabase.from("project_gallery").select("*").order("display_order"),
        supabase.from("office_locations").select("*").order("display_order"),
        supabase.from("contact_enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("footer_settings").select("*").eq("key", "default").maybeSingle(),
        supabase.from("seo_settings").select("*").eq("key", "default").maybeSingle(),
        supabase.from("media_library").select("*").order("created_at", { ascending: false }),
        supabase.from("admin_activity_logs").select("*").order("created_at", { ascending: false }).limit(100),
      ]);

      if (settingsRes.data) setSettings(settingsRes.data as SiteSettings);
      if (navRes.data) setNavigation(navRes.data as NavigationItem[]);
      if (slidesRes.data) setHeroSlides(slidesRes.data as HeroSlide[]);
      if (aboutRes.data) setAbout(aboutRes.data as AboutSection);
      if (achRes.data) setAchievements(achRes.data as Achievement[]);
      if (milestonesRes.data) setMilestones(milestonesRes.data as Milestone[]);
      if (svcRes.data) setServices(svcRes.data as ServiceItem[]);
      if (pebRes.data) setWhyPebBenefits(pebRes.data as WhyPebBenefit[]);
      if (facRes.data) setFacilities(facRes.data as FacilityItem[]);
      if (qiRes.data) setQualityItems(qiRes.data as QualityItem[]);
      if (qsRes.data) setQualityStandards(qsRes.data as QualityStandard[]);
      if (catRes.data) setCategories(catRes.data as ProjectCategory[]);

      const galleryMap = new Map<string, ProjectGalleryImage[]>();
      for (const g of (galRes.data || []) as ProjectGalleryImage[]) {
        const arr = galleryMap.get(g.project_id) ?? [];
        arr.push(g);
        galleryMap.set(g.project_id, arr);
      }
      if (prjRes.data) {
        setProjects(
          (prjRes.data as ProjectItem[]).map((p) => ({
            ...p,
            gallery: galleryMap.get(p.id) ?? [],
          })),
        );
      }

      if (offRes.data) setOffices(offRes.data as OfficeLocation[]);
      if (enqRes.data) setEnquiries(enqRes.data as ContactEnquiry[]);
      if (footerRes.data) setFooter(footerRes.data as FooterSettings);
      if (seoRes.data) setSeo(seoRes.data as SeoSettings);
      if (mediaRes.data) setMedia(mediaRes.data as MediaLibraryItem[]);
      if (logsRes.data) setLogs(logsRes.data as AdminActivityLog[]);
    } catch {
      notify("error", "Unable to load CMS records. Ensure database schema is initialized.");
    } finally {
      setLoading(false);
    }
  }, [supabase, notify]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleMediaUploaded(res: UploadedMediaResult) {
    await supabase.from("media_library").upsert(
      {
        public_id: res.public_id,
        secure_url: res.secure_url,
        filename: res.original_filename,
        folder: res.folder,
        format: res.format,
        width: res.width,
        height: res.height,
        bytes: res.bytes,
        uploaded_by: userEmail,
      },
      { onConflict: "public_id" },
    );
    await loadAll();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const allPublishable = [
    ...navigation,
    ...heroSlides,
    ...achievements,
    ...milestones,
    ...services,
    ...whyPebBenefits,
    ...facilities,
    ...qualityItems,
    ...projects,
    ...offices,
  ];
  const publishedCount = allPublishable.filter((r) => r.is_published).length;
  const draftCount = allPublishable.length - publishedCount;
  const newEnquiryCount = enquiries.filter((e) => e.status === "New").length;

  const sharedProps = {
    supabase,
    userEmail,
    media,
    onMediaUploaded: handleMediaUploaded,
    onRefresh: loadAll,
    onNotify: notify,
    onConfirm: setConfirm,
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-900 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#08111c] text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ff767b]">
              Contour Steel
            </p>
            <h1 className="text-sm font-bold text-white">CMS Control Panel</h1>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-300 hover:text-white p-1 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
                  active
                    ? "bg-[#d9272e] text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === "enquiries" && newEnquiryCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white text-[#d9272e] text-[10px] font-extrabold">
                    {newEnquiryCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <p className="text-[11px] text-slate-400 truncate px-2">{userEmail}</p>
          <button
            type="button"
            onClick={() => {
              setActiveTab("admin-settings");
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
          >
            <Settings className="w-4 h-4" /> Change Password
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-700 hover:text-slate-950 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label}
            </span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:border-[#0d1b2b] text-xs font-bold text-slate-800 shrink-0"
          >
            View Live Website <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="bg-white border border-slate-200 p-12 text-center text-sm text-slate-500">
              Loading Contour Steel CMS...
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <AdminOverviewSection
                  heroSlides={heroSlides}
                  projects={projects}
                  services={services}
                  media={media}
                  enquiries={enquiries}
                  logs={logs}
                  publishedCount={publishedCount}
                  draftCount={draftCount}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === "website-settings" && (
                <WebsiteSettingsPanel settings={settings} {...sharedProps} />
              )}
              {activeTab === "navigation" && (
                <NavigationPanel items={navigation} {...sharedProps} />
              )}
              {activeTab === "hero-slider" && (
                <HeroSliderPanel
                  slides={heroSlides}
                  slideDurationMs={settings.hero_slide_duration_ms}
                  {...sharedProps}
                />
              )}
              {activeTab === "about" && (
                <AboutPanel about={about} {...sharedProps} />
              )}
              {activeTab === "achievements" && (
                <AchievementsPanel achievements={achievements} {...sharedProps} />
              )}
              {activeTab === "milestones" && (
                <MilestonesPanel milestones={milestones} {...sharedProps} />
              )}
              {activeTab === "services" && (
                <ServicesPanel services={services} {...sharedProps} />
              )}
              {activeTab === "why-peb" && (
                <WhyPebPanel
                  settings={settings}
                  benefits={whyPebBenefits}
                  {...sharedProps}
                />
              )}
              {activeTab === "facilities" && (
                <FacilitiesPanel
                  settings={settings}
                  facilities={facilities}
                  {...sharedProps}
                />
              )}
              {activeTab === "quality" && (
                <QualityPanel
                  settings={settings}
                  qualityItems={qualityItems}
                  qualityStandards={qualityStandards}
                  {...sharedProps}
                />
              )}
              {activeTab === "projects" && (
                <ProjectsPanel
                  projects={projects}
                  categories={categories}
                  {...sharedProps}
                />
              )}
              {activeTab === "offices" && (
                <OfficesPanel offices={offices} {...sharedProps} />
              )}
              {activeTab === "contact-info" && (
                <ContactInfoPanel
                  settings={settings}
                  supabase={supabase}
                  userEmail={userEmail}
                  onRefresh={loadAll}
                  onNotify={notify}
                />
              )}
              {activeTab === "enquiries" && (
                <EnquiriesPanel
                  enquiries={enquiries}
                  supabase={supabase}
                  userEmail={userEmail}
                  onRefresh={loadAll}
                  onNotify={notify}
                  onConfirm={setConfirm}
                />
              )}
              {activeTab === "footer" && (
                <FooterPanel footer={footer} {...sharedProps} />
              )}
              {activeTab === "media" && (
                <MediaLibraryPanel
                  media={media}
                  supabase={supabase}
                  userEmail={userEmail}
                  onMediaUploaded={handleMediaUploaded}
                  onRefresh={loadAll}
                  onNotify={notify}
                  onConfirm={setConfirm}
                />
              )}
              {activeTab === "seo" && <SeoPanel seo={seo} {...sharedProps} />}
              {activeTab === "admin-settings" && (
                <AdminSettingsPanel
                  supabase={supabase}
                  userEmail={userEmail}
                  onNotify={notify}
                />
              )}
              {activeTab === "activity-logs" && (
                <ActivityLogsPanel logs={logs} />
              )}
            </>
          )}
        </main>
      </div>

      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
      <ConfirmDialog
        confirm={confirm}
        busy={confirmBusy}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          setConfirmBusy(true);
          try {
            await confirm.onConfirm();
          } finally {
            setConfirmBusy(false);
            setConfirm(null);
          }
        }}
      />
    </div>
  );
}
