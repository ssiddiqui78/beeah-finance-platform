import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export default async function LoginPage() {
  // Read current authentication session parameters from the server layer
  const access = await getCurrentUserAccess();

  // If the user already possesses an active session, fast-track them to the overview charts
  if (access.user) {
    redirect("/executive-summary");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <LoginForm />
    </main>
  );
}
