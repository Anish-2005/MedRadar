import { describe, expect, it } from "vitest";
import { DEFAULT_RESOURCES, DEFAULT_SETTINGS } from "@/lib/medradarData";
import {
  buildDataQuality,
  buildOperationalChecklist,
  calculateAlerts,
  calculateDashboardMetrics,
} from "@/lib/domain/operations";

describe("operations domain", () => {
  it("calculates dashboard metrics from resources", () => {
    const metrics = calculateDashboardMetrics(DEFAULT_RESOURCES);

    expect(metrics.totalBeds).toBe(120);
    expect(metrics.occupiedBeds).toBe(92);
    expect(metrics.bedOccupancyPercent).toBe(77);
    expect(metrics.oxygenCapacity).toBe(11000);
    expect(metrics.oxygenAvailable).toBe(4570);
    expect(metrics.oxygenReservePercent).toBe(42);
    expect(metrics.estimatedOxygenHours).toBe(6.4);
    expect(metrics.medicineStock).toBe(771);
    expect(metrics.lowMedicineCount).toBe(1);
  });

  it("builds alerts when thresholds are crossed", () => {
    const metrics = calculateDashboardMetrics(DEFAULT_RESOURCES);

    const alerts = calculateAlerts(
      DEFAULT_RESOURCES,
      {
        ...DEFAULT_SETTINGS,
        bedOccupancyAlertPercent: 70,
        oxygenReserveAlertPercent: 50,
        medicineLowDays: 6,
      },
      metrics
    );

    expect(alerts).toHaveLength(3);
    expect(alerts.map((item) => item.id)).toEqual(["beds", "oxygen", "meds"]);
  });

  it("builds operational checklist and quality counters", () => {
    const mutated = {
      ...DEFAULT_RESOURCES,
      beds: DEFAULT_RESOURCES.beds.map((ward, index) =>
        index === 0 ? { ...ward, lastUpdated: "--:--" } : ward
      ),
      oxygen: DEFAULT_RESOURCES.oxygen.map((source, index) =>
        index === 1 ? { ...source, flowRateLph: 0 } : source
      ),
      medicines: DEFAULT_RESOURCES.medicines.map((med, index) =>
        index === 2 ? { ...med, dailyUse: 0 } : med
      ),
    };

    const metrics = calculateDashboardMetrics(mutated);
    const checklist = buildOperationalChecklist(mutated, DEFAULT_SETTINGS, metrics);
    const quality = buildDataQuality(mutated);

    expect(checklist).toHaveLength(3);
    expect(quality.find((item) => item.id === "beds-updated")?.value).toBe(1);
    expect(quality.find((item) => item.id === "oxygen-flow")?.value).toBe(1);
    expect(quality.find((item) => item.id === "med-usage")?.value).toBe(1);
  });
});
