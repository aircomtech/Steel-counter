"use client";

import { useState } from "react";
import { Eye, Plus, Save, Star, Trash2, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MediaLibraryItem,
  OfficeLocation,
  ProjectCategory,
  ProjectItem,
  SiteSettings,
} from "@/lib/cms/types";
import type { UploadedMediaResult } from "@/lib/cloudinary";
import {
  recordAdminActivity,
  slugify,
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

export function ProjectsPanel({
  projects,
  categories,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { projects: ProjectItem[]; categories: ProjectCategory[] }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [editing, setEditing] = useState<Partial<ProjectItem> | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [preview, setPreview] = useState<ProjectItem | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = projects.filter((p) => {
    const matchCat = catFilter === "All" || p.category_name === catFilter;
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category_name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  function startEdit(p?: ProjectItem) {
    if (p) {
      setEditing(p);
      setGalleryUrls((p.gallery || []).map((g) => g.image_url));
    } else {
      setEditing({
        title: "",
        category_name: categories[0]?.name || "Industrial",
        status_label: "Completed Project",
        description: "",
        cover_image_url: "",
        location: "",
        area_sqft: "",
        is_featured: false,
        display_order: projects.length + 1,
        is_published: true,
      });
      setGalleryUrls([]);
    }
    setNewGalleryUrl("");
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    const { error } = await supabase.from("project_categories").insert({
      name,
      slug: slugify(name),
      display_order: categories.length + 1,
      is_published: true,
    });
    if (error) {
      onNotify("error", error.message);
      return;
    }
    setNewCategoryName("");
    await triggerWebsiteRevalidation();
    await onRefresh();
    onNotify("success", `Category "${name}" created.`);
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.cover_image_url) {
      onNotify("error", "Please upload or select a project cover image.");
      return;
    }
    setSaving(true);
    try {
      const catObj = categories.find((c) => c.name === editing.category_name);
      const payload = {
        title: (editing.title || "").trim(),
        slug: editing.id ? editing.slug : `${slugify(editing.title || "project")}-${Date.now().toString().slice(-4)}`,
        category_id: catObj?.id || null,
        category_name: (editing.category_name || "").trim(),
        status_label: (editing.status_label || "Completed Project").trim(),
        description: (editing.description || "").trim(),
        cover_image_url: editing.cover_image_url.trim(),
        location: (editing.location || "").trim(),
        area_sqft: (editing.area_sqft || "").trim(),
        is_featured: Boolean(editing.is_featured),
        display_order: Number(editing.display_order ?? projects.length + 1),
        is_published: editing.is_published !== false,
      };

      let projectId = editing.id;
      if (projectId) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", projectId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        projectId = data.id;
      }

      if (projectId) {
        await supabase
          .from("project_gallery")
          .delete()
          .eq("project_id", projectId);
        if (galleryUrls.length > 0) {
          await supabase.from("project_gallery").insert(
            galleryUrls.map((url, idx) => ({
              project_id: projectId,
              image_url: url,
              caption: payload.title,
              display_order: idx + 1,
            })),
          );
        }
      }

      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editing.id ? "UPDATE" : "CREATE",
        module: "Projects",
        recordId: projectId,
        summary: `${editing.id ? "Updated" : "Added"} project "${payload.title}"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Project saved and published.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save project.",
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
            Projects / Portfolio Management
          </h2>
          <p className="text-sm text-slate-500">
            Add, edit, categorize, feature, and publish projects with cover &
            gallery images.
          </p>
        </div>
        <button
          type="button"
          onClick={() => startEdit()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] hover:bg-[#b81f25] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Project
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, category, or location..."
            className="w-full sm:w-72 px-3 py-2 border border-slate-300 text-sm"
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 text-sm bg-white"
          >
            <option value="All">All Categories ({projects.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={addCategory} className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Create new category (e.g. Aviation)"
            className="flex-1 min-w-[200px] px-3 py-1.5 border border-slate-300 text-xs"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
          >
            + Add Category
          </button>
        </form>
      </div>

      {editing && (
        <form
          onSubmit={saveProject}
          className="bg-white border border-slate-200 p-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase">
              {editing.id ? "Edit Project" : "New Project"}
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
                Project Name
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
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Category
              </label>
              <select
                value={editing.category_name || ""}
                onChange={(e) =>
                  setEditing({ ...editing, category_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm bg-white"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Project Status Label
              </label>
              <select
                value={editing.status_label || "Completed Project"}
                onChange={(e) =>
                  setEditing({ ...editing, status_label: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm bg-white"
              >
                <option value="Completed Project">Completed Project</option>
                <option value="Work in Progress">Work in Progress</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={editing.display_order ?? 1}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    display_order: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                value={editing.location || ""}
                onChange={(e) =>
                  setEditing({ ...editing, location: e.target.value })
                }
                placeholder="e.g. Hyderabad, Telangana"
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Built-up Area (Optional)
              </label>
              <input
                type="text"
                value={editing.area_sqft || ""}
                onChange={(e) =>
                  setEditing({ ...editing, area_sqft: e.target.value })
                }
                placeholder="e.g. 120,000 sq. ft."
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Project Description (Optional)
              </label>
              <textarea
                rows={3}
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploaderField
                label="Cover Image"
                value={editing.cover_image_url || ""}
                folder="projects"
                mediaItems={media}
                onMediaUploaded={onMediaUploaded}
                onChange={(url) =>
                  setEditing({ ...editing, cover_image_url: url })
                }
              />
            </div>

            <div className="md:col-span-2 space-y-3 border border-slate-200 p-4 bg-slate-50">
              <p className="text-xs font-bold uppercase text-slate-700">
                Additional Gallery Images ({galleryUrls.length})
              </p>
              <ImageUploaderField
                label="Upload or Select Gallery Image"
                value={newGalleryUrl}
                folder="projects"
                mediaItems={media}
                onMediaUploaded={onMediaUploaded}
                onChange={(url) => {
                  if (url && !galleryUrls.includes(url)) {
                    setGalleryUrls((prev) => [...prev, url]);
                    setNewGalleryUrl("");
                  }
                }}
              />
              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {galleryUrls.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="relative border border-slate-200 bg-white"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryUrls((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-1 right-1 bg-black/75 text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={Boolean(editing.is_featured)}
                onChange={(e) =>
                  setEditing({ ...editing, is_featured: e.target.checked })
                }
              />
              Featured Project
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={editing.is_published !== false}
                onChange={(e) =>
                  setEditing({ ...editing, is_published: e.target.checked })
                }
              />
              Published (uncheck to save as Draft)
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
            >
              {saving ? "Saving..." : "Save & Publish Project"}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="relative h-44 bg-slate-100">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-1.5">
                <StatusBadge published={project.is_published} />
                {project.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0d1b2b] text-white text-[10px] font-bold uppercase">
                    <Star className="w-3 h-3 text-amber-400" /> Featured
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase text-[#d9272e]">
                {project.category_name || project.status_label}
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                {project.title}
              </h3>
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreview(project)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(project)}
                    className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onConfirm({
                        title: "Delete Project",
                        message: `Delete "${project.title}" from the published website?`,
                        onConfirm: async () => {
                          const { error } = await supabase
                            .from("projects")
                            .delete()
                            .eq("id", project.id);
                          if (error) {
                            onNotify("error", error.message);
                            return;
                          }
                          await recordAdminActivity(supabase, {
                            actorEmail: userEmail,
                            action: "DELETE",
                            module: "Projects",
                            recordId: project.id,
                            summary: `Deleted project "${project.title}"`,
                          });
                          await triggerWebsiteRevalidation();
                          await onRefresh();
                          onNotify("success", "Project deleted from website.");
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
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white w-full max-w-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview.cover_image_url}
              alt={preview.title}
              className="w-full max-h-80 object-cover"
            />
            <div className="p-6 space-y-2">
              <span className="text-xs font-bold uppercase text-[#d9272e]">
                {preview.category_name || preview.status_label}
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {preview.title}
              </h3>
              {preview.description && (
                <p className="text-sm text-slate-600">{preview.description}</p>
              )}
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="mt-3 px-4 py-2 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OfficesPanel({
  offices,
  supabase,
  userEmail,
  media,
  onMediaUploaded,
  onRefresh,
  onNotify,
  onConfirm,
}: BaseProps & { offices: OfficeLocation[] }) {
  const [editing, setEditing] = useState<Partial<OfficeLocation> | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveOffice(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        office_type: (editing.office_type || "Branch Office").trim(),
        city: (editing.city || "").trim(),
        address: (editing.address || "").trim(),
        phone: (editing.phone || "").trim(),
        email: (editing.email || "").trim(),
        map_embed_url: (editing.map_embed_url || "").trim(),
        directions_url: (editing.directions_url || "").trim(),
        image_url: (editing.image_url || "").trim() || null,
        show_in_contact: editing.show_in_contact !== false,
        display_order: Number(editing.display_order ?? offices.length + 1),
        is_published: editing.is_published !== false,
      };
      if (editing.id) {
        const { error } = await supabase
          .from("office_locations")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("office_locations")
          .insert(payload);
        if (error) throw error;
      }
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: editing.id ? "UPDATE" : "CREATE",
        module: "Office Locations",
        recordId: editing.id,
        summary: `${editing.id ? "Updated" : "Added"} office "${payload.city} (${payload.office_type})"`,
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      setEditing(null);
      onNotify("success", "Office location saved.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save office location.",
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
            Office Locations Management
          </h2>
          <p className="text-sm text-slate-500">
            Edit Hyderabad, Pune, Seriguda, or add new branch offices.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              office_type: "Branch Office",
              city: "",
              address: "",
              phone: "",
              email: "",
              map_embed_url: "",
              directions_url: "",
              image_url: "",
              show_in_contact: true,
              display_order: offices.length + 1,
              is_published: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Office Location
        </button>
      </div>

      {editing && (
        <form
          onSubmit={saveOffice}
          className="bg-white border border-slate-200 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={editing.office_type || ""}
              onChange={(e) =>
                setEditing({ ...editing, office_type: e.target.value })
              }
              placeholder="Office Type (e.g. Head Office)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              required
              value={editing.city || ""}
              onChange={(e) => setEditing({ ...editing, city: e.target.value })}
              placeholder="City (e.g. Hyderabad)"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="text"
              value={editing.phone || ""}
              onChange={(e) =>
                setEditing({ ...editing, phone: e.target.value })
              }
              placeholder="Phone Number"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="email"
              value={editing.email || ""}
              onChange={(e) =>
                setEditing({ ...editing, email: e.target.value })
              }
              placeholder="Email Address"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <textarea
              rows={3}
              required
              value={editing.address || ""}
              onChange={(e) =>
                setEditing({ ...editing, address: e.target.value })
              }
              placeholder="Full Address"
              className="md:col-span-2 px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="url"
              value={editing.map_embed_url || ""}
              onChange={(e) =>
                setEditing({ ...editing, map_embed_url: e.target.value })
              }
              placeholder="Google Maps Embed URL"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <input
              type="url"
              value={editing.directions_url || ""}
              onChange={(e) =>
                setEditing({ ...editing, directions_url: e.target.value })
              }
              placeholder="Google Maps Directions URL"
              className="px-3 py-2 border border-slate-300 text-sm"
            />
            <div className="md:col-span-2">
              <ImageUploaderField
                label="Office Photo (Optional — replaces map if provided)"
                value={editing.image_url || ""}
                folder="offices"
                mediaItems={media}
                onMediaUploaded={onMediaUploaded}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.show_in_contact !== false}
                onChange={(e) =>
                  setEditing({ ...editing, show_in_contact: e.target.checked })
                }
              />
              Show in Contact Section
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
              {saving ? "Saving..." : "Save Office"}
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
        {offices.map((off) => (
          <div
            key={off.id}
            className="bg-white border border-slate-200 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#d9272e]">
                {off.office_type}
              </span>
              <StatusBadge published={off.is_published} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{off.city}</h3>
            <p className="text-xs text-slate-600 whitespace-pre-line flex-1">
              {off.address}
            </p>
            {off.phone && (
              <p className="text-xs font-semibold text-slate-800">
                {off.phone}
              </p>
            )}
            {off.email && (
              <p className="text-xs text-slate-600">{off.email}</p>
            )}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(off)}
                className="text-xs font-bold text-[#0d1b2b] cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() =>
                  onConfirm({
                    title: "Delete Office Location",
                    message: `Delete "${off.city} (${off.office_type})"?`,
                    onConfirm: async () => {
                      await supabase
                        .from("office_locations")
                        .delete()
                        .eq("id", off.id);
                      await triggerWebsiteRevalidation();
                      await onRefresh();
                      onNotify("success", "Office location deleted.");
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
  );
}

export function ContactInfoPanel({
  settings,
  supabase,
  userEmail,
  onRefresh,
  onNotify,
}: {
  settings: SiteSettings;
  supabase: SupabaseClient;
  userEmail: string;
  onRefresh: () => Promise<void>;
  onNotify: (type: "success" | "error", message: string) => void;
}) {
  const [enquiryEmail, setEnquiryEmail] = useState(settings.enquiry_email);
  const [heading, setHeading] = useState(settings.contact_heading);
  const [description, setDescription] = useState(settings.contact_description);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({
          enquiry_email: enquiryEmail.trim(),
          contact_heading: heading.trim(),
          contact_description: description.trim(),
        })
        .eq("key", "default");
      if (error) throw error;
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: "UPDATE",
        module: "Contact Information",
        summary: "Updated contact section details",
      });
      await triggerWebsiteRevalidation();
      await onRefresh();
      onNotify("success", "Contact information updated.");
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Failed to save contact info.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Contact Information
          </h2>
          <p className="text-sm text-slate-500">
            Edit the Contact section heading, description, and primary sales
            email.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save & Publish
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Primary Sales / Enquiry Email
          </label>
          <input
            type="email"
            required
            value={enquiryEmail}
            onChange={(e) => setEnquiryEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Contact Section Heading
          </label>
          <input
            type="text"
            required
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
            Contact Section Description
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 text-sm"
          />
        </div>
      </div>
    </form>
  );
}
