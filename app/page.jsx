import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bed,
  Building2,
  HeartPulse,
  ShieldPlus,
  Syringe,
  Waves,
} from "lucide-react";
import { DEFAULT_FORECAST, DEFAULT_RESOURCES } from "@/lib/medradarData";

const featureCards = [
  {
    title: "Bed Command Tracking",
    copy: "Track occupancy across wards and catch saturation risk before triage slows down.",
    icon: Bed,
  },
  {
    title: "Oxygen Continuity",
    copy: "Monitor tank and cylinder reserves with reserve-hour visibility for every shift.",
    icon: Waves,
  },
  {
    title: "Medicine Availability",
    copy: "Know depletion windows for critical drugs and trigger replenishment with confidence.",
    icon: Syringe,
  },
  {
    title: "Escalation Workflows",
    copy: "Automated priority flags help operations teams focus on the highest-risk shortfalls.",
    icon: AlertTriangle,
  },
];

const steps = [
  {
    title: "Create your facility profile",
    text: "Register your hospital and assign operational roles in under two minutes.",
  },
  {
    title: "Update current stock snapshot",
    text: "Load beds, oxygen sources, and medicine counts from the live duty desk.",
  },
  {
    title: "Operate from one command screen",
    text: "Use the dashboard and resource desk to respond to shortages in real time.",
  },
];

const totalBeds = DEFAULT_RESOURCES.beds.reduce((sum, ward) => sum + ward.total, 0);
const occupiedBeds = DEFAULT_RESOURCES.beds.reduce((sum, ward) => sum + ward.occupied, 0);
const oxygenCapacity = DEFAULT_RESOURCES.oxygen.reduce((sum, source) => sum + source.capacity, 0);
const oxygenAvailable = DEFAULT_RESOURCES.oxygen.reduce((sum, source) => sum + source.available, 0);
const avgForecast = Math.round(
  DEFAULT_FORECAST.bedDemand.reduce((sum, point) => sum + point.required, 0) /
    DEFAULT_FORECAST.bedDemand.length
);

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-cyan-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-200">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="font-[var(--font-display)] text-xl font-bold text-slate-900">MedRadar</p>
              <p className="text-xs text-slate-500">Hospital Resource Optimizer</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:from-cyan-700 hover:to-sky-700"
            >
              Request access
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
              <Building2 className="h-4 w-4" /> Tier 2 and Tier 3 Hospital Operations
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              Run your hospital resource command center with speed and clarity.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              MedRadar keeps beds, oxygen, and medicine inventory in one operational view so teams can act early,
              avoid shortages, and improve patient continuity.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:from-cyan-700 hover:to-sky-700"
              >
                Launch Hospital Workspace
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-cyan-200 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                Open Demo Account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-lg bg-white px-3 py-2 shadow-sm">Default demo: `admin@medradar.app`</span>
              <span className="rounded-lg bg-white px-3 py-2 shadow-sm">Password: `admin123`</span>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-xl shadow-cyan-100/60">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">Live Snapshot</h2>
              <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Operational</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Bed Occupancy</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{Math.round((occupiedBeds / totalBeds) * 100)}%</p>
                <p className="text-xs text-slate-500">{occupiedBeds}/{totalBeds} occupied</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Oxygen Reserve</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{Math.round((oxygenAvailable / oxygenCapacity) * 100)}%</p>
                <p className="text-xs text-slate-500">{oxygenAvailable} / {oxygenCapacity} L</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Forecast Avg</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{avgForecast}</p>
                <p className="text-xs text-slate-500">beds/day next week</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Critical Alerts</p>
                <p className="mt-1 text-2xl font-bold text-rose-600">2</p>
                <p className="text-xs text-slate-500">active escalation</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-900">
              <p className="font-semibold">Shift recommendation</p>
              <p className="mt-1 text-cyan-800">Increase ICU discharge planning before 18:00 and refill Bank B oxygen line before night shift.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-[var(--font-display)] text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-md sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-[var(--font-display)] text-2xl font-bold text-slate-900">How hospitals onboard in one shift</h2>
                <p className="mt-1 text-sm text-slate-600">Simple implementation focused on nursing stations, ICU desks, and pharmacy counters.</p>
              </div>
              <Activity className="h-8 w-8 text-cyan-700" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-cyan-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Step {index + 1}</p>
                  <h3 className="mt-2 font-[var(--font-display)] text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:from-cyan-700 hover:to-sky-700"
              >
                Start now
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-cyan-200 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                View dashboard demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-cyan-100 bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>MedRadar for hospitals. Built for capacity planning and patient safety.</p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            <ShieldPlus className="h-4 w-4" /> Operational Demo Environment
          </div>
        </div>
      </footer>
    </div>
  );
}
