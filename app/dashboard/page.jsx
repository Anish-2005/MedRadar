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
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow">Loading command center...</div>
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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:from-cyan-700 hover:to-sky-700"
        >
          Open Resource Desk
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      {error ? (
        <section className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      {alerts.length ? (
        <section className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-[var(--font-display)] text-lg font-bold">Active Alerts</h2>
          </div>
          <ul className="mt-2 space-y-2 text-sm text-rose-700">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded-lg border border-rose-200 bg-white px-3 py-2">
                {alert.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-700">
            <Bed className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Bed Occupancy</p>
          <p className="text-3xl font-black text-slate-900">{metrics.bedOccupancyPercent}%</p>
          <p className="text-xs text-slate-500">
            {metrics.occupiedBeds} / {metrics.totalBeds} beds occupied
          </p>
        </article>

        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-700">
            <Droplets className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Oxygen Reserve</p>
          <p className="text-3xl font-black text-slate-900">{metrics.oxygenReservePercent}%</p>
          <p className="text-xs text-slate-500">Approx. {metrics.estimatedOxygenHours} hours at current flow</p>
        </article>

        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-700">
            <Package2 className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Medicine Stock Units</p>
          <p className="text-3xl font-black text-slate-900">{metrics.medicineStock}</p>
          <p className="text-xs text-slate-500">Low-threshold medicines: {metrics.lowMedicineCount}</p>
        </article>

        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Forecasted Bed Need</p>
          <p className="text-3xl font-black text-slate-900">
            {Math.max(...DEFAULT_FORECAST.bedDemand.map((point) => point.required))}
          </p>
          <p className="text-xs text-slate-500">Peak day in next 7 days</p>
        </article>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">7-Day Bed Demand Forecast</h2>
          <p className="mt-1 text-xs text-slate-500">Use this trend to plan staffing and discharge velocity.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEFAULT_FORECAST.bedDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="required" stroke="#0284c7" fill="#bae6fd" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">Oxygen Usage by Shift Window</h2>
          <p className="mt-1 text-xs text-slate-500">Cross-check refill schedule against peak hourly usage windows.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEFAULT_FORECAST.oxygenUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="liters" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-cyan-700" />
            <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">Shift Action Checklist</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {operationalChecklist.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span
                  className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.level === "critical"
                      ? "bg-rose-100 text-rose-700"
                      : item.level === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.level}
                </span>
                <span className="text-slate-700">{item.text}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-cyan-700" />
            <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">Data Quality Monitor</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {dataQuality.map((check) => (
              <li key={check.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-slate-700">{check.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
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
        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">Ward Snapshot</h2>
            <Link href="/resources" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
              Manage wards
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
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
                    <tr key={ward.id} className="border-b border-slate-100 text-slate-700">
                      <td className="px-2 py-2 font-semibold text-slate-900">{ward.ward}</td>
                      <td className="px-2 py-2">{ward.total}</td>
                      <td className="px-2 py-2">{ward.occupied}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            utilization >= settings.bedOccupancyAlertPercent
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {utilization}%
                        </span>
                      </td>
                      <td className="px-2 py-2 text-slate-500">{ward.lastUpdated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">Recent Activity</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {audit.slice(0, 6).map((entry) => (
              <li key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-900">{entry.action}</p>
                <p className="text-xs text-slate-500">
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
