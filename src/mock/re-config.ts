/** Point rule type */
export interface PointRule {
  id: string;
  wasteType: "RECYCLABLE" | "ORGANIC" | "HAZARDOUS" | "MIXED";
  basePoints: number;
  qualityMultiplier: number;
  timeBonus: number;
  description: string;
}

/** Mock point rules */
export const pointRules: PointRule[] = [
  { id: "PR001", wasteType: "RECYCLABLE", basePoints: 10, qualityMultiplier: 1.5, timeBonus: 5, description: "Rác tái chế cơ bản" },
  { id: "PR002", wasteType: "ORGANIC", basePoints: 8, qualityMultiplier: 1.2, timeBonus: 3, description: "Rác hữu cơ" },
  { id: "PR003", wasteType: "HAZARDOUS", basePoints: 20, qualityMultiplier: 2.0, timeBonus: 10, description: "Rác nguy hại — ưu tiên" },
  { id: "PR004", wasteType: "MIXED", basePoints: 6, qualityMultiplier: 1.0, timeBonus: 2, description: "Rác hỗn hợp" },
];

/** Area config type */
export interface AreaConfig {
  id: string;
  name: string;
  centerAddress: string;
  threshold: number;
  team1Lead: string;
  team2Lead: string;
}

/** Mock areas */
export const areas: AreaConfig[] = [
  { id: "A1", name: "Khu A", centerAddress: "Ngã tư Nơ Trang Long - Bùi Đình Túy", threshold: 20, team1Lead: "Trần Văn Hùng", team2Lead: "Hoàng Minh Tú" },
  { id: "A2", name: "Khu B", centerAddress: "Ngã tư Phan Văn Trị - Lê Quang Định", threshold: 20, team1Lead: "Nguyễn Văn Khoa", team2Lead: "Vũ Thị Hoa" },
  { id: "A3", name: "Khu C", centerAddress: "Ngã tư Đinh Tiên Hoàng - Bạch Đằng", threshold: 18, team1Lead: "Lê Văn Dũng", team2Lead: "Đinh Văn Tâm" },
];

/** Team schedule config */
export const teamSchedule = {
  team1Days: ["Mon", "Wed", "Fri"],
  team2Days: ["Tue", "Thu", "Sat"],
  collectionTime: "22:00",
  overflowAutoNotify: true,
};
