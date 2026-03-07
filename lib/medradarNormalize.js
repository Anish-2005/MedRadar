import { DEFAULT_RESOURCES, DEFAULT_SETTINGS } from "./medradarData";

const OXYGEN_STATUS = ["normal", "warning", "critical"];

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.round(parsed);
}

function toText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed || fallback;
}

function clamp(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function inferOxygenStatus(available, capacity, provided) {
  if (OXYGEN_STATUS.includes(provided)) {
    return provided;
  }

  if (!capacity) {
    return "critical";
  }

  const reservePercent = (available / capacity) * 100;
  if (reservePercent <= 20) {
    return "critical";
  }
  if (reservePercent <= 40) {
    return "warning";
  }
  return "normal";
}

function normalizeBeds(inputBeds = DEFAULT_RESOURCES.beds) {
  return inputBeds.map((item, index) => {
    const ward = toText(item?.ward, `Ward ${index + 1}`);
    const total = Math.max(1, toPositiveInt(item?.total, 1));
    const occupied = clamp(item?.occupied, 0, total, 0);

    return {
      id: toText(item?.id, `bed-${Date.now()}-${index}`),
      ward,
      total,
      occupied,
      lastUpdated: toText(item?.lastUpdated, "--:--"),
    };
  });
}

function normalizeOxygen(inputOxygen = DEFAULT_RESOURCES.oxygen) {
  return inputOxygen.map((item, index) => {
    const capacity = Math.max(1, toPositiveInt(item?.capacity, 1));
    const available = clamp(item?.available, 0, capacity, capacity);

    return {
      id: toText(item?.id, `oxy-${Date.now()}-${index}`),
      source: toText(item?.source, `Source ${index + 1}`),
      capacity,
      available,
      flowRateLph: toPositiveInt(item?.flowRateLph, 0),
      status: inferOxygenStatus(available, capacity, item?.status),
    };
  });
}

function normalizeMedicines(inputMedicines = DEFAULT_RESOURCES.medicines) {
  return inputMedicines.map((item, index) => ({
    id: toText(item?.id, `med-${Date.now()}-${index}`),
    name: toText(item?.name, `Medicine ${index + 1}`),
    stock: toPositiveInt(item?.stock, 0),
    threshold: toPositiveInt(item?.threshold, 0),
    dailyUse: toPositiveInt(item?.dailyUse, 0),
    unit: toText(item?.unit, "units"),
  }));
}

export function normalizeResources(rawResources) {
  const safe = rawResources && typeof rawResources === "object" ? rawResources : DEFAULT_RESOURCES;

  return {
    beds: normalizeBeds(Array.isArray(safe.beds) ? safe.beds : DEFAULT_RESOURCES.beds),
    oxygen: normalizeOxygen(Array.isArray(safe.oxygen) ? safe.oxygen : DEFAULT_RESOURCES.oxygen),
    medicines: normalizeMedicines(Array.isArray(safe.medicines) ? safe.medicines : DEFAULT_RESOURCES.medicines),
  };
}

export function normalizeSettings(rawSettings) {
  const safe = rawSettings && typeof rawSettings === "object" ? rawSettings : DEFAULT_SETTINGS;

  return {
    bedOccupancyAlertPercent: clamp(
      safe.bedOccupancyAlertPercent,
      50,
      100,
      DEFAULT_SETTINGS.bedOccupancyAlertPercent
    ),
    oxygenReserveAlertPercent: clamp(
      safe.oxygenReserveAlertPercent,
      5,
      80,
      DEFAULT_SETTINGS.oxygenReserveAlertPercent
    ),
    medicineLowDays: clamp(safe.medicineLowDays, 1, 30, DEFAULT_SETTINGS.medicineLowDays),
    shiftLead: toText(safe.shiftLead, DEFAULT_SETTINGS.shiftLead),
    escalationContact: toText(safe.escalationContact, DEFAULT_SETTINGS.escalationContact),
  };
}

export function parseResourceImport(rawPayload) {
  if (!rawPayload || typeof rawPayload !== "object") {
    return { ok: false, message: "Invalid import payload. Expected JSON object." };
  }

  const candidate = rawPayload.resources ?? rawPayload;

  if (!candidate || typeof candidate !== "object") {
    return { ok: false, message: "Import payload does not include resources data." };
  }

  if (!Array.isArray(candidate.beds) || !Array.isArray(candidate.oxygen) || !Array.isArray(candidate.medicines)) {
    return {
      ok: false,
      message: "Resources payload must include beds, oxygen, and medicines arrays.",
    };
  }

  const normalized = normalizeResources(candidate);

  return {
    ok: true,
    data: normalized,
  };
}
