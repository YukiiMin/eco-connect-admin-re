/**
 * Enterprise hierarchy mock data:
 *   Re_Enterprise (1) → Collector_hub (n) → Team (n) → Collector_staff (n)
 *
 * Cấp Enterprise (trung tâm thành phố) quản lý nhiều Hub (cơ sở thu gôm tại
 * mỗi phường/quận). Mỗi Hub có nhiều Team. Mỗi Team có nhiều Staff (collector).
 */

export interface EnterpriseHub {
  id: string;
  name: string;
  /** TP, quận, phường */
  city: string;
  district: string;
  /** Khu vực hoạt động (tên hành chính) */
  serviceArea: string;
  address: string;
  manager: string;
  managerPhone: string;
  status: "ACTIVE" | "PENDING_UPDATE" | "INACTIVE";
  createdAt: string;
  /** Tổng hợp tiến độ ngày */
  totalReportsToday: number;
  completedToday: number;
  failedToday: number;
  inProgressToday: number;
  /** Số team & staff thuộc hub */
  teamCount: number;
  staffCount: number;
}

export interface CollectorTeam {
  id: string;
  hubId: string;
  name: string;
  leaderId: string;
  /** Khu vực phụ trách trong hub */
  zone: string;
  /** Lịch trực: Mon, Tue,... */
  schedule: string[];
  vehiclePlate: string;
  status: "ACTIVE" | "OFF_DUTY" | "INACTIVE";
  createdAt: string;
  /** Stats */
  todayAssigned: number;
  todayCompleted: number;
  todayFailed: number;
  monthCompleted: number;
}

export interface CollectorStaff {
  id: string;
  hubId: string;
  /** null = chưa thuộc team nào (idle pool) */
  teamId: string | null;
  name: string;
  phone: string;
  joinDate: string;
  role: "LEADER" | "MEMBER";
  status: "ACTIVE" | "OFF_DUTY" | "INACTIVE";
  /** Avatar initials (auto from name on render) */
  todayTasks: number;
  completedToday: number;
  onTime: number;
  streak: number;
  totalAllTime: number;
}

/** The single Enterprise (city center) */
export const enterpriseProfile = {
  id: "ENT001",
  name: "Xanh Môi Trường TP.HCM",
  city: "TP. Hồ Chí Minh",
  serviceArea: "TP. Thủ Đức",
  address: "Đường Quảng Trường Sáng Tạo, P. Đông Hòa, TP. Thủ Đức, TP.HCM",
  manager: "Lê Văn Minh",
  managerPhone: "0901000001",
  email: "contact@xanhmoitruong.vn",
  taxCode: "0312345678",
  registeredAt: "2023-06-15",
  hubCount: 3,
  totalStaff: 24,
  totalTeams: 8,
};

/** Collector Hubs trực thuộc Enterprise */
export const collectorHubs: EnterpriseHub[] = [
  {
    id: "HUB001",
    name: "Cơ sở Hiệp Bình",
    city: "TP. Hồ Chí Minh",
    district: "TP. Thủ Đức",
    serviceArea: "P. Hiệp Bình Chánh",
    address: "12 Quốc lộ 13, P. Hiệp Bình Chánh, TP. Thủ Đức",
    manager: "Trần Văn Hùng",
    managerPhone: "0902000001",
    status: "ACTIVE",
    createdAt: "2024-01-10",
    totalReportsToday: 24,
    completedToday: 18,
    failedToday: 1,
    inProgressToday: 5,
    teamCount: 3,
    staffCount: 9,
  },
  {
    id: "HUB002",
    name: "Cơ sở Long Thạnh Mỹ",
    city: "TP. Hồ Chí Minh",
    district: "TP. Thủ Đức",
    serviceArea: "P. Long Thạnh Mỹ",
    address: "88 Lê Văn Việt, P. Long Thạnh Mỹ, TP. Thủ Đức",
    manager: "Nguyễn Văn Khoa",
    managerPhone: "0902000002",
    status: "ACTIVE",
    createdAt: "2024-02-15",
    totalReportsToday: 19,
    completedToday: 14,
    failedToday: 0,
    inProgressToday: 5,
    teamCount: 3,
    staffCount: 8,
  },
  {
    id: "HUB003",
    name: "Cơ sở Đông Hòa",
    city: "TP. Hồ Chí Minh",
    district: "TP. Thủ Đức",
    serviceArea: "P. Đông Hòa",
    address: "45 Đường Số 8, P. Đông Hòa, TP. Thủ Đức",
    manager: "Phạm Thanh Bình",
    managerPhone: "0902000003",
    status: "ACTIVE",
    createdAt: "2024-04-20",
    totalReportsToday: 14,
    completedToday: 10,
    failedToday: 1,
    inProgressToday: 3,
    teamCount: 2,
    staffCount: 7,
  },
];

/** Teams across hubs */
export const collectorTeams: CollectorTeam[] = [
  // HUB001
  { id: "TEAM001", hubId: "HUB001", name: "Đội Alpha", leaderId: "ST001", zone: "Khu A — Hiệp Bình", schedule: ["Mon", "Wed", "Fri"], vehiclePlate: "51C-12345", status: "ACTIVE", createdAt: "2024-01-15", todayAssigned: 9, todayCompleted: 7, todayFailed: 0, monthCompleted: 184 },
  { id: "TEAM002", hubId: "HUB001", name: "Đội Bravo", leaderId: "ST004", zone: "Khu B — Hiệp Bình", schedule: ["Tue", "Thu", "Sat"], vehiclePlate: "51C-12346", status: "ACTIVE", createdAt: "2024-02-01", todayAssigned: 8, todayCompleted: 6, todayFailed: 1, monthCompleted: 162 },
  { id: "TEAM003", hubId: "HUB001", name: "Đội Charlie", leaderId: "ST007", zone: "Khu C — Hiệp Bình", schedule: ["Mon", "Wed", "Fri"], vehiclePlate: "51C-12347", status: "OFF_DUTY", createdAt: "2024-03-10", todayAssigned: 7, todayCompleted: 5, todayFailed: 0, monthCompleted: 141 },
  // HUB002
  { id: "TEAM004", hubId: "HUB002", name: "Đội Delta", leaderId: "ST010", zone: "Khu A — Long Thạnh Mỹ", schedule: ["Mon", "Wed", "Fri"], vehiclePlate: "51C-22345", status: "ACTIVE", createdAt: "2024-02-20", todayAssigned: 8, todayCompleted: 6, todayFailed: 0, monthCompleted: 175 },
  { id: "TEAM005", hubId: "HUB002", name: "Đội Echo", leaderId: "ST013", zone: "Khu B — Long Thạnh Mỹ", schedule: ["Tue", "Thu", "Sat"], vehiclePlate: "51C-22346", status: "ACTIVE", createdAt: "2024-03-05", todayAssigned: 6, todayCompleted: 5, todayFailed: 0, monthCompleted: 152 },
  { id: "TEAM006", hubId: "HUB002", name: "Đội Foxtrot", leaderId: "ST016", zone: "Khu C — Long Thạnh Mỹ", schedule: ["Mon", "Wed", "Fri"], vehiclePlate: "51C-22347", status: "ACTIVE", createdAt: "2024-04-12", todayAssigned: 5, todayCompleted: 3, todayFailed: 0, monthCompleted: 118 },
  // HUB003
  { id: "TEAM007", hubId: "HUB003", name: "Đội Golf", leaderId: "ST018", zone: "Khu A — Đông Hòa", schedule: ["Mon", "Wed", "Fri"], vehiclePlate: "51C-32345", status: "ACTIVE", createdAt: "2024-04-25", todayAssigned: 8, todayCompleted: 6, todayFailed: 1, monthCompleted: 158 },
  { id: "TEAM008", hubId: "HUB003", name: "Đội Hotel", leaderId: "ST021", zone: "Khu B — Đông Hòa", schedule: ["Tue", "Thu", "Sat"], vehiclePlate: "51C-32346", status: "ACTIVE", createdAt: "2024-05-15", todayAssigned: 6, todayCompleted: 4, todayFailed: 0, monthCompleted: 132 },
];

/** Staff (collector) — distributed across hubs/teams. A few staff are unassigned (teamId=null) — pool. */
export const collectorStaff: CollectorStaff[] = [
  // HUB001 — TEAM001
  { id: "ST001", hubId: "HUB001", teamId: "TEAM001", name: "Trần Văn Hùng", phone: "0901111001", joinDate: "2024-01-15", role: "LEADER", status: "ACTIVE", todayTasks: 5, completedToday: 4, onTime: 97.2, streak: 12, totalAllTime: 284 },
  { id: "ST002", hubId: "HUB001", teamId: "TEAM001", name: "Lê Văn An", phone: "0901111002", joinDate: "2024-01-20", role: "MEMBER", status: "ACTIVE", todayTasks: 4, completedToday: 3, onTime: 91.5, streak: 5, totalAllTime: 198 },
  { id: "ST003", hubId: "HUB001", teamId: "TEAM001", name: "Phạm Văn Bình", phone: "0901111003", joinDate: "2024-02-10", role: "MEMBER", status: "ACTIVE", todayTasks: 3, completedToday: 2, onTime: 88.3, streak: 3, totalAllTime: 156 },
  // HUB001 — TEAM002
  { id: "ST004", hubId: "HUB001", teamId: "TEAM002", name: "Nguyễn Văn Khoa", phone: "0901111004", joinDate: "2024-02-01", role: "LEADER", status: "ACTIVE", todayTasks: 4, completedToday: 3, onTime: 95.0, streak: 8, totalAllTime: 221 },
  { id: "ST005", hubId: "HUB001", teamId: "TEAM002", name: "Vũ Văn Cường", phone: "0901111005", joinDate: "2024-02-15", role: "MEMBER", status: "ACTIVE", todayTasks: 3, completedToday: 2, onTime: 92.1, streak: 4, totalAllTime: 167 },
  { id: "ST006", hubId: "HUB001", teamId: "TEAM002", name: "Đỗ Văn Dũng", phone: "0901111006", joinDate: "2024-03-01", role: "MEMBER", status: "OFF_DUTY", todayTasks: 1, completedToday: 1, onTime: 89.7, streak: 0, totalAllTime: 142 },
  // HUB001 — TEAM003
  { id: "ST007", hubId: "HUB001", teamId: "TEAM003", name: "Lê Văn Dũng", phone: "0901111007", joinDate: "2024-03-10", role: "LEADER", status: "ACTIVE", todayTasks: 4, completedToday: 3, onTime: 88.3, streak: 3, totalAllTime: 156 },
  { id: "ST008", hubId: "HUB001", teamId: "TEAM003", name: "Trần Văn Em", phone: "0901111008", joinDate: "2024-03-20", role: "MEMBER", status: "ACTIVE", todayTasks: 3, completedToday: 2, onTime: 86.2, streak: 2, totalAllTime: 98 },
  { id: "ST009", hubId: "HUB001", teamId: null, name: "Hoàng Văn Phúc", phone: "0901111009", joinDate: "2024-09-01", role: "MEMBER", status: "ACTIVE", todayTasks: 0, completedToday: 0, onTime: 84.5, streak: 0, totalAllTime: 42 },

  // HUB002 — TEAM004
  { id: "ST010", hubId: "HUB002", teamId: "TEAM004", name: "Hoàng Minh Tú", phone: "0902111001", joinDate: "2024-02-20", role: "LEADER", status: "ACTIVE", todayTasks: 5, completedToday: 4, onTime: 93.1, streak: 6, totalAllTime: 167 },
  { id: "ST011", hubId: "HUB002", teamId: "TEAM004", name: "Bùi Văn Giang", phone: "0902111002", joinDate: "2024-03-01", role: "MEMBER", status: "ACTIVE", todayTasks: 4, completedToday: 3, onTime: 90.4, streak: 4, totalAllTime: 138 },
  { id: "ST012", hubId: "HUB002", teamId: "TEAM004", name: "Đặng Văn Hải", phone: "0902111003", joinDate: "2024-04-10", role: "MEMBER", status: "ACTIVE", todayTasks: 3, completedToday: 2, onTime: 87.8, streak: 2, totalAllTime: 112 },
  // HUB002 — TEAM005
  { id: "ST013", hubId: "HUB002", teamId: "TEAM005", name: "Vũ Thị Hoa", phone: "0902111004", joinDate: "2024-03-05", role: "LEADER", status: "ACTIVE", todayTasks: 4, completedToday: 4, onTime: 96.7, streak: 9, totalAllTime: 195 },
  { id: "ST014", hubId: "HUB002", teamId: "TEAM005", name: "Mai Thị Kim", phone: "0902111005", joinDate: "2024-04-01", role: "MEMBER", status: "ACTIVE", todayTasks: 3, completedToday: 2, onTime: 91.2, streak: 3, totalAllTime: 121 },
  { id: "ST015", hubId: "HUB002", teamId: "TEAM005", name: "Lý Văn Long", phone: "0902111006", joinDate: "2024-05-20", role: "MEMBER", status: "ACTIVE", todayTasks: 2, completedToday: 1, onTime: 85.0, streak: 1, totalAllTime: 76 },
  // HUB002 — TEAM006
  { id: "ST016", hubId: "HUB002", teamId: "TEAM006", name: "Đinh Văn Tâm", phone: "0902111007", joinDate: "2024-04-12", role: "LEADER", status: "ACTIVE", todayTasks: 4, completedToday: 3, onTime: 86.2, streak: 2, totalAllTime: 98 },
  { id: "ST017", hubId: "HUB002", teamId: null, name: "Tô Văn Phát", phone: "0902111008", joinDate: "2024-10-01", role: "MEMBER", status: "ACTIVE", todayTasks: 0, completedToday: 0, onTime: 82.1, streak: 0, totalAllTime: 28 },

  // HUB003 — TEAM007
  { id: "ST018", hubId: "HUB003", teamId: "TEAM007", name: "Phạm Thanh Bình", phone: "0903111001", joinDate: "2024-04-25", role: "LEADER", status: "ACTIVE", todayTasks: 5, completedToday: 4, onTime: 95.0, streak: 8, totalAllTime: 221 },
  { id: "ST019", hubId: "HUB003", teamId: "TEAM007", name: "Trần Văn Quân", phone: "0903111002", joinDate: "2024-05-10", role: "MEMBER", status: "ACTIVE", todayTasks: 4, completedToday: 3, onTime: 88.6, streak: 4, totalAllTime: 145 },
  { id: "ST020", hubId: "HUB003", teamId: "TEAM007", name: "Bùi Thị Ngọc", phone: "0903111003", joinDate: "2024-06-15", role: "MEMBER", status: "OFF_DUTY", todayTasks: 0, completedToday: 0, onTime: 72.1, streak: 0, totalAllTime: 54 },
  // HUB003 — TEAM008
  { id: "ST021", hubId: "HUB003", teamId: "TEAM008", name: "Cao Thị Mai", phone: "0903111004", joinDate: "2024-05-15", role: "LEADER", status: "ACTIVE", todayTasks: 4, completedToday: 3, onTime: 92.5, streak: 5, totalAllTime: 174 },
  { id: "ST022", hubId: "HUB003", teamId: "TEAM008", name: "Ngô Văn Sơn", phone: "0903111005", joinDate: "2024-06-25", role: "MEMBER", status: "ACTIVE", todayTasks: 3, completedToday: 2, onTime: 87.0, streak: 2, totalAllTime: 105 },
  { id: "ST023", hubId: "HUB003", teamId: null, name: "Lê Thị Hạnh", phone: "0903111006", joinDate: "2024-09-15", role: "MEMBER", status: "ACTIVE", todayTasks: 0, completedToday: 0, onTime: 80.0, streak: 0, totalAllTime: 35 },
  { id: "ST024", hubId: "HUB003", teamId: null, name: "Trịnh Văn Long", phone: "0903111007", joinDate: "2024-10-20", role: "MEMBER", status: "INACTIVE", todayTasks: 0, completedToday: 0, onTime: 65.0, streak: 0, totalAllTime: 12 },
];

/** Monthly stats per team — for team detail dashboard */
export const teamMonthlyStats = [
  { month: "08/24", completed: 142, failed: 4, weightKg: 1820, byType: { RECYCLABLE: 580, ORGANIC: 720, HAZARDOUS: 120, MIXED: 400 } },
  { month: "09/24", completed: 168, failed: 6, weightKg: 2150, byType: { RECYCLABLE: 680, ORGANIC: 850, HAZARDOUS: 145, MIXED: 475 } },
  { month: "10/24", completed: 175, failed: 3, weightKg: 2280, byType: { RECYCLABLE: 720, ORGANIC: 900, HAZARDOUS: 160, MIXED: 500 } },
  { month: "11/24", completed: 184, failed: 5, weightKg: 2410, byType: { RECYCLABLE: 760, ORGANIC: 950, HAZARDOUS: 180, MIXED: 520 } },
  { month: "12/24", completed: 192, failed: 4, weightKg: 2520, byType: { RECYCLABLE: 800, ORGANIC: 980, HAZARDOUS: 195, MIXED: 545 } },
  { month: "01/25", completed: 156, failed: 2, weightKg: 2050, byType: { RECYCLABLE: 650, ORGANIC: 820, HAZARDOUS: 140, MIXED: 440 } },
];

/** Daily stats — last 14 days */
export const enterpriseDailyStats = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  const total = 40 + Math.floor(Math.random() * 25);
  const completed = total - Math.floor(Math.random() * 6);
  const failed = total - completed - Math.floor(Math.random() * 2);
  return {
    date: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
    total,
    completed: Math.max(0, completed),
    failed: Math.max(0, failed),
    weightKg: Math.round(completed * 12 + Math.random() * 40),
    RECYCLABLE: Math.round(completed * 0.32),
    ORGANIC: Math.round(completed * 0.40),
    HAZARDOUS: Math.round(completed * 0.08),
    MIXED: Math.round(completed * 0.20),
  };
});
