/** Collector type */
export interface Collector {
  id: string;
  name: string;
  team: string;
  area: string;
  phone: string;
  joinDate: string;
  status: "ACTIVE" | "OFF_DUTY" | "INACTIVE";
  todayTasks: number;
  completedToday: number;
  onTime: number;
  streak: number;
  totalAllTime: number;
}

/** Mock collectors */
export const collectors: Collector[] = [
  { id: "C001", name: "Trần Văn Hùng", team: "Team 1", area: "Khu A", phone: "0901111001", joinDate: "2024-03-15", status: "ACTIVE", todayTasks: 5, completedToday: 3, onTime: 97.2, streak: 12, totalAllTime: 284 },
  { id: "C002", name: "Nguyễn Văn Khoa", team: "Team 1", area: "Khu B", phone: "0901111002", joinDate: "2024-04-20", status: "ACTIVE", todayTasks: 4, completedToday: 2, onTime: 91.5, streak: 5, totalAllTime: 198 },
  { id: "C003", name: "Lê Văn Dũng", team: "Team 1", area: "Khu C", phone: "0901111003", joinDate: "2024-05-10", status: "ACTIVE", todayTasks: 4, completedToday: 4, onTime: 88.3, streak: 3, totalAllTime: 156 },
  { id: "C004", name: "Phạm Thanh Bình", team: "Team 1", area: "Khu B", phone: "0901111004", joinDate: "2024-06-01", status: "ACTIVE", todayTasks: 3, completedToday: 3, onTime: 95.0, streak: 8, totalAllTime: 221 },
  { id: "C005", name: "Hoàng Minh Tú", team: "Team 2", area: "Khu A", phone: "0901111005", joinDate: "2024-07-15", status: "OFF_DUTY", todayTasks: 0, completedToday: 0, onTime: 93.1, streak: 0, totalAllTime: 167 },
  { id: "C006", name: "Vũ Thị Hoa", team: "Team 2", area: "Khu B", phone: "0901111006", joinDate: "2024-08-20", status: "OFF_DUTY", todayTasks: 0, completedToday: 0, onTime: 89.7, streak: 0, totalAllTime: 142 },
  { id: "C007", name: "Đinh Văn Tâm", team: "Team 2", area: "Khu C", phone: "0901111007", joinDate: "2024-09-05", status: "OFF_DUTY", todayTasks: 0, completedToday: 0, onTime: 86.2, streak: 2, totalAllTime: 98 },
  { id: "C008", name: "Bùi Thị Ngọc", team: "Team 2", area: "Khu A", phone: "0901111008", joinDate: "2024-10-12", status: "INACTIVE", todayTasks: 0, completedToday: 0, onTime: 72.1, streak: 0, totalAllTime: 54 },
];
