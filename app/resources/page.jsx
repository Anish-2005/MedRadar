"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import PortalFrame from "@/components/portal-frame";
import { getResources, saveResources } from "@/lib/medradarStore";
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

export default function ResourcesPage() {
  const { session, ready } = useRequireSession();
  const [resources, setResources] = useState(null);
  const [activeTab, setActiveTab] = useState("beds");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyForm("beds"));
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!ready || !session) {
      return;
    }
    setResources(getResources());
  }, [ready, session]);

  useEffect(() => {
    setForm(buildEmptyForm(activeTab));
    setEditingId(null);
    setError("");
    setShowForm(false);
  }, [activeTab]);

  const collection = resources?.[activeTab] ?? [];

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
      { label: "Beds occupied", value: bedsOccupied },
      { label: "Oxygen reserve", value: `${oxygenAvailable}/${oxygenCapacity} L` },
      { label: "Low medicines", value: medicinesLow },
    ];
  }, [resources]);

  const persist = (nextResources) => {
    setResources(nextResources);
    saveResources(nextResources, session.name);
  };

  const handleSave = (event) => {
    event.preventDefault();

    const validation = validateForm(activeTab, form);
    if (validation) {
      setError(validation);
      return;
    }

    const item = buildItemFromForm(activeTab, form, editingId);
    const nextCollection = editingId
      ? collection.map((row) => (row.id === editingId ? item : row))
      : [item, ...collection];

    const nextResources = { ...resources, [activeTab]: nextCollection };
    persist(nextResources);

    setForm(buildEmptyForm(activeTab));
    setEditingId(null);
    setError("");
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setShowForm(true);
    setError("");
  };

  const handleDelete = (id) => {
    const nextCollection = collection.filter((row) => row.id !== id);
    persist({ ...resources, [activeTab]: nextCollection });

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
  };

  if (!ready || !session || !resources) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow">Loading resource desk...</div>
      </div>
    );
  }

  return (
    <PortalFrame
      title="Resource Desk"
      subtitle="Maintain live inventory for beds, oxygen, and medicines across the facility."
      session={session}
      rightSlot={
        <button
          type="button"
          onClick={exportData}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </button>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <article key={card.label} className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-600 to-sky-600 text-white"
                    : "border border-cyan-100 text-slate-700 hover:bg-cyan-50"
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
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            />
            <button
              type="button"
              onClick={() => {
                setShowForm((prev) => !prev);
                setEditingId(null);
                setForm(buildEmptyForm(activeTab));
                setError("");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-3 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add {activeTab.slice(0, -1)}
            </button>
          </div>
        </div>

        {showForm ? (
          <form onSubmit={handleSave} className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
            {error ? <p className="mb-2 text-sm text-rose-700">{error}</p> : null}

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {activeTab === "beds" ? (
                <>
                  <input
                    value={form.ward}
                    onChange={(event) => setForm((prev) => ({ ...prev, ward: event.target.value }))}
                    placeholder="Ward"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.total}
                    onChange={(event) => setForm((prev) => ({ ...prev, total: event.target.value }))}
                    placeholder="Total beds"
                    type="number"
                    min="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.occupied}
                    onChange={(event) => setForm((prev) => ({ ...prev, occupied: event.target.value }))}
                    placeholder="Occupied beds"
                    type="number"
                    min="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.lastUpdated}
                    onChange={(event) => setForm((prev) => ({ ...prev, lastUpdated: event.target.value }))}
                    placeholder="Updated at"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </>
              ) : null}

              {activeTab === "oxygen" ? (
                <>
                  <input
                    value={form.source}
                    onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
                    placeholder="Source"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.capacity}
                    onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
                    placeholder="Capacity (L)"
                    type="number"
                    min="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.available}
                    onChange={(event) => setForm((prev) => ({ ...prev, available: event.target.value }))}
                    placeholder="Available (L)"
                    type="number"
                    min="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.flowRateLph}
                    onChange={(event) => setForm((prev) => ({ ...prev, flowRateLph: event.target.value }))}
                    placeholder="Flow L/hr"
                    type="number"
                    min="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </>
              ) : null}

              {activeTab === "medicines" ? (
                <>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Medicine"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.stock}
                    onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                    placeholder="Stock"
                    type="number"
                    min="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.threshold}
                    onChange={(event) => setForm((prev) => ({ ...prev, threshold: event.target.value }))}
                    placeholder="Threshold"
                    type="number"
                    min="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={form.dailyUse}
                    onChange={(event) => setForm((prev) => ({ ...prev, dailyUse: event.target.value }))}
                    placeholder="Daily use"
                    type="number"
                    min="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </>
              ) : null}
            </div>

            {activeTab === "medicines" ? (
              <input
                value={form.unit}
                onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
                placeholder="Unit (vials, strips...)"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            ) : null}

            {activeTab === "oxygen" ? (
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="normal">Normal</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                {activeTab === "beds" ? (
                  <>
                    <th className="px-2 py-2">Ward</th>
                    <th className="px-2 py-2">Total</th>
                    <th className="px-2 py-2">Occupied</th>
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
                    <th className="px-2 py-2">Unit</th>
                    <th className="px-2 py-2">Actions</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filteredCollection.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 text-slate-700">
                  {activeTab === "beds" ? (
                    <>
                      <td className="px-2 py-2 font-semibold text-slate-900">{item.ward}</td>
                      <td className="px-2 py-2">{item.total}</td>
                      <td className="px-2 py-2">{item.occupied}</td>
                      <td className="px-2 py-2">{item.lastUpdated}</td>
                    </>
                  ) : null}

                  {activeTab === "oxygen" ? (
                    <>
                      <td className="px-2 py-2 font-semibold text-slate-900">{item.source}</td>
                      <td className="px-2 py-2">{item.capacity}</td>
                      <td className="px-2 py-2">{item.available}</td>
                      <td className="px-2 py-2">{item.flowRateLph}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
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
                      <td className="px-2 py-2 font-semibold text-slate-900">{item.name}</td>
                      <td className="px-2 py-2">{item.stock}</td>
                      <td className="px-2 py-2">{item.threshold}</td>
                      <td className="px-2 py-2">{item.dailyUse}</td>
                      <td className="px-2 py-2">{item.unit}</td>
                    </>
                  ) : null}

                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded-lg border border-cyan-200 px-2 py-1 text-xs font-semibold text-cyan-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700"
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
