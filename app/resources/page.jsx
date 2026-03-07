"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import PortalFrame from "@/components/portal-frame";
import {
  ApiError,
  importResources as importResourceSnapshot,
  updateResourceType,
} from "@/lib/client/api";
import { useMedRadarLiveData } from "@/lib/useMedRadarLiveData";
import { useRequireSession } from "@/lib/useRequireSession";

const TABS = [
  { id: "beds", label: "Beds" },
  { id: "oxygen", label: "Oxygen" },
  { id: "medicines", label: "Medicines" },
];

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function buildEmptyForm(tab) {
  if (tab === "beds") {
    return { ward: "", total: "", occupied: "", lastUpdated: nowTime() };
  }

  if (tab === "oxygen") {
    return { source: "", capacity: "", available: "", flowRateLph: "", status: "normal" };
  }

  return { name: "", stock: "", threshold: "", dailyUse: "", unit: "vials" };
}

function buildItemFromForm(tab, form, existingId) {
  if (tab === "beds") {
    return {
      id: existingId ?? `bed-${Date.now()}`,
      ward: form.ward.trim(),
      total: Number(form.total),
      occupied: Number(form.occupied),
      lastUpdated: form.lastUpdated || nowTime(),
    };
  }

  if (tab === "oxygen") {
    return {
      id: existingId ?? `oxy-${Date.now()}`,
      source: form.source.trim(),
      capacity: Number(form.capacity),
      available: Number(form.available),
      flowRateLph: Number(form.flowRateLph),
      status: form.status,
    };
  }

  return {
    id: existingId ?? `med-${Date.now()}`,
    name: form.name.trim(),
    stock: Number(form.stock),
    threshold: Number(form.threshold),
    dailyUse: Number(form.dailyUse),
    unit: form.unit.trim() || "units",
  };
}

function validateForm(tab, form) {
  if (tab === "beds") {
    if (!form.ward.trim()) {
      return "Ward name is required.";
    }
    if (Number(form.total) <= 0) {
      return "Total beds must be greater than 0.";
    }
    if (Number(form.occupied) < 0 || Number(form.occupied) > Number(form.total)) {
      return "Occupied beds must be between 0 and total beds.";
    }
    return "";
  }

  if (tab === "oxygen") {
    if (!form.source.trim()) {
      return "Source name is required.";
    }
    if (Number(form.capacity) <= 0) {
      return "Capacity must be greater than 0.";
    }
    if (Number(form.available) < 0 || Number(form.available) > Number(form.capacity)) {
      return "Available oxygen must be between 0 and capacity.";
    }
    if (Number(form.flowRateLph) < 0) {
      return "Flow rate cannot be negative.";
    }
    return "";
  }

  if (!form.name.trim()) {
    return "Medicine name is required.";
  }
  if (Number(form.stock) < 0 || Number(form.threshold) < 0 || Number(form.dailyUse) < 0) {
    return "Stock, threshold, and daily use cannot be negative.";
  }
  return "";
}

function utilizationBadge(percent) {
  if (percent >= 90) {
    return "bg-rose-100 text-rose-700";
  }
  if (percent >= 75) {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-emerald-100 text-emerald-700";
}

export default function ResourcesPage() {
  const { session, ready } = useRequireSession();
  const { resources: liveResources, loaded, refresh, error: loadError } = useMedRadarLiveData();
  const [resources, setResources] = useState(null);
  const [activeTab, setActiveTab] = useState("beds");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyForm("beds"));
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(nowTime());
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const canImportSnapshot = Boolean(session?.permissions?.canAccessAdmin);
  const canEditActiveType = Boolean(session?.permissions?.resourceWrite?.includes(activeTab));

  useEffect(() => {
    if (!ready || !session || !loaded || !liveResources) {
      return;
    }

    setResources(liveResources);
    setLastSyncAt(nowTime());
  }, [ready, session, loaded, liveResources]);

  useEffect(() => {
    setForm(buildEmptyForm(activeTab));
    setEditingId(null);
    setError("");
    setShowForm(false);
  }, [activeTab]);

  const collection = useMemo(() => {
    if (!resources) {
      return [];
    }
    return resources[activeTab] ?? [];
  }, [resources, activeTab]);

  const filteredCollection = useMemo(() => {
    if (!search.trim()) {
      return collection;
    }

    const query = search.toLowerCase();
    return collection.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(query))
    );
  }, [collection, search]);

  const summary = useMemo(() => {
    if (!resources) {
      return [];
    }

    const bedsTotal = resources.beds.reduce((sum, row) => sum + row.total, 0);
    const bedsOccupied = resources.beds.reduce((sum, row) => sum + row.occupied, 0);
    const oxygenCapacity = resources.oxygen.reduce((sum, row) => sum + row.capacity, 0);
    const oxygenAvailable = resources.oxygen.reduce((sum, row) => sum + row.available, 0);
    const medicinesLow = resources.medicines.filter((med) => med.stock <= med.threshold).length;

    return [
      { label: "Beds in system", value: bedsTotal },
      { label: "Bed occupancy", value: `${bedsOccupied}/${bedsTotal}` },
      { label: "Oxygen reserve", value: `${oxygenAvailable}/${oxygenCapacity} L` },
      { label: "Low medicines", value: medicinesLow },
    ];
  }, [resources]);

  const clearFeedbackLater = (message, type = "success") => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 2500);
  };

  const persist = async (nextCollection, message) => {
    setIsSaving(true);
    try {
      const response = await updateResourceType(activeTab, nextCollection);
      setResources(response.resources);
      setLastSyncAt(nowTime());
      await refresh();
      if (message) {
        clearFeedbackLater(message, "success");
      }
    } catch (nextError) {
      if (nextError instanceof ApiError) {
        setFeedback({ type: "error", message: nextError.message });
      } else {
        setFeedback({ type: "error", message: "Failed to save resource changes." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!canEditActiveType) {
      setError("Your role has read-only access for this resource type.");
      return;
    }

    const validation = validateForm(activeTab, form);
    if (validation) {
      setError(validation);
      return;
    }

    const item = buildItemFromForm(activeTab, form, editingId);
    const nextCollection = editingId
      ? collection.map((row) => (row.id === editingId ? item : row))
      : [item, ...collection];

    await persist(nextCollection, editingId ? "Row updated." : "Row added.");

    setForm(buildEmptyForm(activeTab));
    setEditingId(null);
    setError("");
    setShowForm(false);
  };

  const handleEdit = (item) => {
    if (!canEditActiveType) {
      setFeedback({ type: "error", message: "Your role has read-only access for this resource type." });
      return;
    }

    setEditingId(item.id);
    setForm({ ...item });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!canEditActiveType) {
      setFeedback({ type: "error", message: "Your role has read-only access for this resource type." });
      return;
    }

    const ok = window.confirm("Delete this row from resource inventory?");
    if (!ok) {
      return;
    }

    const nextCollection = collection.filter((row) => row.id !== id);
    await persist(nextCollection, "Row deleted.");

    if (editingId === id) {
      setEditingId(null);
      setForm(buildEmptyForm(activeTab));
      setShowForm(false);
      setError("");
    }
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      resources,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `medradar-resources-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    clearFeedbackLater("Resource snapshot exported.", "success");
  };

  const openImportPicker = () => {
    if (!canImportSnapshot) {
      setFeedback({ type: "error", message: "Only admins can import full snapshots." });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      const result = await importResourceSnapshot(parsed);

      setResources(result.resources);
      setLastSyncAt(nowTime());
      await refresh();
      clearFeedbackLater(result.message || "Resource snapshot imported.", "success");
    } catch (nextError) {
      if (nextError instanceof ApiError) {
        setFeedback({ type: "error", message: nextError.message });
      } else {
        setFeedback({ type: "error", message: "Failed to import file. Upload valid JSON." });
      }
    }
  };

  const handleManualRefresh = async () => {
    await refresh();
    setLastSyncAt(nowTime());
    clearFeedbackLater("Resource data refreshed.", "success");
  };

  if (!ready || !session || !loaded || !resources) {
    return (
      <div className="frost-shell flex min-h-screen items-center justify-center">
        <div className="frost-layer frost-glass rounded-xl px-4 py-3 text-sm font-semibold frost-subtitle">Loading resource desk...</div>
      </div>
    );
  }

  return (
    <PortalFrame
      title="Resource Desk"
      subtitle="Maintain live inventory for beds, oxygen, and medicines across the facility."
      session={session}
      rightSlot={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="frost-btn-secondary"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openImportPicker}
            className="frost-btn-secondary"
            disabled={!canImportSnapshot}
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </button>
          <button
            type="button"
            onClick={exportData}
            className="frost-btn-secondary"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      }
    >
      <section className="frost-subtitle mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p>Last sync at {lastSyncAt}</p>
        <p>
          Operator: {session.name} ({session.roleLabel || session.role})
        </p>
      </section>

      {!canEditActiveType ? (
        <section className="frost-alert-warning mb-4">
          Your role is read-only for <span className="font-semibold">{activeTab}</span>. You can still view all inventory.
        </section>
      ) : null}

      {loadError || feedback ? (
        <section
          className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
            loadError || feedback?.type === "error"
              ? "frost-alert-danger"
              : "frost-alert-success"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          {loadError || feedback?.message}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <article key={card.label} className="frost-card rounded-2xl p-4">
            <p className="frost-subtitle text-xs uppercase tracking-wide">{card.label}</p>
            <p className="frost-title mt-2 text-2xl font-black">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="frost-glass mt-6 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "frost-nav-link is-active"
                    : "frost-nav-link"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${activeTab}`}
              className="frost-input"
            />
            <button
              type="button"
              disabled={!canEditActiveType}
              onClick={() => {
                setShowForm((prev) => !prev);
                setEditingId(null);
                setForm(buildEmptyForm(activeTab));
                setError("");
              }}
              className="frost-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add {activeTab.slice(0, -1)}
            </button>
          </div>
        </div>

        {showForm ? (
          <form onSubmit={handleSave} className="frost-card-soft mt-4 rounded-xl p-3">
            {error ? <p className="frost-alert-danger mb-2 text-sm">{error}</p> : null}

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {activeTab === "beds" ? (
                <>
                  <input
                    value={form.ward}
                    onChange={(event) => setForm((prev) => ({ ...prev, ward: event.target.value }))}
                    placeholder="Ward"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.total}
                    onChange={(event) => setForm((prev) => ({ ...prev, total: event.target.value }))}
                    placeholder="Total beds"
                    type="number"
                    min="0"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.occupied}
                    onChange={(event) => setForm((prev) => ({ ...prev, occupied: event.target.value }))}
                    placeholder="Occupied beds"
                    type="number"
                    min="0"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.lastUpdated}
                    onChange={(event) => setForm((prev) => ({ ...prev, lastUpdated: event.target.value }))}
                    placeholder="Updated at"
                    className="frost-input rounded-lg"
                  />
                </>
              ) : null}

              {activeTab === "oxygen" ? (
                <>
                  <input
                    value={form.source}
                    onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
                    placeholder="Source"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.capacity}
                    onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
                    placeholder="Capacity (L)"
                    type="number"
                    min="0"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.available}
                    onChange={(event) => setForm((prev) => ({ ...prev, available: event.target.value }))}
                    placeholder="Available (L)"
                    type="number"
                    min="0"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.flowRateLph}
                    onChange={(event) => setForm((prev) => ({ ...prev, flowRateLph: event.target.value }))}
                    placeholder="Flow L/hr"
                    type="number"
                    min="0"
                    className="frost-input rounded-lg"
                  />
                </>
              ) : null}

              {activeTab === "medicines" ? (
                <>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Medicine"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.stock}
                    onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                    placeholder="Stock"
                    type="number"
                    min="0"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.threshold}
                    onChange={(event) => setForm((prev) => ({ ...prev, threshold: event.target.value }))}
                    placeholder="Threshold"
                    type="number"
                    min="0"
                    className="frost-input rounded-lg"
                  />
                  <input
                    value={form.dailyUse}
                    onChange={(event) => setForm((prev) => ({ ...prev, dailyUse: event.target.value }))}
                    placeholder="Daily use"
                    type="number"
                    min="0"
                    className="frost-input rounded-lg"
                  />
                </>
              ) : null}
            </div>

            {activeTab === "medicines" ? (
              <input
                value={form.unit}
                onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
                placeholder="Unit (vials, strips...)"
                className="frost-input mt-2 w-full rounded-lg"
              />
            ) : null}

            {activeTab === "oxygen" ? (
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="frost-select mt-2 w-full rounded-lg"
              >
                <option value="normal">Normal</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="frost-btn-neutral"
              >
                <Save className="h-4 w-4" />
                {editingId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(buildEmptyForm(activeTab));
                  setError("");
                }}
                className="frost-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="frost-table min-w-full text-left text-sm">
            <thead>
              <tr>
                {activeTab === "beds" ? (
                  <>
                    <th className="px-2 py-2">Ward</th>
                    <th className="px-2 py-2">Total</th>
                    <th className="px-2 py-2">Occupied</th>
                    <th className="px-2 py-2">Utilization</th>
                    <th className="px-2 py-2">Updated</th>
                    <th className="px-2 py-2">Actions</th>
                  </>
                ) : null}

                {activeTab === "oxygen" ? (
                  <>
                    <th className="px-2 py-2">Source</th>
                    <th className="px-2 py-2">Capacity</th>
                    <th className="px-2 py-2">Available</th>
                    <th className="px-2 py-2">Flow L/hr</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Actions</th>
                  </>
                ) : null}

                {activeTab === "medicines" ? (
                  <>
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Stock</th>
                    <th className="px-2 py-2">Threshold</th>
                    <th className="px-2 py-2">Daily use</th>
                    <th className="px-2 py-2">Runway</th>
                    <th className="px-2 py-2">Unit</th>
                    <th className="px-2 py-2">Actions</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {!filteredCollection.length ? (
                <tr>
                  <td
                    colSpan={activeTab === "medicines" ? 7 : activeTab === "oxygen" ? 6 : 6}
                    className="frost-subtitle px-2 py-6 text-center text-sm"
                  >
                    No rows match the current search.
                  </td>
                </tr>
              ) : null}

              {filteredCollection.map((item) => (
                <tr key={item.id}>
                  {activeTab === "beds" ? (
                    <>
                      <td className="px-2 py-2 font-semibold">{item.ward}</td>
                      <td className="px-2 py-2">{item.total}</td>
                      <td className="px-2 py-2">{item.occupied}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${utilizationBadge(
                            Math.round((item.occupied / item.total) * 100)
                          )}`}
                        >
                          {Math.round((item.occupied / item.total) * 100)}%
                        </span>
                      </td>
                      <td className="px-2 py-2">{item.lastUpdated}</td>
                    </>
                  ) : null}

                  {activeTab === "oxygen" ? (
                    <>
                      <td className="px-2 py-2 font-semibold">{item.source}</td>
                      <td className="px-2 py-2">{item.capacity}</td>
                      <td className="px-2 py-2">{item.available}</td>
                      <td className="px-2 py-2">{item.flowRateLph}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                            item.status === "critical"
                              ? "bg-rose-100 text-rose-700"
                              : item.status === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </>
                  ) : null}

                  {activeTab === "medicines" ? (
                    <>
                      <td className="px-2 py-2 font-semibold">{item.name}</td>
                      <td className="px-2 py-2">{item.stock}</td>
                      <td className="px-2 py-2">{item.threshold}</td>
                      <td className="px-2 py-2">{item.dailyUse}</td>
                      <td className="px-2 py-2">
                        {item.dailyUse > 0 ? `${(item.stock / item.dailyUse).toFixed(1)} days` : "N/A"}
                      </td>
                      <td className="px-2 py-2">{item.unit}</td>
                    </>
                  ) : null}

                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!canEditActiveType}
                        onClick={() => handleEdit(item)}
                        className="frost-btn-secondary rounded-lg px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={!canEditActiveType}
                        onClick={() => handleDelete(item.id)}
                        className="frost-btn-danger rounded-lg px-2 py-1 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PortalFrame>
  );
}
