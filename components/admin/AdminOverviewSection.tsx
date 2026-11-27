"use client";

import {
  Activity,
  Briefcase,
  FolderKanban,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import type {
  AdminActivityLog,
  ContactEnquiry,
  HeroSlide,
  MediaLibraryItem,
  ProjectItem,
  ServiceItem,
} from "@/lib/cms/types";
import type { AdminTab } from "./AdminShared";

interface OverviewProps {
  heroSlides: HeroSlide[];
  projects: ProjectItem[];
  services: ServiceItem[];
  media: MediaLibraryItem[];
  enquiries: ContactEnquiry[];
  logs: AdminActivityLog[];
  publishedCount: number;
  draftCount: number;
  onNavigate: (tab: AdminTab) => void;
}

export default function AdminOverviewSection({
  heroSlides,
  projects,
  services,
  media,
  enquiries,
  logs,
  publishedCount,
  draftCount,
  onNavigate,
}: OverviewProps) {
  const activeProjects = projects.filter((p) => p.is_published).length;
  const newEnquiries = enquiries.filter((e) => e.status === "New").length;

  const stats = [
    {
      label: "Website Sections",
      value: "10",
      sub: "All CMS-connected",
      icon: Layers,
      tab: "website-settings" as AdminTab,
    },
    {
      label: "Active Projects",
      value: String(activeProjects),
      sub: `${projects.length} total projects`,
      icon: FolderKanban,
      tab: "projects" as AdminTab,
    },
    {
      label: "Services",
      value: String(services.length),
      sub: `${services.filter((s) => s.is_published).length} published`,
      icon: Briefcase,
      tab: "services" as AdminTab,
    },
    {
      label: "Hero Slides",
      value: String(heroSlides.length),
      sub: `${heroSlides.filter((s) => s.is_published).length} active`,
      icon: SlidersHorizontal,
      tab: "hero-slider" as AdminTab,
    },
    {
      label: "Uploaded Images",
      value: String(media.length),
      sub: "Media Library",
      icon: ImageIcon,
      tab: "media" as AdminTab,
    },
    {
      label: "Total Enquiries",
      value: String(enquiries.length),
      sub: `${newEnquiries} new awaiting review`,
      icon: MessageSquare,
      tab: "enquiries" as AdminTab,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Dashboard Overview
          </h2>
          <p className="text-sm text-slate-500">
            Live snapshot of your Contour Steel website content, media, and
            enquiries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate("projects")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
          <button
            type="button"
            onClick={() => onNavigate("hero-slider")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0d1b2b] hover:bg-[#172c44] text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Manage Hero Slides
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onNavigate(card.tab)}
              className="text-left bg-white border border-slate-200 p-5 hover:border-[#0d1b2b] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <Icon className="w-5 h-5 text-[#d9272e]" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-3">
                {card.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Content Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200">
              <span className="text-sm font-semibold text-emerald-900">
                Published Records
              </span>
              <span className="text-xl font-extrabold text-emerald-700">
                {publishedCount}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200">
              <span className="text-sm font-semibold text-amber-900">
                Draft / Hidden Records
              </span>
              <span className="text-xl font-extrabold text-amber-700">
                {draftCount}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200">
              <span className="text-sm font-semibold text-red-900">
                New Enquiries
              </span>
              <span className="text-xl font-extrabold text-[#d9272e]">
                {newEnquiries}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#d9272e]" />
              Recent Admin Activities
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("activity-logs")}
              className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No activity recorded yet. Changes made in the CMS will appear here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {log.summary}
                    </p>
                    <p className="text-xs text-slate-500">
                      {log.module} · {log.action} · by {log.actor_email}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
