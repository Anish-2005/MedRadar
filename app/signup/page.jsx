"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hospital, UserPlus } from "lucide-react";
import {
  getSession,
  loginUser,
  registerUser,
  seedMedRadarStore,
} from "@/lib/medradarStore";

const EMPTY_FORM = {
  name: "",
  hospitalName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "Hospital Operations Manager",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    seedMedRadarStore();
    const existing = getSession();
    if (existing) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const created = registerUser(form);
    if (!created.ok) {
      setError(created.message);
      setIsLoading(false);
      return;
    }

    const loginResult = loginUser(form.email, form.password);

    if (!loginResult.ok) {
      setError("Account was created but login failed. Please sign in manually.");
      setIsLoading(false);
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-3xl border border-cyan-100 bg-white p-6 shadow-xl shadow-cyan-100/60 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-200">
            <Hospital className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl font-black text-slate-900">Hospital Onboarding</h1>
          <p className="mt-1 text-sm text-slate-500">Create a secure operations workspace for your facility.</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Full Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Hospital Name</span>
            <input
              name="hospitalName"
              value={form.hospitalName}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Work Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Primary Role</span>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            >
              <option>Hospital Operations Manager</option>
              <option>Medical Superintendent</option>
              <option>Pharmacy Lead</option>
              <option>Emergency Response Coordinator</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="sm:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:from-cyan-700 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <UserPlus className="h-4 w-4" />
            {isLoading ? "Creating workspace..." : "Create workspace"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already onboarded?{" "}
          <Link href="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
