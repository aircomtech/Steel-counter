"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminActivityLog,
  FooterSettings,
  MediaLibraryItem,
  NavigationItem,
  SectionVisibility,
  SeoSettings,
  SiteSettings,
} from "@/lib/cms/types";
import type { UploadedMediaResult } from "@/lib/cloudinary";
import {
  recordAdminActivity,
  triggerWebsiteRevalidation,
} from "@/lib/admin/cms-helpers";
import ImageUploaderField from "./ImageUploaderField";
import { StatusBadge, type ConfirmState } from "./AdminShared";

interface BaseProps {
  supabase: SupabaseClient;
  userEmail: string;
  media: MediaLibraryItem[];
  onMediaUploaded: (res: UploadedMediaResult) => Promise<void>;
  onRefresh: () => Promise<void>;
  onNotify: (type: "success" | "error", message: string) => void;
  onConfirm: (c: ConfirmState) => void;
}

export function WebsiteSettingsPanel({
  settings,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
}: BaseProps & { settings: SiteSettings }) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ ...form, key: "default" }, { onConflict: "key" });
      if (error) throw error;
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: "UPDATE",
        module: "Website Settings",
        summary: "Updated global website settings and section visibility",
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      onNotify("success", "Website settings saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save website settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  const visKeys: { key: keyof SectionVisibility; label: string }[] = [
    { key: "hero", label: "Hero Slider" },
    { key: "about", label: "About Us" },
    { key: "achievements", label: "Achievements & Milestones" },
    { key: "services", label: "Services / Capabilities" },
    { key: "why_peb", label: "Why PEB" },
    { key: "facilities", label: "Facilities" },
    { key: "quality", label: "Quality System" },
    { key: "projects", label: "Projects Portfolio" },
    { key: "locations", label: "Office Locations" },
    { key: "contact", label: "Contact & Enquiry Form" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Website Settings</h2>
          <p className="text-sm text-slate-500">
            Manage brand identity, hero stats strip, and section visibility.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save & Publish"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Primary Enquiry Email
          </label>
          <input
            type="email"
            value={form.enquiry_email}
            onChange={(e) => setForm({ ...form, enquiry_email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Hero Slide Duration (ms)
          </label>
          <input
            type="number"
            min={2500}
            step={500}
            value={form.hero_slide_duration_ms}
            onChange={(e) =>
              setForm({
                ...form,
                hero_slide_duration_ms: Number(e.target.value) || 5500,
              })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Hero Stats Heading
          </label>
          <input
            type="text"
            value={form.hero_stats_heading}
            onChange={(e) =>
              setForm({ ...form, hero_stats_heading: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <ImageUploaderField
            label="Website Header Logo"
            value={form.logo_url}
            folder="branding"
            mediaItems={media}
            onMediaUploaded={onMediaUploaded}
            onChange={(url) => setForm({ ...form, logo_url: url })}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Hero Bottom Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {form.hero_stats.map((stat, idx) => (
            <div key={idx} className="p-3 border border-slate-200 space-y-2">
              <input
                type="text"
                value={stat.figure}
                onChange={(e) => {
                  const next = [...form.hero_stats];
                  next[idx] = { ...next[idx], figure: e.target.value };
                  setForm({ ...form, hero_stats: next });
                }}
                placeholder="Figure (e.g. 19)"
                className="w-full px-2.5 py-1.5 border border-slate-300 text-sm font-bold"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => {
                  const next = [...form.hero_stats];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setForm({ ...form, hero_stats: next });
                }}
                placeholder="Label (e.g. Years Completed)"
                className="w-full px-2.5 py-1.5 border border-slate-300 text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Section Visibility on Main Website
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visKeys.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 border border-slate-200 cursor-pointer hover:bg-slate-50"
            >
              <span className="text-sm font-medium text-slate-800">
                {label}
              </span>
              <input
                type="checkbox"
                checked={form.section_visibility[key] !== false}
                onChange={(e) =>
                  setForm({
                    ...form,
                    section_visibility: {
                      ...form.section_visibility,
                      [key]: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-[#d9272e]"
              />
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}

export function NavigationPanel({
  items,
  supabase,
  userEmail,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { items: NavigationItem[] }) {
  const [editing, setEditing] = useState<Partial<NavigationItem> | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        label: (editing.label || "").trim(),
        url: (editing.url || "#").trim(),
        is_cta: Boolean(editing.is_cta),
        display_order: Number(editing.display_order ?? items.length + 1),
        is_published: editing.is_published !== false,
      };
      if (editing.id) {
        const { error } = await supabase
          .from("navigation_items")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("navigation_items")
          .insert(payload);
        if (error) throw error;
      }
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editing.id ? "UPDATE" : "CREATE",
        module: "Navigation",
        recordId: editing.id,
        summary: `${editing.id ? "Updated" : "Added"} navigation item "${payload.label}"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Navigation updated.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save navigation item.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveOrder(item: NavigationItem, delta: number) {
    const idx = items.findIndex((x) => x.id === item.id);
    const swap = items[idx + delta];
    if (!swap) return;
    await Promise.all([
      supabase
        .from("navigation_items")
        .update({ display_order: swap.display_order })
        .eq("id", item.id),
      supabase
        .from("navigation_items")
        .update({ display_order: item.display_order })
        .eq("id", swap.id),
    ]);
    await triggerWebsiteRevalidation();
    await onRefresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Navigation Management
          </h2>
          <p className="text-sm text-slate-500">
            Edit header menu labels, URLs, order, and CTA button.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              label: "",
              url: "#",
              is_cta: false,
              display_order: items.length + 1,
              is_published: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Menu Item
        </button>
      </div>

      {editing && (
        <form
          onSubmit={saveItem}
          className="bg-white border border-slate-200 p-5 space-y-4"
        >
          <h3 className="font-bold text-slate-900 text-sm">
            {editing.id ? "Edit Menu Item" : "New Menu Item"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              required
              value={editing.label || ""}
              onChange={(e) =>
                setEditing({ ...editing, label: e.target.value })
              }
              placeholder="Label (e.g. Projects)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              required
              value={editing.url || ""}
              onChange={(e) => setEditing({ ...editing, url: e.target.value })}
              placeholder="URL (e.g. #projects)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="number"
              value={editing.display_order ?? 1}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  display_order: Number(e.target.value),
                })
              }
              placeholder="Order"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(editing.is_cta)}
                onChange={(e) =>
                  setEditing({ ...editing, is_cta: e.target.checked })
                }
              />
              Header CTA Button
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.is_published !== false}
                onChange={(e) =>
                  setEditing({ ...editing, is_published: e.target.checked })
                }
              />
              Published
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
            >
              {saving ? "Saving..." : "Save Menu Item"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 border border-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Label</th>
              <th className="p-3">URL</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="p-3 whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveOrder(item, -1)}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveOrder(item, 1)}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="p-3 font-semibold text-slate-900">
                  {item.label}
                </td>
                <td className="p-3 text-slate-600 font-mono text-xs">
                  {item.url}
                </td>
                <td className="p-3 text-xs">
                  {item.is_cta ? "CTA Button" : "Nav Link"}
                </td>
                <td className="p-3">
                  <StatusBadge published={item.is_published} />
                </td>
                <td className="p-3 text-right space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onConfirm({
                        title: "Delete Menu Item",
                        message: `Remove "${item.label}" from website navigation?`,
                        onConfirm: async () => {
                          const { error } = await supabase
                            .from("navigation_items")
                            .delete()
                            .eq("id", item.id);
                          if (error) {
                            onNotify("error", error.message);
                            return;
                          }
                          await recordAdminActivity(supabase, {
                            actorEmail: userEmail,
                            action: "DELETE",
                            module: "Navigation",
                            recordId: item.id,
                            summary: `Deleted navigation item "${item.label}"`,
                          });
                          await triggerWebsiteRevalidation();
                          await onRefresh();
                          onNotify("success", "Navigation item deleted.");
                        },
                      })
                    }
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FooterPanel({
  footer,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
}: BaseProps & { footer: FooterSettings }) {
  const [form, setForm] = useState<FooterSettings>(footer);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("footer_settings")
        .upsert({ ...form, key: "default" }, { onConflict: "key" });
      if (error) throw error;
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: "UPDATE",
        module: "Footer",
        summary: "Updated footer settings and links",
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      onNotify("success", "Footer settings saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save footer.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Footer Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage footer logo, summary, links, social URLs, and copyright.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save & Publish"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Summary Text
          </label>
          <input
            type="text"
            value={form.summary_text}
            onChange={(e) => setForm({ ...form, summary_text: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Copyright Text
          </label>
          <input
            type="text"
            value={form.copyright_text}
            onChange={(e) =>
              setForm({ ...form, copyright_text: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Contact Phone
          </label>
          <input
            type="text"
            value={form.contact_phone}
            onChange={(e) =>
              setForm({ ...form, contact_phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) =>
              setForm({ ...form, contact_email: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <ImageUploaderField
            label="Footer Logo"
            value={form.logo_url}
            folder="branding"
            mediaItems={media}
            onMediaUploaded={onMediaUploaded}
            onChange={(url) => setForm({ ...form, logo_url: url })}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase text-slate-800">
            Footer Navigation Links
          </h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                nav_links: [...(form.nav_links || []), { label: "", url: "#" }],
              })
            }
            className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
          >
            + Add Link
          </button>
        </div>
        {(form.nav_links || []).map((link, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input
              type="text"
              value={link.label}
              onChange={(e) => {
                const next = [...form.nav_links];
                next[idx] = { ...next[idx], label: e.target.value };
                setForm({ ...form, nav_links: next });
              }}
              placeholder="Label"
              className="sm:col-span-2 px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => {
                const next = [...form.nav_links];
                next[idx] = { ...next[idx], url: e.target.value };
                setForm({ ...form, nav_links: next });
              }}
              placeholder="URL"
              className="sm:col-span-2 px-3 py-2 border border-slate-300 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  nav_links: form.nav_links.filter((_, i) => i !== idx),
                })
              }
              className="px-3 py-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mx-auto" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase text-slate-800">
            Social Media Links
          </h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                social_links: [
                  ...(form.social_links || []),
                  { label: "LinkedIn", url: "https://" },
                ],
              })
            }
            className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
          >
            + Add Social Link
          </button>
        </div>
        {(form.social_links || []).map((link, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input
              type="text"
              value={link.label}
              onChange={(e) => {
                const next = [...form.social_links];
                next[idx] = { ...next[idx], label: e.target.value };
                setForm({ ...form, social_links: next });
              }}
              placeholder="Platform"
              className="sm:col-span-2 px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => {
                const next = [...form.social_links];
                next[idx] = { ...next[idx], url: e.target.value };
                setForm({ ...form, social_links: next });
              }}
              placeholder="https://..."
              className="sm:col-span-2 px-3 py-2 border border-slate-300 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  social_links: form.social_links.filter((_, i) => i !== idx),
                })
              }
              className="px-3 py-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mx-auto" />
            </button>
          </div>
        ))}
      </div>
    </form>
  );
}

export function SeoPanel({
  seo,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
}: BaseProps & { seo: SeoSettings }) {
  const [form, setForm] = useState<SeoSettings>(seo);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("seo_settings")
        .upsert({ ...form, key: "default" }, { onConflict: "key" });
      if (error) throw error;
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: "UPDATE",
        module: "SEO",
        summary: "Updated SEO metadata and Open Graph settings",
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      onNotify("success", "SEO settings saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save SEO settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">SEO Management</h2>
          <p className="text-sm text-slate-500">
            Configure search titles, descriptions, keywords, Open Graph, and
            favicon.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save & Publish"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Website Title
          </label>
          <input
            type="text"
            value={form.site_title}
            onChange={(e) => setForm({ ...form, site_title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Meta Description
          </label>
          <textarea
            rows={3}
            value={form.meta_description}
            onChange={(e) =>
              setForm({ ...form, meta_description: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Keywords (comma-separated)
          </label>
          <textarea
            rows={2}
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Open Graph Title
          </label>
          <input
            type="text"
            value={form.og_title}
            onChange={(e) => setForm({ ...form, og_title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Canonical URL
          </label>
          <input
            type="url"
            value={form.canonical_url}
            onChange={(e) =>
              setForm({ ...form, canonical_url: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Open Graph Description
          </label>
          <textarea
            rows={2}
            value={form.og_description}
            onChange={(e) =>
              setForm({ ...form, og_description: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <ImageUploaderField
          label="Open Graph Image"
          value={form.og_image_url}
          folder="branding"
          mediaItems={media}
          onMediaUploaded={onMediaUploaded}
          onChange={(url) => setForm({ ...form, og_image_url: url })}
        />
        <ImageUploaderField
          label="Favicon"
          value={form.favicon_url}
          folder="branding"
          mediaItems={media}
          onMediaUploaded={onMediaUploaded}
          onChange={(url) => setForm({ ...form, favicon_url: url })}
        />
      </div>
    </form>
  );
}

export function AdminSettingsPanel({
  supabase,
  userEmail,
  onNotify,
}: {
  supabase: SupabaseClient;
  userEmail: string;
  onNotify: (type: "success" | "error", message: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      onNotify("error", "Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      onNotify("error", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      onNotify("error", "New password and confirm password do not match.");
      return;
    }

    setUpdating(true);
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (verifyError) {
        onNotify("error", "Current password is incorrect.");
        setUpdating(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: "UPDATE",
        module: "Admin Settings",
        summary: "Updated administrator account password",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onNotify("success", "Administrator password updated successfully.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to update password.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleSyncCache() {
    await triggerWebsiteRevalidation();
    onNotify("success", "Live website cache refreshed.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Admin Settings</h2>
        <p className="text-sm text-slate-500">
          Account security, password management, and website synchronization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form
          onSubmit={handlePasswordUpdate}
          className="bg-white border border-slate-200 p-5 space-y-4"
        >
          <h3 className="text-sm font-bold uppercase text-slate-800">
            Change Admin Password
          </h3>
          <p className="text-xs text-slate-500">
            Signed in as <strong className="text-slate-800">{userEmail}</strong>
          </p>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-3 pr-10 py-2 border border-slate-300 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                minLength={8}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-3 pr-10 py-2 border border-slate-300 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                minLength={8}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-3 pr-10 py-2 border border-slate-300 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={updating}
            className="px-4 py-2.5 bg-[#0d1b2b] hover:bg-[#172c44] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
          >
            {updating ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="bg-white border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold uppercase text-slate-800">
            Website Cache Synchronization
          </h3>
          <p className="text-sm text-slate-600">
            Changes saved in the CMS automatically refresh the live website. Use
            this button to force an immediate cache refresh.
          </p>
          <button
            type="button"
            onClick={handleSyncCache}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Live Website Now
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActivityLogsPanel({ logs }: { logs: AdminActivityLog[] }) {
  const [search, setSearch] = useState("");
  const filtered = logs.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      l.summary.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      l.actor_email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Activity Logs</h2>
        <p className="text-sm text-slate-500">
          Audit trail of all content updates, media uploads, and deletions.
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search activity logs by module, action, or email..."
        className="w-full max-w-md px-3 py-2 bg-white border border-slate-300 text-sm"
      />

      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Module</th>
              <th className="p-3">Action</th>
              <th className="p-3">Summary</th>
              <th className="p-3">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No activity logs found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id}>
                  <td className="p-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-slate-800">
                    {log.module}
                  </td>
                  <td className="p-3 text-xs font-bold uppercase text-[#d9272e]">
                    {log.action}
                  </td>
                  <td className="p-3 text-slate-700">{log.summary}</td>
                  <td className="p-3 text-xs text-slate-500">
                    {log.actor_email}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
