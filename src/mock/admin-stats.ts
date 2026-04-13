/** System-wide statistics for admin dashboard */
export const systemStats = {
  totalReports: 1842,
  reportsTodayDelta: 34,
  activeREs: 7,
  pendingREApprovals: 2,
  collectionRate: 94.2,
  openDisputes: 5,
  avgVerifyTime: "2h 18m",
  totalCitizens: 3204,
};

/** Weekly trend data (Mon–Sun) */
export const weeklyTrend = [
  { day: "T2", reports: 210, collected: 198, disputes: 1 },
  { day: "T3", reports: 245, collected: 231, disputes: 2 },
  { day: "T4", reports: 198, collected: 190, disputes: 0 },
  { day: "T5", reports: 267, collected: 251, disputes: 3 },
  { day: "T6", reports: 312, collected: 290, disputes: 2 },
  { day: "T7", reports: 178, collected: 170, disputes: 1 },
  { day: "CN", reports: 134, collected: 128, disputes: 0 },
];

/** Top 5 RE performance */
export const rePerformance = [
  { name: "Phường 13 - BT", reportsHandled: 312, rate: 97.1, disputes: 1, status: "ACTIVE" as const },
  { name: "Phường 14 - BT", reportsHandled: 289, rate: 94.8, disputes: 2, status: "ACTIVE" as const },
  { name: "Phường 25 - BT", reportsHandled: 264, rate: 92.3, disputes: 0, status: "ACTIVE" as const },
  { name: "Phường 26 - BT", reportsHandled: 198, rate: 88.6, disputes: 3, status: "ACTIVE" as const },
  { name: "Phường 27 - BT", reportsHandled: 145, rate: 79.2, disputes: 4, status: "WARNING" as const },
];

/** Recent alerts */
export const recentAlerts = [
  { id: 1, type: "WARNING" as const, msg: "Phường 27 — tỷ lệ hoàn thành < 80%", time: "18 phút trước" },
  { id: 2, type: "INFO" as const, msg: "2 tài khoản RE mới chờ phê duyệt", time: "1 giờ trước" },
  { id: 3, type: "DISPUTE" as const, msg: "Tranh chấp mới từ Citizen RPT-009", time: "2 giờ trước" },
  { id: 4, type: "SUCCESS" as const, msg: "Phường 13 đạt 97% tuần này", time: "3 giờ trước" },
];

/** Waste breakdown for donut chart */
export const wasteBreakdown = [
  { type: "RECYCLABLE", value: 42, color: "#5B8DEF" },
  { type: "ORGANIC", value: 31, color: "#1DB36E" },
  { type: "HAZARDOUS", value: 15, color: "#E74C3C" },
  { type: "MIXED", value: 12, color: "#F5A623" },
];

/** Monthly volume trend (6 months) */
export const monthlyVolume = [
  { month: "T8/24", reports: 820, collected: 780 },
  { month: "T9/24", reports: 934, collected: 891 },
  { month: "T10/24", reports: 1102, collected: 1043 },
  { month: "T11/24", reports: 1284, collected: 1198 },
  { month: "T12/24", reports: 1456, collected: 1367 },
  { month: "T1/25", reports: 1842, collected: 1734 },
];
