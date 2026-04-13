/** RE Manager dashboard mock data */

export const reInfo = {
  name: "Xanh Môi Trường Co.",
  ward: "Phường 13, Bình Thạnh",
  manager: "Lê Văn Minh",
  areas: ["Khu A", "Khu B", "Khu C"],
  totalCollectors: 8,
  activeToday: 6,
  threshold: 20,
};

export const todayStats = {
  totalRequests: 47,
  pending: 12,
  queued: 8,
  assigned: 6,
  onTheWay: 4,
  collected: 14,
  verified: 3,
  rejected: 0,
  estimatedCompletion: "23:45",
};

export const weeklyTrend = [
  { day: "T2", total: 42, collected: 40, rejected: 0, avgMinutes: 128 },
  { day: "T3", total: 51, collected: 49, rejected: 1, avgMinutes: 134 },
  { day: "T4", total: 38, collected: 38, rejected: 0, avgMinutes: 119 },
  { day: "T5", total: 56, collected: 52, rejected: 2, avgMinutes: 141 },
  { day: "T6", total: 63, collected: 59, rejected: 1, avgMinutes: 152 },
  { day: "T7", total: 44, collected: 43, rejected: 0, avgMinutes: 127 },
  { day: "CN", total: 29, collected: 28, rejected: 0, avgMinutes: 112 },
];

export const areaLoad = [
  { area: "Khu A", active: 18, threshold: 20, collectors: 3, onDutyTeam: "Team 1" },
  { area: "Khu B", active: 16, threshold: 20, collectors: 3, onDutyTeam: "Team 1" },
  { area: "Khu C", active: 13, threshold: 20, collectors: 2, onDutyTeam: "Team 1" },
];

export const qciAlerts = [
  { id: "A1", level: "WARNING" as const, msg: "Khu A: 18/20 túi — sắp overflow", time: "21:32", area: "Khu A" },
  { id: "A2", level: "INFO" as const, msg: "Collector Nguyễn Văn Khoa chậm hơn 22 phút so với trung bình", time: "22:15", area: "Khu B" },
  { id: "A3", level: "SUCCESS" as const, msg: "Khu C hoàn thành 100% — sớm 35 phút", time: "23:10", area: "Khu C" },
  { id: "A4", level: "WARNING" as const, msg: "3 báo cáo HAZARDOUS chưa được assign", time: "21:58", area: "Khu A" },
];
