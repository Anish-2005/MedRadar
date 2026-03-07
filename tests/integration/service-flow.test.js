import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { calculateAlerts, calculateDashboardMetrics } from "@/lib/domain/operations";

let service;
let dbPath;

beforeEach(async () => {
  vi.resetModules();
  dbPath = path.join(os.tmpdir(), `medradar-test-${Date.now()}-${Math.random()}.json`);
  process.env.MEDRADAR_DB_PATH = dbPath;
  service = await import("@/lib/server/service");
});

afterEach(async () => {
  try {
    await fs.rm(dbPath, { force: true });
  } catch {
    // noop
  }
  delete process.env.MEDRADAR_DB_PATH;
});

describe("service integration", () => {
  it("enforces RBAC for resource updates", async () => {
    const signup = await service.signupAccount({
      name: "Priya Pharmacy",
      hospitalName: "MedRadar General Hospital",
      email: "pharmacy@medradar.app",
      password: "secure123",
      role: "pharmacy",
    });

    expect(signup.ok).toBe(true);

    const resourceRead = await service.getResourcesForSession(signup.sessionToken);
    expect(resourceRead.ok).toBe(true);

    const medicineUpdate = await service.updateResourceCollection(
      signup.sessionToken,
      "medicines",
      resourceRead.resources.medicines.map((item) => ({ ...item, stock: item.stock + 5 }))
    );
    expect(medicineUpdate.ok).toBe(true);

    const bedUpdate = await service.updateResourceCollection(
      signup.sessionToken,
      "beds",
      resourceRead.resources.beds
    );

    expect(bedUpdate.ok).toBe(false);
    expect(bedUpdate.status).toBe(403);
  });

  it("applies settings and impacts threshold alerts", async () => {
    const login = await service.loginAccount({
      email: "admin@medradar.app",
      password: "admin123",
    });

    expect(login.ok).toBe(true);

    const saveSettings = await service.updateSettingsForSession(login.sessionToken, {
      bedOccupancyAlertPercent: 70,
      oxygenReserveAlertPercent: 50,
      medicineLowDays: 6,
      shiftLead: "Admin Shift Lead",
      escalationContact: "+91 90000 00000",
    });

    expect(saveSettings.ok).toBe(true);

    const resourcesResult = await service.getResourcesForSession(login.sessionToken);
    const settingsResult = await service.getSettingsForSession(login.sessionToken);

    expect(resourcesResult.ok).toBe(true);
    expect(settingsResult.ok).toBe(true);

    const metrics = calculateDashboardMetrics(resourcesResult.resources);
    const alerts = calculateAlerts(resourcesResult.resources, settingsResult.settings, metrics);

    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });
});
