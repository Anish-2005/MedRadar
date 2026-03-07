import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bed,
  Building2,
  ShieldPlus,
  Syringe,
  Waves,
} from "lucide-react";
import { DEFAULT_FORECAST, DEFAULT_RESOURCES } from "@/lib/medradarData";
import MedRadarLogo from "@/components/medradar-logo";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://medradar.app").replace(/\/$/, "");

export const metadata = {
  title: "Hospital Resource Command Center",
  description:
    "MedRadar helps hospitals track beds, oxygen, and medicine inventory with actionable operational insights.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MedRadar | Hospital Resource Command Center",
    description:
      "A hospital-first command center for bed occupancy, oxygen reserve, and medicine continuity.",
    url: siteUrl,
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedRadar | Hospital Resource Command Center",
    description:
      "Track hospital resources in real time and respond faster to shortages.",
    images: ["/og-image.svg"],
  },
};

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
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MedRadar",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Hospital resource optimizer for bed occupancy, oxygen reserve, and medicine inventory continuity.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Bed occupancy monitoring",
      "Oxygen reserve tracking",
      "Medicine threshold alerts",
      "Operational command dashboard",
    ],
    publisher: {
      "@type": "Organization",
      name: "MedRadar",
      url: siteUrl,
    },
  };

  return (
    <div className="frost-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <header className="frost-layer border-b frost-divider bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <MedRadarLogo />

          <nav className="flex items-center gap-2">
            <Link href="/login" className="frost-btn-secondary">
              Sign in
            </Link>
            <Link href="/signup" className="frost-btn-primary">
              Request access
            </Link>
          </nav>
        </div>
      </header>

      <main className="frost-layer">
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-16">
          <div>
            <span className="frost-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Building2 className="h-4 w-4" /> Tier 2 and Tier 3 Hospital Operations
            </span>
            <h1 className="frost-title mt-5 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
              Run your hospital resource command center with speed and clarity.
            </h1>
            <p className="frost-subtitle mt-4 max-w-xl text-base sm:text-lg">
              MedRadar keeps beds, oxygen, and medicine inventory in one operational view so teams can act early,
              avoid shortages, and improve patient continuity.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="frost-btn-primary">
                Launch Hospital Workspace
              </Link>
              <Link href="/login" className="frost-btn-secondary">
                Open Demo Account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs">
              <span className="frost-card-soft rounded-lg px-3 py-2">Default demo: `admin@medradar.app`</span>
              <span className="frost-card-soft rounded-lg px-3 py-2">Password: `admin123`</span>
            </div>
          </div>

          <div className="frost-glass frost-reveal rounded-2xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">Live Snapshot</h2>
              <span className="frost-status-success">Operational</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="frost-card-soft rounded-xl p-3">
                <p className="frost-subtitle text-xs">Bed Occupancy</p>
                <p className="frost-title mt-1 text-2xl font-bold">{Math.round((occupiedBeds / totalBeds) * 100)}%</p>
                <p className="frost-subtitle text-xs">{occupiedBeds}/{totalBeds} occupied</p>
              </div>
              <div className="frost-card-soft rounded-xl p-3">
                <p className="frost-subtitle text-xs">Oxygen Reserve</p>
                <p className="frost-title mt-1 text-2xl font-bold">{Math.round((oxygenAvailable / oxygenCapacity) * 100)}%</p>
                <p className="frost-subtitle text-xs">{oxygenAvailable} / {oxygenCapacity} L</p>
              </div>
              <div className="frost-card-soft rounded-xl p-3">
                <p className="frost-subtitle text-xs">Forecast Avg</p>
                <p className="frost-title mt-1 text-2xl font-bold">{avgForecast}</p>
                <p className="frost-subtitle text-xs">beds/day next week</p>
              </div>
              <div className="frost-card-soft rounded-xl p-3">
                <p className="frost-subtitle text-xs">Critical Alerts</p>
                <p className="mt-1 text-2xl font-bold text-rose-600">2</p>
                <p className="frost-subtitle text-xs">active escalation</p>
              </div>
            </div>

            <div className="frost-alert mt-5 text-sm">
              <p className="font-semibold">Shift recommendation</p>
              <p className="mt-1">Increase ICU discharge planning before 18:00 and refill Bank B oxygen line before night shift.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="frost-card frost-reveal rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="frost-chip inline-flex rounded-xl p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="frost-title mt-3 font-[var(--font-display)] text-lg font-bold">{feature.title}</h3>
                  <p className="frost-subtitle mt-2 text-sm">{feature.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="frost-glass rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="frost-title font-[var(--font-display)] text-2xl font-bold">How hospitals onboard in one shift</h2>
                <p className="frost-subtitle mt-1 text-sm">Simple implementation focused on nursing stations, ICU desks, and pharmacy counters.</p>
              </div>
              <Activity className="h-8 w-8 text-sky-700" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="frost-card rounded-2xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Step {index + 1}</p>
                  <h3 className="frost-title mt-2 font-[var(--font-display)] text-lg font-bold">{step.title}</h3>
                  <p className="frost-subtitle mt-2 text-sm">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup" className="frost-btn-primary">
                Start now
              </Link>
              <Link href="/login" className="frost-btn-secondary">
                View dashboard demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="frost-layer border-t frost-divider bg-white/70">
        <div className="frost-subtitle mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm sm:px-6 lg:px-8">
          <p>MedRadar for hospitals. Built for capacity planning and patient safety.</p>
          <div className="frost-chip inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold">
            <ShieldPlus className="h-4 w-4" /> Operational Demo Environment
          </div>
        </div>
      </footer>
    </div>
  );
}
