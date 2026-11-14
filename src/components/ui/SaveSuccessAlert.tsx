"use client";

import { CheckCircle, X } from "lucide-react";
import Link from "next/link";

export function SaveSuccessAlert({
  title,
  description,
  onDismiss,
  backHref,
  backLabel = "Back to plans",
}: {
  title: string;
  description?: string;
  onDismiss?: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div
      role="status"
      className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm"
    >
      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-emerald-900">{title}</p>
        {description && <p className="text-xs text-emerald-800/90 mt-1">{description}</p>}
        {backHref && (
          <Link href={backHref} className="inline-block mt-2 text-xs font-medium text-emerald-700 underline underline-offset-2">
            {backLabel}
          </Link>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}