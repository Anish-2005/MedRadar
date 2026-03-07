export const DEFAULT_USERS = [
  {
    id: "u-admin",
    name: "Dr. Asha Mehta",
    email: "admin@medradar.app",
    password: "admin123",
    role: "Hospital Administrator",
    hospitalName: "MedRadar General Hospital",
  },
];

export const DEFAULT_RESOURCES = {
  beds: [
    { id: "bed-1", ward: "General Ward A", total: 40, occupied: 33, lastUpdated: "07:10" },
    { id: "bed-2", ward: "General Ward B", total: 36, occupied: 28, lastUpdated: "07:05" },
    { id: "bed-3", ward: "ICU", total: 18, occupied: 16, lastUpdated: "07:20" },
    { id: "bed-4", ward: "Isolation", total: 12, occupied: 6, lastUpdated: "06:55" },
    { id: "bed-5", ward: "Pediatric", total: 14, occupied: 9, lastUpdated: "06:40" },
  ],
  oxygen: [
    { id: "oxy-1", source: "Main Liquid Tank", capacity: 6200, available: 2410, flowRateLph: 380, status: "warning" },
    { id: "oxy-2", source: "Cylinder Bank A", capacity: 2400, available: 1340, flowRateLph: 140, status: "normal" },
    { id: "oxy-3", source: "Cylinder Bank B", capacity: 2400, available: 820, flowRateLph: 190, status: "warning" },
  ],
  medicines: [
    { id: "med-1", name: "Ceftriaxone", stock: 210, threshold: 120, dailyUse: 28, unit: "vials" },
    { id: "med-2", name: "Remdesivir", stock: 68, threshold: 55, dailyUse: 11, unit: "vials" },
    { id: "med-3", name: "Noradrenaline", stock: 31, threshold: 40, dailyUse: 6, unit: "ampoules" },
    { id: "med-4", name: "Paracetamol", stock: 390, threshold: 180, dailyUse: 52, unit: "strips" },
    { id: "med-5", name: "Insulin", stock: 72, threshold: 48, dailyUse: 7, unit: "pens" },
  ],
};

export const DEFAULT_SETTINGS = {
  bedOccupancyAlertPercent: 88,
  oxygenReserveAlertPercent: 30,
  medicineLowDays: 4,
  shiftLead: "Nurse Supervisor - Unit 2",
  escalationContact: "+91 91000 11001",
};

export const DEFAULT_FORECAST = {
  bedDemand: [
    { day: "Mon", required: 126 },
    { day: "Tue", required: 132 },
    { day: "Wed", required: 128 },
    { day: "Thu", required: 138 },
    { day: "Fri", required: 141 },
    { day: "Sat", required: 136 },
    { day: "Sun", required: 129 },
  ],
  oxygenUsage: [
    { time: "00:00", liters: 280 },
    { time: "04:00", liters: 190 },
    { time: "08:00", liters: 420 },
    { time: "12:00", liters: 470 },
    { time: "16:00", liters: 430 },
    { time: "20:00", liters: 390 },
  ],
};

export const DEFAULT_AUDIT_LOG = [
  {
    id: "audit-1",
    actor: "System",
    action: "Daily sync completed",
    target: "Resource snapshot",
    time: "06:30",
  },
  {
    id: "audit-2",
    actor: "Pharmacy Desk",
    action: "Stock updated",
    target: "Ceftriaxone",
    time: "06:10",
  },
  {
    id: "audit-3",
    actor: "ICU Desk",
    action: "Ward occupancy updated",
    target: "ICU",
    time: "05:55",
  },
];
