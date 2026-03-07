"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import PortalFrame from "@/components/portal-frame";
import {
  getAuditLog,
  getResources,
  getSettings,
  resetDemoData,
  saveSettings,
} from "@/lib/medradarStore";
import { useRequireSession } from "@/lib/useRequireSession";

export default function AdminPage() {
  const { session, ready } = useRequireSession();
  const [settings, setSettings] = useState(null);
  const [audit, setAudit] = useState([]);
  const [resources, setResources] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!ready || !session) {
      return;
    }

    setSettings(getSettings());
    setAudit(getAuditLog().slice(0, 12));
    setResources(getResources());
  }, [ready, session]);

  const quickStats = useMemo(() => {
    if (!resources) {
      return [];
    }

    const beds = resources.beds.reduce((sum, row) => sum + row.total, 0);
    const oxygen = resources.oxygen.reduce((sum, row) => sum + row.available, 0);
    const medicines = resources.medicines.length;

    return [
      { label: "Configured wards", value: resources.beds.length },
      { label: "Total beds", value: beds },
      { label: "Available oxygen (L)", value: oxygen },
      { label: "Tracked medicines", value: medicines },
    ];
  }, [resources]);

  const handleSave = (event) => {
    event.preventDefault();
    saveSettings(settings, session.name);
    setAudit(getAuditLog().slice(0, 12));
    setSavedMessage("Settings saved.");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleReset = () => {
    resetDemoData(session.name);
    setResources(getResources());
    setSettings(getSettings());
    setAudit(getAuditLog().slice(0, 12));
    setSavedMessage("Demo data reset complete.");
    setTimeout(() => setSavedMessage(""), 2500);
  };

  if (!ready || !session || !settings || !resources) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <PortalFrame
      title="Admin Controls"
      subtitle="Configure operational thresholds and review system audit events."
      session={session}
      rightSlot={
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
        >
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </button>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((card) => (
          <article key={card.label} className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">Threshold Configuration</h2>
            {savedMessage ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {savedMessage}
              </span>
            ) : null}
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Bed occupancy alert (%)</span>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.bedOccupancyAlertPercent}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, bedOccupancyAlertPercent: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Oxygen reserve alert (%)</span>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.oxygenReserveAlertPercent}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, oxygenReserveAlertPercent: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Medicine low-stock horizon (days)</span>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.medicineLowDays}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, medicineLowDays: Number(event.target.value) }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Shift lead</span>
              <input
                value={settings.shiftLead}
                onChange={(event) => setSettings((prev) => ({ ...prev, shiftLead: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Escalation contact</span>
              <input
                value={settings.escalationContact}
                onChange={(event) => setSettings((prev) => ({ ...prev, escalationContact: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow"
            >
              <Save className="h-4 w-4" />
              Save settings
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <h2 className="font-[var(--font-display)] text-lg font-bold text-slate-900">Audit Trail</h2>
          <p className="mt-1 text-xs text-slate-500">Recent actions across login, inventory changes, and admin updates.</p>

          <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
            {audit.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                <p className="font-semibold text-slate-900">{entry.action}</p>
                <p className="text-xs text-slate-500">
                  {entry.actor} on {entry.target}
                </p>
                <p className="text-xs text-slate-400">{entry.time}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PortalFrame>
  );
}
