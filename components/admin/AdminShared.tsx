"use client";

import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "website-settings"
  | "hero-slider"
  | "about"
  | "achievements"
  | "milestones"
  | "services"
  | "why-peb"
  | "facilities"
  | "quality"
  | "projects"
  | "offices"
  | "contact-info"
  | "enquiries"
  | "footer"
  | "media"
  | "seo"
  | "admin-settings"
  | "activity-logs";

export interface ToastState {
  id: number;
  type: "success" | "error";
  message: string;
}

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}

export function ToastBanner({
  toast,
  onDismiss,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
}) {
  if (!toast) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 p-4 shadow-xl border flex items-start gap-3 ${
        toast.type === "success"
          ? "bg-[#0d1b2b] border-emerald-500 text-white"
          : "bg-red-950 border-red-400 text-white"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      )}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-300 hover:text-white cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ConfirmDialog({
  confirm,
  busy,
  onCancel,
  onConfirm,
}: {
  confirm: ConfirmState | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirm) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 text-[#d9272e]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {confirm.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{confirm.message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="px-4 py-2 bg-[#d9272e] hover:bg-[#b81f25] disabled:opacity-60 text-white text-sm font-bold cursor-pointer"
          >
            {busy ? "Processing..." : confirm.confirmLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
        published
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
