import React from "react";

export function LogoutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 w-full justify-center"
      >
        Sign out
      </button>
    </form>
  );
}
