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
    <div className="frost-shell">
      <header className="frost-layer border-b frost-divider bg-white/65 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="frost-brand h-11 w-11">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="frost-title font-[var(--font-display)] text-lg font-semibold">MedRadar</p>
                <p className="frost-subtitle text-xs">Hospital Resource Optimizer</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="frost-card-soft hidden rounded-xl px-3 py-2 text-right sm:block">
                <p className="frost-title text-sm font-semibold">{session?.name}</p>
                <p className="frost-subtitle text-xs">{session?.roleLabel || session?.role}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="frost-btn-secondary"
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
                      "frost-nav-link inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      active && "is-active"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 text-xs">
              <span className="frost-chip-soft rounded-lg px-2 py-1">{session?.hospitalName}</span>
              <span className="frost-chip rounded-lg px-2 py-1">Live Demo</span>
            </div>
          </div>
        </div>
      </header>

      <main className="frost-layer mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="frost-title font-[var(--font-display)] text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle ? <p className="frost-subtitle mt-1 text-sm">{subtitle}</p> : null}
          </div>
          {rightSlot ? <div>{rightSlot}</div> : null}
        </section>

        {children}
      </main>
    </div>
  );
}
