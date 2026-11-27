"use client";

import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";
import {
  uploadImageAsset,
  type MediaFolder,
  type UploadedMediaResult,
} from "@/lib/cloudinary";
import type { MediaLibraryItem } from "@/lib/cms/types";

interface ImageUploaderFieldProps {
  label: string;
  value: string;
  folder: MediaFolder;
  mediaItems: MediaLibraryItem[];
  onChange: (url: string) => void;
  onMediaUploaded?: (result: UploadedMediaResult) => Promise<void> | void;
  hint?: string;
}

export default function ImageUploaderField({
  label,
  value,
  folder,
  mediaItems,
  onChange,
  onMediaUploaded,
  hint,
}: ImageUploaderFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [search, setSearch] = useState("");

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadImageAsset(file, folder, (pct) =>
        setProgress(pct),
      );
      if (onMediaUploaded) {
        await onMediaUploaded(result);
      }
      onChange(result.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const filteredMedia = mediaItems.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.filename.toLowerCase().includes(q) ||
      item.folder.toLowerCase().includes(q) ||
      item.alt_text.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </label>

      <div className="border border-slate-200 bg-slate-50 p-3 space-y-3">
        {value ? (
          <div className="relative w-full h-40 bg-slate-200 overflow-hidden border border-slate-200">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-28 bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
            <ImageIcon className="w-6 h-6 mb-1" />
            No image selected
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0d1b2b] hover:bg-[#172c44] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {uploading ? `Uploading ${progress}%` : "Upload New Image"}
          </button>

          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Choose from Library
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {uploading && (
          <div className="w-full bg-slate-200 h-1.5 overflow-hidden">
            <div
              className="bg-[#d9272e] h-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5">
            {error}
          </p>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL / path (e.g. /facilities.jpg)"
          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-[#0d1b2b]"
        />
        {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      </div>

      {libraryOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setLibraryOpen(false)}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Select Image from Media Library
              </h3>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search uploaded images by name or folder..."
                className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-[#0d1b2b]"
              />
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredMedia.length === 0 ? (
                <p className="col-span-full text-center text-sm text-slate-500 py-8">
                  No uploaded images found. Upload a new image directly or via
                  the Media Library.
                </p>
              ) : (
                filteredMedia.map((item) => {
                  const selected = item.secure_url === value;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange(item.secure_url);
                        setLibraryOpen(false);
                      }}
                      className={`group relative border text-left overflow-hidden cursor-pointer ${
                        selected
                          ? "border-[#d9272e] ring-2 ring-[#d9272e]/30"
                          : "border-slate-200 hover:border-[#0d1b2b]"
                      }`}
                    >
                      <div className="h-28 bg-slate-100">
                        <img
                          src={item.secure_url}
                          alt={item.alt_text || item.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-[11px] font-semibold text-slate-800 truncate">
                          {item.filename}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase">
                          {item.folder}
                        </p>
                      </div>
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 bg-[#d9272e] text-white p-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
