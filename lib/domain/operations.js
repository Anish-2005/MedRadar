import { normalizeResources, normalizeSettings } from "@/lib/medradarNormalize";

export function percent(value, total) {
  if (!total) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

export function calculateDashboardMetrics(resources) {
  if (!resources) {
    return null;
  }

  const safe = normalizeResources(resources);

  const totalBeds = safe.beds.reduce((sum, row) => sum + row.total, 0);
  const occupiedBeds = safe.beds.reduce((sum, row) => sum + row.occupied, 0);
  const oxygenCapacity = safe.oxygen.reduce((sum, source) => sum + source.capacity, 0);
  const oxygenAvailable = safe.oxygen.reduce((sum, source) => sum + source.available, 0);
  const hourlyFlow = safe.oxygen.reduce((sum, source) => sum + source.flowRateLph, 0);
  const medicineStock = safe.medicines.reduce((sum, med) => sum + med.stock, 0);
  const lowMedicineCount = safe.medicines.filter((med) => med.stock <= med.threshold).length;

  return {
    totalBeds,
    occupiedBeds,
    bedOccupancyPercent: percent(occupiedBeds, totalBeds),
    oxygenCapacity,
    oxygenAvailable,
    oxygenReservePercent: percent(oxygenAvailable, oxygenCapacity),
    estimatedOxygenHours: hourlyFlow ? Math.round((oxygenAvailable / hourlyFlow) * 10) / 10 : 0,
    medicineStock,
    lowMedicineCount,
  };
}

export function calculateAlerts(resources, settings, metrics) {
  if (!resources || !settings || !metrics) {
    return [];
  }

  const safeResources = normalizeResources(resources);
  const safeSettings = normalizeSettings(settings);
  const list = [];

  if (metrics.bedOccupancyPercent >= safeSettings.bedOccupancyAlertPercent) {
    list.push({
      id: "beds",
      severity: "critical",
      message: `Bed occupancy is at ${metrics.bedOccupancyPercent}% (threshold ${safeSettings.bedOccupancyAlertPercent}%).`,
    });
  }

  if (metrics.oxygenReservePercent <= safeSettings.oxygenReserveAlertPercent) {
    list.push({
      id: "oxygen",
      severity: "critical",
      message: `Oxygen reserve is ${metrics.oxygenReservePercent}% with around ${metrics.estimatedOxygenHours} hours left.`,
    });
  }

  const medicineRisk = safeResources.medicines.filter(
    (med) => med.dailyUse > 0 && med.stock / med.dailyUse <= safeSettings.medicineLowDays
  );
  if (medicineRisk.length) {
    list.push({
      id: "meds",
      severity: "warning",
      message: `${medicineRisk.length} medicines may run out in ${safeSettings.medicineLowDays} days or less.`,
    });
  }

  return list;
}

export function buildOperationalChecklist(resources, settings, metrics) {
  if (!resources || !settings || !metrics) {
    return [];
  }

  const safeResources = normalizeResources(resources);
  const safeSettings = normalizeSettings(settings);
  const items = [];

  const overloadedWards = safeResources.beds.filter(
    (ward) => percent(ward.occupied, ward.total) >= safeSettings.bedOccupancyAlertPercent
  );
  if (overloadedWards.length) {
    items.push({
      id: "beds",
      level: "critical",
      text: `Escalate discharge and triage on ${overloadedWards.length} ward(s) crossing occupancy threshold.`,
    });
  } else {
    items.push({
      id: "beds-ok",
      level: "stable",
      text: "Bed occupancy is below alert threshold across all wards.",
    });
  }

  if (metrics.oxygenReservePercent <= safeSettings.oxygenReserveAlertPercent + 10) {
    items.push({
      id: "oxygen",
      level: "warning",
      text: "Prepare oxygen replenishment for next shift handover to avoid reserve dips.",
    });
  } else {
    items.push({
      id: "oxygen-ok",
      level: "stable",
      text: "Oxygen reserve is in acceptable range for current demand.",
    });
  }

  const medicineShortlist = safeResources.medicines.filter(
    (med) => med.dailyUse > 0 && med.stock / med.dailyUse <= safeSettings.medicineLowDays
  );
  if (medicineShortlist.length) {
    items.push({
      id: "meds",
      level: "warning",
      text: `Fast-track procurement for ${medicineShortlist.length} medicine(s) with short runway.`,
    });
  } else {
    items.push({
      id: "meds-ok",
      level: "stable",
      text: "No medicine is below configured runway threshold.",
    });
  }

  return items;
}

export function buildDataQuality(resources) {
  if (!resources) {
    return [];
  }

  const safe = normalizeResources(resources);

  const bedsWithoutUpdate = safe.beds.filter((row) => !row.lastUpdated || row.lastUpdated === "--:--").length;
  const oxygenWithoutFlow = safe.oxygen.filter((row) => row.flowRateLph <= 0).length;
  const medicinesWithoutUsage = safe.medicines.filter((row) => row.dailyUse <= 0).length;

  return [
    {
      id: "beds-updated",
      label: "Wards missing update time",
      value: bedsWithoutUpdate,
      healthy: bedsWithoutUpdate === 0,
    },
    {
      id: "oxygen-flow",
      label: "Oxygen sources with zero flow",
      value: oxygenWithoutFlow,
      healthy: oxygenWithoutFlow === 0,
    },
    {
      id: "med-usage",
      label: "Medicines without usage baseline",
      value: medicinesWithoutUsage,
      healthy: medicinesWithoutUsage === 0,
    },
  ];
}
