"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { ApiError, getSession, signup } from "@/lib/client/api";
import { ROLE_OPTIONS } from "@/lib/shared/roles";
import { MedRadarMark } from "@/components/medradar-logo";

const EMPTY_FORM = {
  name: "",
  hospitalName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "operations",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        await getSession();
        router.replace("/dashboard");
      } catch {
        // stay on signup
      }
    };

    checkExistingSession();
  }, [router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
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

    try {
      await signup({
        name: form.name,
        hospitalName: form.hospitalName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      router.push("/dashboard");
    } catch (nextError) {
      if (nextError instanceof ApiError) {
        setError(nextError.message);
      } else {
        setError("Could not create account right now.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="frost-shell flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="frost-layer frost-glass w-full max-w-2xl rounded-3xl p-6 sm:p-8">
        <div className="mb-6 text-center">
          <MedRadarMark className="mx-auto h-14 w-14" />
          <h1 className="frost-title mt-4 font-[var(--font-display)] text-3xl font-black">Hospital Onboarding</h1>
          <p className="frost-subtitle mt-1 text-sm">Create a secure operations workspace for your facility.</p>
        </div>

        {error ? (
          <div className="frost-alert-danger mb-4">
            {error}
          </div>
        ) : null}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block">
            <span className="frost-title text-sm font-semibold">Full Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="frost-input mt-1"
            />
          </label>

          <label className="block">
            <span className="frost-title text-sm font-semibold">Hospital Name</span>
            <input
              name="hospitalName"
              value={form.hospitalName}
              onChange={handleChange}
              required
              className="frost-input mt-1"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="frost-title text-sm font-semibold">Work Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="frost-input mt-1"
            />
          </label>

          <label className="block">
            <span className="frost-title text-sm font-semibold">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="frost-input mt-1"
            />
          </label>

          <label className="block">
            <span className="frost-title text-sm font-semibold">Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="frost-input mt-1"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="frost-title text-sm font-semibold">Primary Role</span>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="frost-select mt-1"
            >
              {ROLE_OPTIONS.filter((role) => role.id !== "admin").map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="frost-btn-primary sm:col-span-2 w-full py-2.5"
          >
            <UserPlus className="h-4 w-4" />
            {isLoading ? "Creating workspace..." : "Create workspace"}
          </button>
        </form>

        <p className="frost-subtitle mt-5 text-center text-sm">
          Already onboarded?{" "}
          <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
