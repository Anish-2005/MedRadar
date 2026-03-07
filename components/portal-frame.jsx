"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Boxes,
  LogOut,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/client/api";

const BASE_NAV_ITEMS = [
  { href: "/dashboard", label: "Command Center", icon: Activity },
  { href: "/resources", label: "Resource Desk", icon: Boxes },
];

export default function PortalFrame({ title, subtitle, session, children, rightSlot }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = [
    ...BASE_NAV_ITEMS,
    ...(session?.permissions?.canAccessAdmin
      ? [{ href: "/dashboard/admin", label: "Admin", icon: ShieldCheck }]
      : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // redirect regardless
    }
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900">
      <header className="border-b border-cyan-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-200">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-lg font-semibold text-slate-900">MedRadar</p>
                <p className="text-xs text-slate-500">Hospital Resource Optimizer</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">{session?.name}</p>
                <p className="text-xs text-slate-500">{session?.roleLabel || session?.role}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "border-cyan-500 bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow"
                        : "border-cyan-100 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-lg bg-slate-100 px-2 py-1">{session?.hospitalName}</span>
              <span className="rounded-lg bg-cyan-50 px-2 py-1 text-cyan-700">Live Demo</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-[var(--font-display)] text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {rightSlot ? <div>{rightSlot}</div> : null}
        </section>

        {children}
      </main>
    </div>
  );
}
