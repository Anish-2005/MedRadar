"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, LogIn } from "lucide-react";
import { ApiError, getSession, login } from "@/lib/client/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@medradar.app");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        await getSession();
        router.replace("/dashboard");
      } catch {
        // keep user on login
      }
    };

    checkExistingSession();
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (nextError) {
      if (nextError instanceof ApiError) {
        setError(nextError.message);
      } else {
        setError("Unable to sign in right now.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-cyan-100 bg-white p-6 shadow-xl shadow-cyan-100/60 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-200">
            <HeartPulse className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl font-black text-slate-900">Hospital Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to the MedRadar operations portal.</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Work Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              placeholder="you@hospital.org"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              placeholder="Enter your password"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:from-cyan-700 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn className="h-4 w-4" />
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-xs text-cyan-900">
          <p className="font-semibold">Demo credentials</p>
          <p className="mt-1">Email: admin@medradar.app</p>
          <p>Password: admin123</p>
        </div>

        <p className="mt-5 text-center text-sm text-slate-600">
          Need access for your hospital?{" "}
          <Link href="/signup" className="font-semibold text-cyan-700 hover:text-cyan-800">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
