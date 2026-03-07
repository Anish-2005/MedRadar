"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import PortalFrame from "@/components/portal-frame";
import {
  ApiError,
  resetDemoData,
  updateSettings,
} from "@/lib/client/api";
import { useRequireSession } from "@/lib/useRequireSession";
import { useMedRadarLiveData } from "@/lib/useMedRadarLiveData";

export default function AdminPage() {
  const { session, ready } = useRequireSession({ allowedRoles: ["admin"] });
  const { resources, settings, audit, loaded, refresh, error } = useMedRadarLiveData({ includeAudit: true });
  const [draftSettings, setDraftSettings] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const activeSettings = draftSettings ?? settings;
  const hasChanges =
    settings && activeSettings
      ? JSON.stringify(activeSettings) !== JSON.stringify(settings)
      : false;
  const hasInvalidSettings =
    activeSettings &&
    (activeSettings.bedOccupancyAlertPercent < 50 ||
      activeSettings.bedOccupancyAlertPercent > 100 ||
      activeSettings.oxygenReserveAlertPercent < 5 ||
      activeSettings.oxygenReserveAlertPercent > 80 ||
      activeSettings.medicineLowDays < 1 ||
      activeSettings.medicineLowDays > 30);

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

  const handleSave = async (event) => {
    event.preventDefault();
    if (!hasChanges || hasInvalidSettings) {
      return;
    }
    setActionError("");

    try {
      await updateSettings(draftSettings ?? settings);
      setDraftSettings(null);
      await refresh();
      setSavedMessage("Settings saved.");
      setTimeout(() => setSavedMessage(""), 2000);
    } catch (nextError) {
      if (nextError instanceof ApiError) {
        setActionError(nextError.message);
      } else {
        setActionError("Could not save settings.");
      }
    }
  };

  const handleReset = async () => {
    setActionError("");
    try {
      await resetDemoData();
      setDraftSettings(null);
      await refresh();
      setSavedMessage("Demo data reset complete.");
      setTimeout(() => setSavedMessage(""), 2500);
    } catch (nextError) {
      if (nextError instanceof ApiError) {
        setActionError(nextError.message);
      } else {
        setActionError("Could not reset demo data.");
      }
    }
  };

  if (!ready || !session || !loaded || !settings || !resources) {
    return (
      <div className="frost-shell flex min-h-screen items-center justify-center">
        <div className="frost-layer frost-glass rounded-xl px-4 py-3 text-sm font-semibold frost-subtitle">Loading admin panel...</div>
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
          className="frost-btn-danger"
        >
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </button>
      }
    >
      {error || actionError ? (
        <section className="frost-alert-danger mb-4">
          {error || actionError}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((card) => (
          <article key={card.label} className="frost-card rounded-2xl p-4">
            <p className="frost-subtitle text-xs uppercase tracking-wide">{card.label}</p>
            <p className="frost-title mt-2 text-2xl font-black">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <article className="frost-glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">Threshold Configuration</h2>
            {savedMessage ? (
              <span className="frost-status-success inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {savedMessage}
              </span>
            ) : null}
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-3">
            {hasChanges ? (
              <p className="frost-alert-warning text-xs">You have unsaved changes.</p>
            ) : (
              <p className="frost-alert-success text-xs">All settings are synced.</p>
            )}

            {hasInvalidSettings ? (
              <p className="frost-alert-danger text-xs">Threshold values are out of allowed range.</p>
            ) : null}

            <label className="block">
              <span className="frost-title text-sm font-semibold">Bed occupancy alert (%)</span>
              <input
                type="number"
                min="1"
                max="100"
                value={activeSettings.bedOccupancyAlertPercent}
                onChange={(event) =>
                  setDraftSettings((prev) => ({
                    ...(prev ?? settings),
                    bedOccupancyAlertPercent: Number(event.target.value),
                  }))
                }
                className="frost-input mt-1"
              />
            </label>

            <label className="block">
              <span className="frost-title text-sm font-semibold">Oxygen reserve alert (%)</span>
              <input
                type="number"
                min="1"
                max="100"
                value={activeSettings.oxygenReserveAlertPercent}
                onChange={(event) =>
                  setDraftSettings((prev) => ({
                    ...(prev ?? settings),
                    oxygenReserveAlertPercent: Number(event.target.value),
                  }))
                }
                className="frost-input mt-1"
              />
            </label>

            <label className="block">
              <span className="frost-title text-sm font-semibold">Medicine low-stock horizon (days)</span>
              <input
                type="number"
                min="1"
                max="30"
                value={activeSettings.medicineLowDays}
                onChange={(event) =>
                  setDraftSettings((prev) => ({
                    ...(prev ?? settings),
                    medicineLowDays: Number(event.target.value),
                  }))
                }
                className="frost-input mt-1"
              />
            </label>

            <label className="block">
              <span className="frost-title text-sm font-semibold">Shift lead</span>
              <input
                value={activeSettings.shiftLead}
                onChange={(event) =>
                  setDraftSettings((prev) => ({
                    ...(prev ?? settings),
                    shiftLead: event.target.value,
                  }))
                }
                className="frost-input mt-1"
              />
            </label>

            <label className="block">
              <span className="frost-title text-sm font-semibold">Escalation contact</span>
              <input
                value={activeSettings.escalationContact}
                onChange={(event) =>
                  setDraftSettings((prev) => ({
                    ...(prev ?? settings),
                    escalationContact: event.target.value,
                  }))
                }
                className="frost-input mt-1"
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={!hasChanges || hasInvalidSettings}
                className="frost-btn-primary"
              >
                <Save className="h-4 w-4" />
                Save settings
              </button>

              <button
                type="button"
                onClick={() => setDraftSettings(null)}
                disabled={!hasChanges}
                className="frost-btn-secondary"
              >
                Revert changes
              </button>
            </div>
          </form>
        </article>

        <article className="frost-card rounded-2xl p-4">
          <h2 className="frost-title font-[var(--font-display)] text-lg font-bold">Audit Trail</h2>
          <p className="frost-subtitle mt-1 text-xs">Recent actions across login, inventory changes, and admin updates.</p>

          <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
            {audit.slice(0, 12).map((entry) => (
              <div key={entry.id} className="frost-card-soft rounded-xl px-3 py-2 text-sm">
                <p className="frost-title font-semibold">{entry.action}</p>
                <p className="frost-subtitle text-xs">
                  {entry.actor} on {entry.target}
                </p>
                <p className="frost-subtitle text-xs opacity-80">{entry.time}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PortalFrame>
  );
}
