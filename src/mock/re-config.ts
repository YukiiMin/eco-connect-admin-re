/** Point rule type */
export interface PointRule {
  id: string;
  wasteType: "RECYCLABLE" | "ORGANIC" | "HAZARDOUS" | "MIXED";
  basePoints: number;
  qualityMultiplier: number;
  timeBonus: number;
  description: string;
}

/** Point Rule Set — only 1 active at a time */
export interface PointRuleSet {
  id: string;
  name: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  effectiveDate: string;
  rules: PointRule[];
  misclassificationPenalty: number;
}

/** Mock point rule sets */
export const pointRuleSets: PointRuleSet[] = [
  {
    id: "PRS001",
    name: "Bộ quy tắc v1.0",
    status: "ACTIVE",
    effectiveDate: "2025-01-01",
    misclassificationPenalty: -1,
    rules: [
      { id: "PR001", wasteType: "RECYCLABLE", basePoints: 10, qualityMultiplier: 1.2, timeBonus: 5, description: "Rác tái chế cơ bản" },
      { id: "PR002", wasteType: "ORGANIC", basePoints: 8, qualityMultiplier: 1.0, timeBonus: 3, description: "Rác hữu cơ" },
      { id: "PR003", wasteType: "HAZARDOUS", basePoints: 20, qualityMultiplier: 1.2, timeBonus: 10, description: "Rác nguy hại — ưu tiên" },
      { id: "PR004", wasteType: "MIXED", basePoints: 6, qualityMultiplier: 0.8, timeBonus: 2, description: "Rác hỗn hợp" },
    ],
  },
  {
    id: "PRS002",
    name: "Bộ quy tắc v2.0 (Dự kiến)",
    status: "DRAFT",
    effectiveDate: "2025-02-01",
    misclassificationPenalty: -2,
    rules: [
      { id: "PR005", wasteType: "RECYCLABLE", basePoints: 12, qualityMultiplier: 1.2, timeBonus: 5, description: "Rác tái chế — tăng điểm" },
      { id: "PR006", wasteType: "ORGANIC", basePoints: 10, qualityMultiplier: 1.0, timeBonus: 4, description: "Rác hữu cơ — tăng điểm" },
      { id: "PR007", wasteType: "HAZARDOUS", basePoints: 25, qualityMultiplier: 1.2, timeBonus: 12, description: "Rác nguy hại — ưu tiên cao" },
      { id: "PR008", wasteType: "MIXED", basePoints: 5, qualityMultiplier: 0.8, timeBonus: 2, description: "Rác hỗn hợp — giảm" },
    ],
  },
];

/** Legacy flat rules export for backward compat */
export const pointRules: PointRule[] = pointRuleSets[0].rules;

/** Area config type */
export interface AreaConfig {
  id: string;
  name: string;
  centerAddress: string;
  lat: number;
  lng: number;
  radiusKm: number;
  threshold: number;
  maxCapacityM3: number;
  maxCapacityKg: number;
  team1Lead: string;
  team2Lead: string;
}

/** Mock areas */
export const areas: AreaConfig[] = [
  { id: "A1", name: "Khu A", centerAddress: "Ngã tư Nơ Trang Long - Bùi Đình Túy", lat: 10.8052, lng: 106.7094, radiusKm: 1.2, threshold: 20, maxCapacityM3: 8, maxCapacityKg: 2000, team1Lead: "Trần Văn Hùng", team2Lead: "Hoàng Minh Tú" },
  { id: "A2", name: "Khu B", centerAddress: "Ngã tư Phan Văn Trị - Lê Quang Định", lat: 10.8120, lng: 106.6980, radiusKm: 1.0, threshold: 20, maxCapacityM3: 8, maxCapacityKg: 2000, team1Lead: "Nguyễn Văn Khoa", team2Lead: "Vũ Thị Hoa" },
  { id: "A3", name: "Khu C", centerAddress: "Ngã tư Đinh Tiên Hoàng - Bạch Đằng", lat: 10.7985, lng: 106.7150, radiusKm: 0.8, threshold: 18, maxCapacityM3: 6, maxCapacityKg: 1500, team1Lead: "Lê Văn Dũng", team2Lead: "Đinh Văn Tâm" },
];

/** Vehicle template */
export interface VehicleTemplate {
  id: string;
  name: string;
  maxVolumeM3: number;
  maxWeightKg: number;
}

export const vehicleTemplate: VehicleTemplate = {
  id: "VH001",
  name: "Xe tải nhỏ 1.5 tấn",
  maxVolumeM3: 8,
  maxWeightKg: 1500,
};

/** Team schedule config */
export const teamSchedule = {
  team1Days: ["Mon", "Wed", "Fri"],
  team2Days: ["Tue", "Thu", "Sat"],
  collectionTime: "22:00",
  dispatchTime: "20:00",
  overflowAutoNotify: true,
};
