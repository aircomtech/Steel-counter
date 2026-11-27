"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FacilityItem,
  MediaLibraryItem,
  QualityItem,
  QualityStandard,
  ServiceItem,
  SiteSettings,
  WhyPebBenefit,
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

export function ServicesPanel({
  services,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { services: ServiceItem[] }) {
  const [editing, setEditing] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveService(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        item_number: (
          editing.item_number || String(services.length + 1).padStart(2, "0")
        ).trim(),
        title: (editing.title || "").trim(),
        description: (editing.description || "").trim(),
        icon: (editing.icon || "↗").trim(),
        image_url: (editing.image_url || "").trim() || null,
        cta_url: (editing.cta_url || "#contact").trim(),
        display_order: Number(editing.display_order ?? services.length + 1),
        is_published: editing.is_published !== false,
      };
      if (editing.id) {
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      }
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editing.id ? "UPDATE" : "CREATE",
        module: "Services",
        recordId: editing.id,
        summary: `${editing.id ? "Updated" : "Added"} service "${payload.title}"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Service saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save service.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveOrder(item: ServiceItem, delta: number) {
    const idx = services.findIndex((s) => s.id === item.id);
    const swap = services[idx + delta];
    if (!swap) return;
    await Promise.all([
      supabase
        .from("services")
        .update({ display_order: swap.display_order })
        .eq("id", item.id),
      supabase
        .from("services")
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
            Services Management
          </h2>
          <p className="text-sm text-slate-500">
            Add, edit, reorder, and upload images for service capabilities.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              item_number: String(services.length + 1).padStart(2, "0"),
              title: "",
              description: "",
              icon: "↗",
              image_url: "",
              cta_url: "#contact",
              display_order: services.length + 1,
              is_published: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {editing && (
        <form
          onSubmit={saveService}
          className="bg-white border border-slate-200 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={editing.item_number || ""}
              onChange={(e) =>
                setEditing({ ...editing, item_number: e.target.value })
              }
              placeholder="Number (e.g. 01)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              required
              value={editing.title || ""}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              placeholder="Service Title"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              value={editing.icon || ""}
              onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
              placeholder="Icon / Symbol (e.g. ↗)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <textarea
              rows={3}
              required
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Service Description"
              className="md:col-span-3 px-3 py-2 border border-slate-300 text-sm"
            />
            <div className="md:col-span-3">
              <ImageUploaderField
                label="Service Image (Optional)"
                value={editing.image_url || ""}
                folder="services"
                mediaItems={media}
                onMediaUploaded={onMediaUploaded}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.is_published !== false}
              onChange={(e) =>
                setEditing({ ...editing, is_published: e.target.checked })
              }
            />
            Published on Website
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
            >
              {saving ? "Saving..." : "Save & Publish Service"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc, idx) => (
          <div
            key={svc.id}
            className="bg-white border border-slate-200 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d9272e]">
                {svc.item_number}
              </span>
              <StatusBadge published={svc.is_published} />
            </div>
            {svc.image_url && (
              <img
                src={svc.image_url}
                alt={svc.title}
                className="w-full h-32 object-cover border border-slate-100"
              />
            )}
            <h3 className="font-bold text-slate-900">{svc.title}</h3>
            <p className="text-xs text-slate-600 flex-1">{svc.description}</p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveOrder(svc, -1)}
                  className="p-1 border border-slate-200 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === services.length - 1}
                  onClick={() => moveOrder(svc, 1)}
                  className="p-1 border border-slate-200 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(svc)}
                  className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onConfirm({
                      title: "Delete Service",
                      message: `Delete "${svc.title}"?`,
                      onConfirm: async () => {
                        const { error } = await supabase
                          .from("services")
                          .delete()
                          .eq("id", svc.id);
                        if (error) {
                          onNotify("error", error.message);
                          return;
                        }
                        await recordAdminActivity(supabase, {
                          actorEmail: userEmail,
                          action: "DELETE",
                          module: "Services",
                          recordId: svc.id,
                          summary: `Deleted service "${svc.title}"`,
                        });
                        await triggerWebsiteRevalidation();
                        await onRefresh();
                        onNotify("success", "Service deleted.");
                      },
                    })
                  }
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhyPebPanel({
  settings,
  benefits,
  supabase,
  userEmail,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { settings: SiteSettings; benefits: WhyPebBenefit[] }) {
  const [heading, setHeading] = useState(settings.why_peb_heading);
  const [description, setDescription] = useState(settings.why_peb_description);
  const [appsText, setAppsText] = useState(
    (settings.why_peb_applications || []).join(", "),
  );
  const [editing, setEditing] = useState<Partial<WhyPebBenefit> | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveSectionHeader(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const applications = appsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { error } = await supabase
        .from("site_settings")
        .update({
          why_peb_heading: heading,
          why_peb_description: description,
          why_peb_applications: applications,
        })
        .eq("key", "default");
      if (error) throw error;
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: "UPDATE",
        module: "Why PEB",
        summary: "Updated Why PEB heading and applications",
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      onNotify("success", "Why PEB section updated.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to update Why PEB.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveBenefit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        title: (editing.title || "").trim(),
        description: (editing.description || "").trim(),
        display_order: Number(editing.display_order ?? benefits.length + 1),
        is_published: editing.is_published !== false,
      };
      if (editing.id) {
        const { error } = await supabase
          .from("why_peb_benefits")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("why_peb_benefits")
          .insert(payload);
        if (error) throw error;
      }
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Benefit saved.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save benefit.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Why PEB Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage PEB benefits, heading, and industry application tags.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              title: "",
              description: "",
              display_order: benefits.length + 1,
              is_published: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Benefit
        </button>
      </div>

      <form
        onSubmit={saveSectionHeader}
        className="bg-white border border-slate-200 p-5 space-y-4"
      >
        <h3 className="text-sm font-bold uppercase text-slate-800">
          Section Heading & Applications Strip
        </h3>
        <input
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 text-sm"
          placeholder="Section Heading"
        />
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 text-sm"
          placeholder="Section Description"
        />
        <input
          type="text"
          value={appsText}
          onChange={(e) => setAppsText(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 text-sm"
          placeholder="Applications (comma-separated)"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Section Details
        </button>
      </form>

      {editing && (
        <form
          onSubmit={saveBenefit}
          className="bg-white border border-slate-200 p-5 space-y-4"
        >
          <input
            type="text"
            required
            value={editing.title || ""}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="Benefit Title (e.g. Faster project delivery)"
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
            >
              Save Benefit
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

      <div className="bg-white border border-slate-200 divide-y divide-slate-100">
        {benefits.map((b) => (
          <div
            key={b.id}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-slate-900 text-sm">{b.title}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge published={b.is_published} />
              <button
                type="button"
                onClick={() => setEditing(b)}
                className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() =>
                  onConfirm({
                    title: "Delete Benefit",
                    message: `Remove "${b.title}"?`,
                    onConfirm: async () => {
                      await supabase
                        .from("why_peb_benefits")
                        .delete()
                        .eq("id", b.id);
                      await triggerWebsiteRevalidation();
                      await onRefresh();
                      onNotify("success", "Benefit deleted.");
                    },
                  })
                }
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FacilitiesPanel({
  settings,
  facilities,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { settings: SiteSettings; facilities: FacilityItem[] }) {
  const [heading, setHeading] = useState(settings.facilities_heading);
  const [description, setDescription] = useState(
    settings.facilities_description,
  );
  const [editing, setEditing] = useState<Partial<FacilityItem> | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveHeader(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({
          facilities_heading: heading,
          facilities_description: description,
        })
        .eq("key", "default");
      if (error) throw error;
      await triggerWebsiteRevalidation();
      await onRefresh();
      onNotify("success", "Facilities heading updated.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to update heading.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveFacility(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        item_number: (
          editing.item_number || String(facilities.length + 1).padStart(2, "0")
        ).trim(),
        kind: editing.kind || "machine",
        title: (editing.title || "").trim(),
        subtitle: (editing.subtitle || "").trim(),
        description: (editing.description || "").trim(),
        area_label: (editing.area_label || "").trim(),
        image_url: (editing.image_url || "").trim() || null,
        display_order: Number(editing.display_order ?? facilities.length + 1),
        is_published: editing.is_published !== false,
      };
      if (editing.id) {
        const { error } = await supabase
          .from("facilities")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("facilities").insert(payload);
        if (error) throw error;
      }
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editing.id ? "UPDATE" : "CREATE",
        module: "Facilities",
        recordId: editing.id,
        summary: `${editing.id ? "Updated" : "Added"} facility item "${payload.title}"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Facility item saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save facility.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Facilities Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage main plant image, CNC/H-Beam/SAW machines, and secondary
            fabrication.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              item_number: String(facilities.length).padStart(2, "0"),
              kind: "machine",
              title: "",
              subtitle: "Primary Line",
              description: "",
              area_label: "",
              image_url: "",
              display_order: facilities.length + 1,
              is_published: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Facility Item
        </button>
      </div>

      <form
        onSubmit={saveHeader}
        className="bg-white border border-slate-200 p-5 space-y-4"
      >
        <input
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 text-sm"
          placeholder="Facilities Heading"
        />
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 text-sm"
          placeholder="Facilities Description"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Section Heading
        </button>
      </form>

      {editing && (
        <form
          onSubmit={saveFacility}
          className="bg-white border border-slate-200 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={editing.kind || "machine"}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  kind: e.target.value as FacilityItem["kind"],
                })
              }
              className="px-3 py-2 border border-slate-300 text-sm"
            >
              <option value="hero">Main Facility Hero</option>
              <option value="machine">Machine Card</option>
              <option value="secondary">Secondary Fabrication Block</option>
            </select>
            <input
              type="text"
              required
              value={editing.title || ""}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              placeholder="Title"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              value={editing.subtitle || ""}
              onChange={(e) =>
                setEditing({ ...editing, subtitle: e.target.value })
              }
              placeholder="Highlight (e.g. 5 Acres)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <textarea
              rows={3}
              required
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Description"
              className="sm:col-span-3 px-3 py-2 border border-slate-300 text-sm"
            />
            <div className="sm:col-span-3">
              <ImageUploaderField
                label="Facility / Machine Image"
                value={editing.image_url || ""}
                folder="facilities"
                mediaItems={media}
                onMediaUploaded={onMediaUploaded}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
            >
              {saving ? "Saving..." : "Save & Publish"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className="bg-white border border-slate-200 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#d9272e]">
                {fac.kind} · {fac.subtitle}
              </span>
              <StatusBadge published={fac.is_published} />
            </div>
            {fac.image_url && (
              <img
                src={fac.image_url}
                alt={fac.title}
                className="w-full h-36 object-cover border border-slate-100"
              />
            )}
            <h3 className="font-bold text-slate-900">{fac.title}</h3>
            <p className="text-xs text-slate-600 flex-1">{fac.description}</p>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(fac)}
                className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() =>
                  onConfirm({
                    title: "Delete Facility Item",
                    message: `Delete "${fac.title}"?`,
                    onConfirm: async () => {
                      await supabase
                        .from("facilities")
                        .delete()
                        .eq("id", fac.id);
                      await triggerWebsiteRevalidation();
                      await onRefresh();
                      onNotify("success", "Facility item deleted.");
                    },
                  })
                }
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QualityPanel({
  settings,
  qualityItems,
  qualityStandards,
  supabase,
  userEmail,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & {
  settings: SiteSettings;
  qualityItems: QualityItem[];
  qualityStandards: QualityStandard[];
}) {
  const [heading, setHeading] = useState(settings.quality_heading);
  const [description, setDescription] = useState(settings.quality_description);
  const [editingItem, setEditingItem] = useState<Partial<QualityItem> | null>(
    null,
  );
  const [newStandard, setNewStandard] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveHeader(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await supabase
        .from("site_settings")
        .update({ quality_heading: heading, quality_description: description })
        .eq("key", "default");
      await triggerWebsiteRevalidation();
      await onRefresh();
      onNotify("success", "Quality heading updated.");
    } finally {
      setSaving(false);
    }
  }

  async function saveQualityItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      const payload = {
        item_number: (
          editingItem.item_number ||
          String(qualityItems.length + 1).padStart(2, "0")
        ).trim(),
        title: (editingItem.title || "").trim(),
        description: (editingItem.description || "").trim(),
        display_order: Number(
          editingItem.display_order ?? qualityItems.length + 1,
        ),
        is_published: editingItem.is_published !== false,
      };
      if (editingItem.id) {
        await supabase
          .from("quality_items")
          .update(payload)
          .eq("id", editingItem.id);
      } else {
        await supabase.from("quality_items").insert(payload);
      }
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editingItem.id ? "UPDATE" : "CREATE",
        module: "Quality System",
        summary: `Saved quality pillar "${payload.title}"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditingItem(null);
      onNotify("success", "Quality item saved.");
    } finally {
      setSaving(false);
    }
  }

  async function addStandard(e: React.FormEvent) {
    e.preventDefault();
    if (!newStandard.trim()) return;
    await supabase.from("quality_standards").insert({
      name: newStandard.trim(),
      display_order: qualityStandards.length + 1,
      is_published: true,
    });
    setNewStandard("");
    await triggerWebsiteRevalidation();
    await onRefresh();
    onNotify("success", "Standard code added.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Quality System Management
        </h2>
        <p className="text-sm text-slate-500">
          Manage Quality Assurance, Control, Planning, and reference standards.
        </p>
      </div>

      <form
        onSubmit={saveHeader}
        className="bg-white border border-slate-200 p-5 space-y-4"
      >
        <input
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 text-sm"
        />
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Quality Heading
        </button>
      </form>

      <div className="bg-white border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase text-slate-800">
            Quality Pillars
          </h3>
          <button
            type="button"
            onClick={() =>
              setEditingItem({
                item_number: String(qualityItems.length + 1).padStart(2, "0"),
                title: "",
                description: "",
                is_published: true,
              })
            }
            className="text-xs font-bold text-[#d9272e] hover:underline cursor-pointer"
          >
            + Add Pillar
          </button>
        </div>

        {editingItem && (
          <form
            onSubmit={saveQualityItem}
            className="p-4 bg-slate-50 border border-slate-200 space-y-3"
          >
            <input
              type="text"
              required
              value={editingItem.title || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, title: e.target.value })
              }
              placeholder="Title"
              className="w-full px-3 py-2 border border-slate-300 text-sm bg-white"
            />
            <textarea
              rows={2}
              required
              value={editingItem.description || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, description: e.target.value })
              }
              placeholder="Description"
              className="w-full px-3 py-2 border border-slate-300 text-sm bg-white"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 border border-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-100">
          {qualityItems.map((q) => (
            <div
              key={q.id}
              className="py-3 flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {q.item_number} · {q.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">{q.description}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingItem(q)}
                  className="text-xs font-bold text-[#0d1b2b] cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onConfirm({
                      title: "Delete Quality Item",
                      message: `Delete "${q.title}"?`,
                      onConfirm: async () => {
                        await supabase
                          .from("quality_items")
                          .delete()
                          .eq("id", q.id);
                        await triggerWebsiteRevalidation();
                        await onRefresh();
                        onNotify("success", "Quality item deleted.");
                      },
                    })
                  }
                  className="text-xs font-bold text-red-600 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase text-slate-800">
          Design & Fabrication Reference Standards
        </h3>
        <form onSubmit={addStandard} className="flex gap-2">
          <input
            type="text"
            value={newStandard}
            onChange={(e) => setNewStandard(e.target.value)}
            placeholder="Add standard (e.g. IS 800:2007)"
            className="flex-1 px-3 py-2 border border-slate-300 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
          >
            Add
          </button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {qualityStandards.map((s) => (
            <div
              key={s.id}
              className="p-2.5 border border-slate-200 flex items-center justify-between gap-2 text-xs font-semibold"
            >
              <span>{s.name}</span>
              <button
                type="button"
                onClick={async () => {
                  await supabase
                    .from("quality_standards")
                    .delete()
                    .eq("id", s.id);
                  await triggerWebsiteRevalidation();
                  await onRefresh();
                }}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
