"use client";

import { useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Eye,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContactEnquiry, MediaLibraryItem } from "@/lib/cms/types";
import {
  MEDIA_FOLDERS,
  uploadImageAsset,
  type MediaFolder,
  type UploadedMediaResult,
} from "@/lib/cloudinary";
import { recordAdminActivity } from "@/lib/admin/cms-helpers";
import type { ConfirmState } from "./AdminShared";

export function EnquiriesPanel({
  enquiries,
  supabase,
  userEmail,
  onRefresh,
  onNotify,
  onConfirm,
}: {
  enquiries: ContactEnquiry[];
  supabase: SupabaseClient;
  userEmail: string;
  onRefresh: () => Promise<void>;
  onNotify: (type: "success" | "error", message: string) => void;
  onConfirm: (c: ConfirmState) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);

  const filtered = enquiries.filter((e) => {
    const matchStatus = statusFilter === "All" || e.status === statusFilter;
    const matchDate =
      !dateFilter || e.created_at.slice(0, 10) === dateFilter;
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      e.customer_name.toLowerCase().includes(q) ||
      e.company_name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      e.project_location.toLowerCase().includes(q);
    return matchStatus && matchDate && matchQ;
  });

  async function updateStatus(
    enquiry: ContactEnquiry,
    status: ContactEnquiry["status"],
  ) {
    const { error } = await supabase
      .from("contact_enquiries")
      .update({ status })
      .eq("id", enquiry.id);
    if (error) {
      onNotify("error", error.message);
      return;
    }
    await recordAdminActivity(supabase, {
      actorEmail: userEmail,
      action: "UPDATE",
      module: "Enquiries",
      recordId: enquiry.id,
      summary: `Marked enquiry from "${enquiry.customer_name}" as ${status}`,
    });
    await onRefresh();
    if (selected?.id === enquiry.id) {
      setSelected({ ...enquiry, status });
    }
    onNotify("success", `Enquiry marked as ${status}.`);
  }

  function exportCsv() {
    const headers = [
      "Date",
      "Customer Name",
      "Company",
      "Phone",
      "Email",
      "Location",
      "Requirements",
      "Status",
    ];
    const escape = (val: string) =>
      `"${String(val || "").replace(/"/g, '""')}"`;
    const rows = filtered.map((e) =>
      [
        new Date(e.created_at).toISOString(),
        e.customer_name,
        e.company_name,
        e.phone,
        e.email,
        e.project_location,
        e.project_requirements,
        e.status,
      ]
        .map(escape)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contour-steel-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const statusColors: Record<ContactEnquiry["status"], string> = {
    New: "bg-red-50 text-[#d9272e] border-red-200",
    Contacted: "bg-blue-50 text-blue-700 border-blue-200",
    "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Enquiry Management
          </h2>
          <p className="text-sm text-slate-500">
            Review customer enquiries, update status, and export records.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, company, phone, email, location..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 text-sm bg-white"
        >
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 text-sm"
        />
      </div>

      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-600">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No enquiries match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id}>
                  <td className="p-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">
                      {e.customer_name}
                    </p>
                    {e.company_name && (
                      <p className="text-xs text-slate-500">{e.company_name}</p>
                    )}
                  </td>
                  <td className="p-3 text-xs text-slate-700">
                    {e.phone && <div>{e.phone}</div>}
                    {e.email && <div>{e.email}</div>}
                  </td>
                  <td className="p-3 text-xs text-slate-600">
                    {e.project_location || "—"}
                  </td>
                  <td className="p-3">
                    <select
                      value={e.status}
                      onChange={(ev) =>
                        updateStatus(
                          e,
                          ev.target.value as ContactEnquiry["status"],
                        )
                      }
                      className={`px-2 py-1 text-xs font-bold border ${statusColors[e.status]}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-3 text-right space-x-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelected(e)}
                      className="text-xs font-bold text-[#0d1b2b] hover:underline cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onConfirm({
                          title: "Delete Enquiry",
                          message: `Delete enquiry from "${e.customer_name}"?`,
                          onConfirm: async () => {
                            await supabase
                              .from("contact_enquiries")
                              .delete()
                              .eq("id", e.id);
                            await recordAdminActivity(supabase, {
                              actorEmail: userEmail,
                              action: "DELETE",
                              module: "Enquiries",
                              recordId: e.id,
                              summary: `Deleted enquiry from "${e.customer_name}"`,
                            });
                            await onRefresh();
                            onNotify("success", "Enquiry deleted.");
                          },
                        })
                      }
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-lg border border-slate-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Enquiry Details</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {selected.customer_name}
              </p>
              <p>
                <strong>Company:</strong> {selected.company_name || "—"}
              </p>
              <p>
                <strong>Phone:</strong> {selected.phone || "—"}
              </p>
              <p>
                <strong>Email:</strong> {selected.email || "—"}
              </p>
              <p>
                <strong>Location:</strong> {selected.project_location || "—"}
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(selected.created_at).toLocaleString()}
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200">
                <strong className="block text-xs uppercase text-slate-500 mb-1">
                  Project Requirements
                </strong>
                <p className="whitespace-pre-line text-slate-800">
                  {selected.project_requirements}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {(
                ["New", "Contacted", "In Progress", "Completed"] as const
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateStatus(selected, st)}
                  className={`px-3 py-1.5 text-xs font-bold border cursor-pointer ${
                    selected.status === st
                      ? "bg-[#0d1b2b] text-white border-[#0d1b2b]"
                      : "border-slate-300 text-slate-700"
                  }`}
                >
                  Mark {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MediaLibraryPanel({
  media,
  supabase,
  userEmail,
  onMediaUploaded,
  onRefresh,
  onNotify,
  onConfirm,
}: {
  media: MediaLibraryItem[];
  supabase: SupabaseClient;
  userEmail: string;
  onMediaUploaded: (res: UploadedMediaResult) => Promise<void>;
  onRefresh: () => Promise<void>;
  onNotify: (type: "success" | "error", message: string) => void;
  onConfirm: (c: ConfirmState) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [folder, setFolder] = useState<MediaFolder>("projects");
  const [filterFolder, setFilterFolder] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaLibraryItem | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadImageAsset(file, folder, setProgress);
      await onMediaUploaded(res);
      await recordAdminActivity(supabase, {
        actorEmail: userEmail,
        action: "UPLOAD",
        module: "Media Library",
        summary: `Uploaded "${res.original_filename}" to ${folder}`,
      });
      await onRefresh();
      onNotify("success", `Uploaded "${res.original_filename}" successfully.`);
    } catch (err) {
      onNotify(
        "error",
        err instanceof Error ? err.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function copyUrl(item: MediaLibraryItem) {
    await navigator.clipboard.writeText(item.secure_url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  const filtered = media.filter((m) => {
    const matchFolder = filterFolder === "all" || m.folder === filterFolder;
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      m.filename.toLowerCase().includes(q) ||
      m.folder.toLowerCase().includes(q) ||
      m.alt_text.toLowerCase().includes(q);
    return matchFolder && matchQ;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Media Library</h2>
          <p className="text-sm text-slate-500">
            Upload, organize, preview, copy URLs, and manage website images.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value as MediaFolder)}
            className="px-3 py-2 bg-white border border-slate-300 text-xs font-bold uppercase"
          >
            {MEDIA_FOLDERS.map((f) => (
              <option key={f} value={f}>
                Folder: {f}
              </option>
            ))}
          </select>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#d9272e] text-white text-xs font-bold cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? `Uploading ${progress}%` : "Upload Image"}
          </button>
        </div>
      </div>

      {uploading && (
        <div className="w-full bg-slate-200 h-2 overflow-hidden">
          <div
            className="bg-[#d9272e] h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="bg-white border border-slate-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search images by filename..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 text-sm"
        />
        <select
          value={filterFolder}
          onChange={(e) => setFilterFolder(e.target.value)}
          className="px-3 py-2 border border-slate-300 text-sm bg-white"
        >
          <option value="all">All Folders ({media.length})</option>
          {MEDIA_FOLDERS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 p-10 text-center text-sm text-slate-500">
          No images in this folder yet. Click &ldquo;Upload Image&rdquo; to add
          images.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="h-36 bg-slate-100 relative">
                <img
                  src={item.secure_url}
                  alt={item.alt_text || item.filename}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-[#0d1b2b]/85 text-white text-[10px] font-bold uppercase px-1.5 py-0.5">
                  {item.folder}
                </span>
              </div>
              <div className="p-3 space-y-2 flex-1 flex flex-col">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {item.filename}
                </p>
                <p className="text-[11px] text-slate-500">
                  {item.format.toUpperCase()}
                  {item.width && item.height
                    ? ` · ${item.width}×${item.height}`
                    : ""}
                  {item.bytes ? ` · ${Math.round(item.bytes / 1024)} KB` : ""}
                </p>
                <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(item)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0d1b2b] cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />{" "}
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy URL
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreview(item)}
                      className="text-slate-600 hover:text-slate-900 cursor-pointer"
                      aria-label="Preview image"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onConfirm({
                          title: "Delete Image",
                          message: `Delete "${item.filename}"? Unused images only; images in active use cannot be deleted.`,
                          onConfirm: async () => {
                            const res = await fetch("/api/media/delete", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: item.id,
                                secure_url: item.secure_url,
                              }),
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              onNotify(
                                "error",
                                data.error || "Failed to delete image.",
                              );
                              return;
                            }
                            await recordAdminActivity(supabase, {
                              actorEmail: userEmail,
                              action: "DELETE",
                              module: "Media Library",
                              recordId: item.id,
                              summary: `Deleted unused image "${item.filename}"`,
                            });
                            await onRefresh();
                            onNotify("success", "Image deleted from library.");
                          },
                        })
                      }
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      aria-label="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white max-w-2xl w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview.secure_url}
              alt={preview.filename}
              className="w-full max-h-[70vh] object-contain bg-slate-100"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-mono text-slate-600 truncate">
                {preview.secure_url}
              </p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="px-3 py-1.5 bg-[#0d1b2b] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
