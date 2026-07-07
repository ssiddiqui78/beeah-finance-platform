import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Access restricted</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your account is signed in, but you do not currently have permission to access this area.
        </p>
        <Link
          href="/executive-summary"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
