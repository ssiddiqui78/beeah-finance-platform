import React from "react";
import type { AppRole } from "../../lib/auth/roles";

type CurrentUserPanelProps = {
  email: string;
  fullName?: string | null;
  highestRole: AppRole | null;
};

function roleTone(role: AppRole | null) {
  switch (role) {
    case "owner":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "admin":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "approver":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "preparer":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "viewer":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function roleLabel(role: AppRole | null) {
  if (!role) return "No role";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function CurrentUserPanel({
  email,
  fullName,
  highestRole,
}: CurrentUserPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Signed in
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-800" title={fullName || email}>
            {fullName || email}
          </p>
          <p className="truncate text-[11px] text-slate-400" title={email}>{email}</p>
        </div>

        <span
          className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${roleTone(
            highestRole,
          )}`}
        >
          {roleLabel(highestRole)}
        </span>
      </div>

      {/* Render the logout form directly to avoid import/export module resolution issues */}
      <div className="mt-4">
        <form action="/auth/signout" method="post" className="w-full">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-xs"
          >
            Sign out of workspace
          </button>
        </form>
      </div>
    </div>
  );
}
