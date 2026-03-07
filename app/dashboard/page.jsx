"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bed,
  ClipboardList,
  Droplets,
  Package2,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PortalFrame from "@/components/portal-frame";
import { DEFAULT_FORECAST } from "@/lib/medradarData";
import {
  buildDataQuality,
  buildOperationalChecklist,
  calculateAlerts,
  calculateDashboardMetrics,
  percent,
} from "@/lib/domain/operations";
import { useRequireSession } from "@/lib/useRequireSession";
import { useMedRadarLiveData } from "@/lib/useMedRadarLiveData";

export default function DashboardPage() {
  const { session, ready } = useRequireSession();
  const { resources, settings, audit, loaded, error } = useMedRadarLiveData({ includeAudit: true });

  const metrics = useMemo(() => calculateDashboardMetrics(resources), [resources]);
  const alerts = useMemo(() => calculateAlerts(resources, settings, metrics), [metrics, resources, settings]);
  const operationalChecklist = useMemo(
    () => buildOperationalChecklist(resources, settings, metrics),
    [metrics, resources, settings]
  );
  const dataQuality = useMemo(() => buildDataQuality(resources), [resources]);

  if (!ready || !session || !loaded || !resources || !settings || !metrics) {
    return (
      <div className="frost-shell flex min-h-screen items-center justify-center">
        <div className="frost-layer frost-glass rounded-xl px-4 py-3 text-sm font-semibold frost-subtitle">Loading command center...</div>
      </div>
    );
  }

  return (
    <PortalFrame
      title="Hospital Command Center"
      subtitle="Operational snapshot for beds, oxygen, and critical medicine continuity."
      session={session}
      rightSlot={
        <Link
          href="/resources"
          className="frost-btn-primary"
        >
          Open Resource Desk
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      {error ? (
        <section className="frost-alert-danger mb-4">
          {error}
        </section>
      ) : null}

      {alerts.length ? (
        <section className="frost-alert-danger mb-6 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-[var(--font-display)] text-lg font-bold">Active Alerts</h2>
          </div>
          <ul className="mt-2 space-y-2 text-sm">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded-lg border border-rose-200/60 bg-white/85 px-3 py-2">
                {alert.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="frost-card frost-reveal rounded-2xl p-4">
          <div className="frost-chip inline-flex rounded-xl p-2">
            <Bed className="h-5 w-5" />
          </div>
          <p className="frost-subtitle mt-3 text-sm">Bed Occupancy</p>
          <p className="frost-title text-3xl font-black">{metrics.bedOccupancyPercent}%</p>
          <p className="frost-subtitle text-xs">
            {metrics.occupiedBeds} / {metrics.totalBeds} beds occupied
          </p>
        </article>

        <article className="frost-card frost-reveal rounded-2xl p-4">
          <div className="frost-chip inline-flex rounded-xl p-2">
            <Droplets className="h-5 w-5" />
          </div>
          <p className="frost-subtitle mt-3 text-sm">Oxygen Reserve</p>
          <p className="frost-title text-3xl font-black">{metrics.oxygenReservePercent}%</p>
          <p className="frost-subtitle text-xs">Approx. {metrics.estimatedOxygenHours} hours at current flow</p>
        </article>

        <article className="frost-card frost-reveal rounded-2xl p-4">
          <div className="frost-chip inline-flex rounded-xl p-2">
            <Package2 className="h-5 w-5" />
          </div>
          <p className="frost-subtitle mt-3 text-sm">Medicine Stock Units</p>
          <p className="frost-title text-3xl font-black">{metrics.medicineStock}</p>
          <p className="frost-subtitle text-xs">Low-threshold medicines: {metrics.lowMedicineCount}</p>
        </article>

        <article className="frost-card frost-reveal rounded-2xl p-4">
          <div className="frost-chip inline-flex rounded-xl p-2">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="frost-subtitle mt-3 text-sm">Forecasted Bed Need</p>
          <p className="frost-title text-3xl font-black">
            {Math.max(...DEFAULT_FORECAST.bedDemand.map((point) => point.required))}
          </p>
          <p className="frost-subtitle text-xs">Peak day in next 7 days</p>
        </article>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <article className="frost-glass rounded-2xl p-4">
          <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">7-Day Bed Demand Forecast</h2>
          <p className="frost-subtitle mt-1 text-xs">Use this trend to plan staffing and discharge velocity.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEFAULT_FORECAST.bedDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4e6f8" />
                <XAxis dataKey="day" stroke="#6b88a8" />
                <YAxis stroke="#6b88a8" />
                <Tooltip />
                <Area type="monotone" dataKey="required" stroke="#2a6dba" fill="#d7ebff" strokeWidth={2.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="frost-glass rounded-2xl p-4">
          <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">Oxygen Usage by Shift Window</h2>
          <p className="frost-subtitle mt-1 text-xs">Cross-check refill schedule against peak hourly usage windows.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEFAULT_FORECAST.oxygenUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4e6f8" />
                <XAxis dataKey="time" stroke="#6b88a8" />
                <YAxis stroke="#6b88a8" />
                <Tooltip />
                <Bar dataKey="liters" fill="#67b0eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <article className="frost-card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-sky-700" />
            <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">Shift Action Checklist</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {operationalChecklist.map((item) => (
              <li key={item.id} className="frost-card-soft rounded-xl px-3 py-2">
                <span
                  className={`mr-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                    item.level === "critical"
                      ? "bg-rose-100 text-rose-700"
                      : item.level === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.level}
                </span>
                <span className="frost-title">{item.text}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="frost-card rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-sky-700" />
            <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">Data Quality Monitor</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {dataQuality.map((check) => (
              <li key={check.id} className="frost-card-soft flex items-center justify-between rounded-xl px-3 py-2">
                <span className="frost-title">{check.label}</span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                    check.healthy ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {check.value}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="frost-glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">Ward Snapshot</h2>
            <Link href="/resources" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
              Manage wards
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="frost-table min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-2">Ward</th>
                  <th className="px-2 py-2">Total</th>
                  <th className="px-2 py-2">Occupied</th>
                  <th className="px-2 py-2">Utilization</th>
                  <th className="px-2 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {resources.beds.map((ward) => {
                  const utilization = percent(ward.occupied, ward.total);
                  return (
                    <tr key={ward.id}>
                      <td className="px-2 py-2 font-semibold">{ward.ward}</td>
                      <td className="px-2 py-2">{ward.total}</td>
                      <td className="px-2 py-2">{ward.occupied}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                            utilization >= settings.bedOccupancyAlertPercent
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {utilization}%
                        </span>
                      </td>
                      <td className="frost-subtitle px-2 py-2">{ward.lastUpdated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="frost-card rounded-2xl p-4">
          <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">Recent Activity</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {audit.slice(0, 6).map((entry) => (
              <li key={entry.id} className="frost-card-soft rounded-xl px-3 py-2">
                <p className="frost-title font-semibold">{entry.action}</p>
                <p className="frost-subtitle text-xs">
                  {entry.actor} on {entry.target} at {entry.time}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </PortalFrame>
  );
}
