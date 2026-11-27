"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, Plus, Save, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AboutSection,
  Achievement,
  HeroSlide,
  MediaLibraryItem,
  Milestone,
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

export function HeroSliderPanel({
  slides,
  slideDurationMs,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { slides: HeroSlide[]; slideDurationMs: number }) {
  const [editing, setEditing] = useState<Partial<HeroSlide> | null>(null);
  const [preview, setPreview] = useState<HeroSlide | null>(null);
  const [duration, setDuration] = useState(slideDurationMs);
  const [saving, setSaving] = useState(false);

  async function saveDuration() {
    const { error } = await supabase
      .from("site_settings")
      .update({ hero_slide_duration_ms: Number(duration) || 5500 })
      .eq("key", "default");
    if (error) {
      onNotify("error", error.message);
      return;
    }
    await triggerWebsiteRevalidation();
    await onRefresh();
    onNotify("success", "Slide duration updated.");
  }

  async function saveSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.desktop_image_url) {
      onNotify("error", "Please upload or select a desktop hero image.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tag: (editing.tag || "Slide").trim(),
        kicker: (editing.kicker || "").trim(),
        title: (editing.title || "").trim(),
        copy: (editing.copy || "").trim(),
        desktop_image_url: editing.desktop_image_url.trim(),
        mobile_image_url:
          (editing.mobile_image_url || "").trim() ||
          editing.desktop_image_url.trim(),
        video_url: (editing.video_url || "").trim() || null,
        primary_cta_label: (editing.primary_cta_label || "Learn More").trim(),
        primary_cta_url: (editing.primary_cta_url || "#about").trim(),
        secondary_cta_label: (
          editing.secondary_cta_label || "Request a Quote"
        ).trim(),
        secondary_cta_url: (editing.secondary_cta_url || "#contact").trim(),
        display_order: Number(editing.display_order ?? slides.length + 1),
        is_published: editing.is_published !== false,
      };

      if (editing.id) {
        const { error } = await supabase
          .from("hero_slides")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_slides").insert(payload);
        if (error) throw error;
      }

      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editing.id ? "UPDATE" : "CREATE",
        module: "Hero Slider",
        recordId: editing.id,
        summary: `${editing.id ? "Updated" : "Created"} hero slide "${payload.title}"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Hero slide saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save hero slide.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveOrder(slide: HeroSlide, delta: number) {
    const idx = slides.findIndex((s) => s.id === slide.id);
    const swap = slides[idx + delta];
    if (!swap) return;
    await Promise.all([
      supabase
        .from("hero_slides")
        .update({ display_order: swap.display_order })
        .eq("id", slide.id),
      supabase
        .from("hero_slides")
        .update({ display_order: slide.display_order })
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
            Hero Slider Management
          </h2>
          <p className="text-sm text-slate-500">
            Upload desktop/mobile hero images, edit headings, CTAs, order, and
            duration.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              tag: "",
              kicker: "",
              title: "",
              copy: "",
              desktop_image_url: "",
              mobile_image_url: "",
              video_url: "",
              primary_cta_label: "Discover Contour",
              primary_cta_url: "#about",
              secondary_cta_label: "Request a Quote",
              secondary_cta_url: "#contact",
              display_order: slides.length + 1,
              is_published: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Hero Slide
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-bold uppercase text-slate-700">
          Auto-Slide Duration (ms):
        </label>
        <input
          type="number"
          min={2500}
          step={500}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-32 px-3 py-1.5 border border-slate-300 text-sm"
        />
        <button
          type="button"
          onClick={saveDuration}
          className="px-3.5 py-1.5 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
        >
          Update Duration
        </button>
      </div>

      {editing && (
        <form
          onSubmit={saveSlide}
          className="bg-white border border-slate-200 p-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase">
              {editing.id ? "Edit Hero Slide" : "Add New Hero Slide"}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Slide Tab Label (e.g. About Us)
              </label>
              <input
                type="text"
                required
                value={editing.tag || ""}
                onChange={(e) =>
                  setEditing({ ...editing, tag: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Subheading / Kicker
              </label>
              <input
                type="text"
                required
                value={editing.kicker || ""}
                onChange={(e) =>
                  setEditing({ ...editing, kicker: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Main Heading
              </label>
              <input
                type="text"
                required
                value={editing.title || ""}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                required
                value={editing.copy || ""}
                onChange={(e) =>
                  setEditing({ ...editing, copy: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>

            <ImageUploaderField
              label="Desktop Background Image"
              value={editing.desktop_image_url || ""}
              folder="hero"
              mediaItems={media}
              onMediaUploaded={onMediaUploaded}
              onChange={(url) =>
                setEditing({ ...editing, desktop_image_url: url })
              }
            />
            <ImageUploaderField
              label="Mobile Background Image (Optional)"
              value={editing.mobile_image_url || ""}
              folder="hero"
              mediaItems={media}
              onMediaUploaded={onMediaUploaded}
              onChange={(url) =>
                setEditing({ ...editing, mobile_image_url: url })
              }
              hint="Defaults to desktop image if left blank."
            />

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Primary Button Text
              </label>
              <input
                type="text"
                value={editing.primary_cta_label || ""}
                onChange={(e) =>
                  setEditing({ ...editing, primary_cta_label: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Primary Button URL
              </label>
              <input
                type="text"
                value={editing.primary_cta_url || ""}
                onChange={(e) =>
                  setEditing({ ...editing, primary_cta_url: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Secondary Button Text
              </label>
              <input
                type="text"
                value={editing.secondary_cta_label || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    secondary_cta_label: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Secondary Button URL
              </label>
              <input
                type="text"
                value={editing.secondary_cta_url || ""}
                onChange={(e) =>
                  setEditing({ ...editing, secondary_cta_url: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Background Video URL (Optional)
              </label>
              <input
                type="text"
                value={editing.video_url || ""}
                onChange={(e) =>
                  setEditing({ ...editing, video_url: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={editing.is_published !== false}
                  onChange={(e) =>
                    setEditing({ ...editing, is_published: e.target.checked })
                  }
                />
                Published on Website
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
            >
              {saving ? "Saving..." : "Save & Publish Slide"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2.5 border border-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="bg-white border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="relative h-44 bg-slate-200">
              <img
                src={slide.desktop_image_url}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <span className="bg-[#0d1b2b] text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                  #{idx + 1} · {slide.tag}
                </span>
                <StatusBadge published={slide.is_published} />
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#d9272e]">
                {slide.kicker}
              </p>
              <h3 className="font-bold text-slate-900 text-base">
                {slide.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2">{slide.copy}</p>

              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveOrder(slide, -1)}
                    className="p-1.5 border border-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                    aria-label="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === slides.length - 1}
                    onClick={() => moveOrder(slide, 1)}
                    className="p-1.5 border border-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreview(slide)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(slide)}
                    className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onConfirm({
                        title: "Delete Hero Slide",
                        message: `Delete "${slide.title}" from the hero slider?`,
                        onConfirm: async () => {
                          const { error } = await supabase
                            .from("hero_slides")
                            .delete()
                            .eq("id", slide.id);
                          if (error) {
                            onNotify("error", error.message);
                            return;
                          }
                          await recordAdminActivity(supabase, {
                            actorEmail: userEmail,
                            action: "DELETE",
                            module: "Hero Slider",
                            recordId: slide.id,
                            summary: `Deleted hero slide "${slide.title}"`,
                          });
                          await triggerWebsiteRevalidation();
                          await onRefresh();
                          onNotify("success", "Hero slide deleted.");
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
          </div>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative w-full max-w-4xl h-[440px] bg-[#08111c] text-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview.desktop_image_url}
              alt={preview.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 z-10 bg-black/70 text-white p-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative z-10 h-full flex flex-col justify-center p-8 sm:p-12 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff767b]">
                {preview.kicker}
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold mt-3">
                {preview.title}
              </h3>
              <p className="text-sm text-slate-200 mt-3">{preview.copy}</p>
              <div className="flex gap-3 mt-6">
                <span className="px-4 py-2 bg-[#d9272e] text-xs font-bold">
                  {preview.primary_cta_label}
                </span>
                <span className="px-4 py-2 border border-white/60 text-xs font-bold">
                  {preview.secondary_cta_label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AboutPanel({
  about,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
}: BaseProps & { about: AboutSection }) {
  const [form, setForm] = useState<AboutSection>(about);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("about_sections")
        .upsert({ ...form, key: "main" }, { onConflict: "key" });
      if (error) throw error;
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: "UPDATE",
        module: "About Us",
        summary: "Updated About Us section",
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      onNotify("success", "About Us section saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save About Us.",
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
            About Us Management
          </h2>
          <p className="text-sm text-slate-500">
            Edit About Us heading, paragraphs, image, CTA, and visibility.
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
            Section Number
          </label>
          <input
            type="text"
            value={form.section_number}
            onChange={(e) =>
              setForm({ ...form, section_number: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Section Heading
          </label>
          <input
            type="text"
            value={form.section_heading}
            onChange={(e) =>
              setForm({ ...form, section_heading: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Main Title
          </label>
          <input
            type="text"
            value={form.main_title}
            onChange={(e) => setForm({ ...form, main_title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Primary Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase text-slate-700">
              Additional Paragraphs
            </label>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  additional_paragraphs: [
                    ...(form.additional_paragraphs || []),
                    "",
                  ],
                })
              }
              className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
            >
              + Add Paragraph
            </button>
          </div>
          {(form.additional_paragraphs || []).map((p, idx) => (
            <div key={idx} className="flex gap-2">
              <textarea
                rows={2}
                value={p}
                onChange={(e) => {
                  const next = [...form.additional_paragraphs];
                  next[idx] = e.target.value;
                  setForm({ ...form, additional_paragraphs: next });
                }}
                className="flex-1 px-3 py-2 border border-slate-300 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    additional_paragraphs: form.additional_paragraphs.filter(
                      (_, i) => i !== idx,
                    ),
                  })
                }
                className="px-3 text-xs font-bold text-red-600 border border-red-200 cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            CTA Text
          </label>
          <input
            type="text"
            value={form.cta_text}
            onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            CTA URL
          </label>
          <input
            type="text"
            value={form.cta_url}
            onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <ImageUploaderField
            label="About Section Image (Optional)"
            value={form.image_url || ""}
            folder="about"
            mediaItems={media}
            onMediaUploaded={onMediaUploaded}
            onChange={(url) => setForm({ ...form, image_url: url || null })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) =>
              setForm({ ...form, is_published: e.target.checked })
            }
          />
          Show About Section on Website
        </label>
      </div>
    </form>
  );
}

export function AchievementsPanel({
  achievements,
  supabase,
  userEmail,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { achievements: Achievement[] }) {
  const [editing, setEditing] = useState<Partial<Achievement> | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        icon: (editing.icon || "★").trim(),
        figure: (editing.figure || "").trim(),
        unit: (editing.unit || "").trim(),
        description: (editing.description || "").trim(),
        is_featured: Boolean(editing.is_featured),
        display_order: Number(editing.display_order ?? achievements.length + 1),
        is_published: editing.is_published !== false,
      };
      if (editing.id) {
        const { error } = await supabase
          .from("achievements")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("achievements").insert(payload);
        if (error) throw error;
      }
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editing.id ? "UPDATE" : "CREATE",
        module: "Achievements",
        recordId: editing.id,
        summary: `${editing.id ? "Updated" : "Added"} achievement "${payload.figure} ${payload.unit}"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Achievement saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save achievement.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveOrder(item: Achievement, delta: number) {
    const idx = achievements.findIndex((a) => a.id === item.id);
    const swap = achievements[idx + delta];
    if (!swap) return;
    await Promise.all([
      supabase
        .from("achievements")
        .update({ display_order: swap.display_order })
        .eq("id", item.id),
      supabase
        .from("achievements")
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
            Achievements Management
          </h2>
          <p className="text-sm text-slate-500">
            Edit figures, units, descriptions, featured highlights, and order.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              icon: "★",
              figure: "",
              unit: "",
              description: "",
              is_featured: false,
              display_order: achievements.length + 1,
              is_published: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Achievement Card
        </button>
      </div>

      {editing && (
        <form
          onSubmit={saveItem}
          className="bg-white border border-slate-200 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              type="text"
              value={editing.icon || ""}
              onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
              placeholder="Icon (e.g. XIX)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              required
              value={editing.figure || ""}
              onChange={(e) =>
                setEditing({ ...editing, figure: e.target.value })
              }
              placeholder="Figure (e.g. 1,100+)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              required
              value={editing.unit || ""}
              onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
              placeholder="Unit (e.g. Structures)"
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
            <textarea
              rows={2}
              required
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Description"
              className="sm:col-span-4 px-3 py-2 border border-slate-300 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(editing.is_featured)}
                onChange={(e) =>
                  setEditing({ ...editing, is_featured: e.target.checked })
                }
              />
              Featured Dark Card
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
              {saving ? "Saving..." : "Save Card"}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {achievements.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d9272e]">
                {item.icon} · #{idx + 1}
              </span>
              <StatusBadge published={item.is_published} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {item.figure}
            </p>
            <p className="text-xs font-bold uppercase text-slate-600">
              {item.unit}
            </p>
            <p className="text-xs text-slate-600 flex-1">{item.description}</p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveOrder(item, -1)}
                  className="p-1 border border-slate-200 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === achievements.length - 1}
                  onClick={() => moveOrder(item, 1)}
                  className="p-1 border border-slate-200 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-3">
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
                      title: "Delete Achievement",
                      message: `Delete "${item.figure} ${item.unit}"?`,
                      onConfirm: async () => {
                        const { error } = await supabase
                          .from("achievements")
                          .delete()
                          .eq("id", item.id);
                        if (error) {
                          onNotify("error", error.message);
                          return;
                        }
                        await recordAdminActivity(supabase, {
                          actorEmail: userEmail,
                          action: "DELETE",
                          module: "Achievements",
                          recordId: item.id,
                          summary: `Deleted achievement "${item.figure} ${item.unit}"`,
                        });
                        await triggerWebsiteRevalidation();
                        await onRefresh();
                        onNotify("success", "Achievement deleted.");
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

export function MilestonesPanel({
  milestones,
  supabase,
  userEmail,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { milestones: Milestone[] }) {
  const [editing, setEditing] = useState<Partial<Milestone> | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        year_label: (editing.year_label || "").trim(),
        title: (editing.title || "").trim(),
        subtitle: (editing.subtitle || "").trim(),
        description: (editing.description || "").trim(),
        display_order: Number(editing.display_order ?? milestones.length + 1),
        is_published: editing.is_published !== false,
      };
      if (editing.id) {
        const { error } = await supabase
          .from("milestones")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("milestones").insert(payload);
        if (error) throw error;
      }
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editing.id ? "UPDATE" : "CREATE",
        module: "Milestones",
        recordId: editing.id,
        summary: `${editing.id ? "Updated" : "Added"} milestone "${payload.year_label} ${payload.title}"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Milestone saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save milestone.",
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
            Milestones Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage company timeline milestones displayed below achievements.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              year_label: "",
              title: "",
              subtitle: "",
              description: "",
              display_order: milestones.length + 1,
              is_published: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {editing && (
        <form
          onSubmit={saveMilestone}
          className="bg-white border border-slate-200 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              required
              value={editing.year_label || ""}
              onChange={(e) =>
                setEditing({ ...editing, year_label: e.target.value })
              }
              placeholder="Year (e.g. 2026)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
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
              placeholder="Location / Subtitle"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <textarea
              rows={2}
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Description"
              className="sm:col-span-3 px-3 py-2 border border-slate-300 text-sm"
            />
          </div>
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
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
            >
              {saving ? "Saving..." : "Save Milestone"}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-slate-200 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-[#d9272e]">
                {m.year_label}
              </span>
              <StatusBadge published={m.is_published} />
            </div>
            <h3 className="font-bold text-slate-900">{m.title}</h3>
            {m.subtitle && (
              <p className="text-xs font-semibold text-slate-500">
                {m.subtitle}
              </p>
            )}
            <p className="text-xs text-slate-600 flex-1">{m.description}</p>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(m)}
                className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() =>
                  onConfirm({
                    title: "Delete Milestone",
                    message: `Delete milestone "${m.year_label} ${m.title}"?`,
                    onConfirm: async () => {
                      const { error } = await supabase
                        .from("milestones")
                        .delete()
                        .eq("id", m.id);
                      if (error) {
                        onNotify("error", error.message);
                        return;
                      }
                      await recordAdminActivity(supabase, {
                        actorEmail: userEmail,
                        action: "DELETE",
                        module: "Milestones",
                        recordId: m.id,
                        summary: `Deleted milestone "${m.title}"`,
                      });
                      await triggerWebsiteRevalidation();
                      await onRefresh();
                      onNotify("success", "Milestone deleted.");
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
