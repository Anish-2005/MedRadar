"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { ApiError, getSession, login } from "@/lib/client/api";
import { MedRadarMark } from "@/components/medradar-logo";

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
    <div className="frost-shell flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="frost-layer frost-glass w-full max-w-md rounded-3xl p-6 sm:p-8">
        <div className="mb-6 text-center">
          <MedRadarMark className="mx-auto h-14 w-14" />
          <h1 className="frost-title mt-4 font-[var(--font-display)] text-3xl font-black">Hospital Login</h1>
          <p className="frost-subtitle mt-1 text-sm">Sign in to the MedRadar operations portal.</p>
        </div>

        {error ? (
          <div className="frost-alert-danger mb-4">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="frost-title text-sm font-semibold">Work Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="frost-input mt-1"
              placeholder="you@hospital.org"
            />
          </label>

          <label className="block">
            <span className="frost-title text-sm font-semibold">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="frost-input mt-1"
              placeholder="Enter your password"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="frost-btn-primary w-full py-2.5"
          >
            <LogIn className="h-4 w-4" />
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="frost-alert mt-5 text-xs">
          <p className="font-semibold">Demo credentials</p>
          <p className="mt-1">Email: admin@medradar.app</p>
          <p>Password: admin123</p>
        </div>

        <p className="frost-subtitle mt-5 text-center text-sm">
          Need access for your hospital?{" "}
          <Link href="/signup" className="font-semibold text-sky-700 hover:text-sky-800">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
