/** Dispute type */
export interface Dispute {
  id: string;
  status: "OPEN" | "RESOLVED_REFUNDED" | "RESOLVED_REJECTED" | "ESCALATED";
  reportId: string;
  createdAt: string;
  citizen: { name: string; phone: string; reportPhoto: string };
  collector: { name: string; team: string; collectPhoto: string };
  citizenClaim: string;
  reportAddress: string;
  wasteType: string;
  collectedAt: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  verdict?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedReason?: string;
  /** Audit timeline events */
  timeline?: { time: string; event: string; actor: string }[];
}

/** Mock disputes */
export const disputes: Dispute[] = [
  {
    id: "DSP001", status: "OPEN", reportId: "RPT009", createdAt: "2025-01-10 14:32",
    citizen: { name: "Bùi Thanh Tùng", phone: "0912000001", reportPhoto: "gradient-blue" },
    collector: { name: "Trần Văn Hùng", team: "Team 1 / Khu A", collectPhoto: "gradient-green" },
    citizenClaim: "Collector không đến thu gom nhưng vẫn bấm COLLECTED. Rác vẫn còn đây.",
    reportAddress: "66 Đinh Tiên Hoàng, Phường 13, Bình Thạnh",
    wasteType: "RECYCLABLE", collectedAt: "2025-01-09 22:51", priority: "HIGH",
    timeline: [
      { time: "2025-01-09 16:15", event: "Citizen tạo báo cáo", actor: "Bùi Thanh Tùng" },
      { time: "2025-01-09 20:30", event: "RE chấp nhận, xếp hàng", actor: "System" },
      { time: "2025-01-09 22:18", event: "Collector bắt đầu di chuyển", actor: "Trần Văn Hùng" },
      { time: "2025-01-09 22:51", event: "Collector bấm COLLECTED", actor: "Trần Văn Hùng" },
      { time: "2025-01-10 14:32", event: "Citizen mở khiếu nại", actor: "Bùi Thanh Tùng" },
    ],
  },
  {
    id: "DSP002", status: "OPEN", reportId: "RPT015", createdAt: "2025-01-10 09:18",
    citizen: { name: "Vũ Trọng Bình", phone: "0912000002", reportPhoto: "gradient-amber" },
    collector: { name: "Nguyễn Văn Khoa", team: "Team 2 / Khu B", collectPhoto: "gradient-teal" },
    citizenClaim: "Ảnh thu gom nhìn như ảnh cũ, không phải hôm qua.",
    reportAddress: "22 Hoàng Hoa Thám, Phường 13, Bình Thạnh",
    wasteType: "HAZARDOUS", collectedAt: "2025-01-09 23:05", priority: "MEDIUM",
    timeline: [
      { time: "2025-01-09 11:00", event: "Citizen tạo báo cáo", actor: "Vũ Trọng Bình" },
      { time: "2025-01-09 22:40", event: "Collector thu gom", actor: "Nguyễn Văn Khoa" },
      { time: "2025-01-10 09:18", event: "Citizen mở khiếu nại", actor: "Vũ Trọng Bình" },
    ],
  },
  {
    id: "DSP003", status: "RESOLVED_REFUNDED", reportId: "RPT003", createdAt: "2025-01-09 16:44",
    citizen: { name: "Lê Thu Hương", phone: "0912000003", reportPhoto: "gradient-red" },
    collector: { name: "Phạm Thanh Bình", team: "Team 1 / Khu C", collectPhoto: "gradient-gray" },
    citizenClaim: "Thu gom không đúng giờ, gây phiền nhiễu hàng xóm.",
    verdict: "REFUNDED", resolvedAt: "2025-01-09 20:10", resolvedBy: "Admin",
    resolvedReason: "Citizen có bằng chứng rõ ràng. Hoàn điểm và ghi nhận penalty cho Enterprise.",
    reportAddress: "7 Xô Viết Nghệ Tĩnh, Phường 13, Bình Thạnh",
    wasteType: "HAZARDOUS", collectedAt: "2025-01-09 06:15", priority: "LOW",
    timeline: [
      { time: "2025-01-09 06:15", event: "Collector thu gom", actor: "Phạm Thanh Bình" },
      { time: "2025-01-09 16:44", event: "Citizen mở khiếu nại", actor: "Lê Thu Hương" },
      { time: "2025-01-09 20:10", event: "Admin chứng nhận + hoàn điểm", actor: "Admin" },
    ],
  },
  {
    id: "DSP004", status: "RESOLVED_REJECTED", reportId: "RPT007", createdAt: "2025-01-08 11:30",
    citizen: { name: "Huỳnh Thị Nga", phone: "0912000004", reportPhoto: "gradient-purple" },
    collector: { name: "Trần Văn Hùng", team: "Team 1 / Khu A", collectPhoto: "gradient-green" },
    citizenClaim: "Collector thái độ không tốt khi đến thu gom.",
    verdict: "REJECTED", resolvedAt: "2025-01-08 15:20", resolvedBy: "Admin",
    resolvedReason: "Không có bằng chứng cụ thể. Khiếu nại bị bác bỏ. Trust score citizen bị trừ.",
    reportAddress: "56 Nguyễn Xí, Phường 13, Bình Thạnh",
    wasteType: "RECYCLABLE", collectedAt: "2025-01-08 22:33", priority: "LOW",
    timeline: [
      { time: "2025-01-08 22:33", event: "Collector thu gom", actor: "Trần Văn Hùng" },
      { time: "2025-01-08 11:30", event: "Citizen mở khiếu nại", actor: "Huỳnh Thị Nga" },
      { time: "2025-01-08 15:20", event: "Admin bác bỏ khiếu nại", actor: "Admin" },
    ],
  },
  {
    id: "DSP005", status: "OPEN", reportId: "RPT002", createdAt: "2025-01-10 17:01",
    citizen: { name: "Trần Minh Khoa", phone: "0912000005", reportPhoto: "gradient-orange" },
    collector: { name: "Lê Văn Dũng", team: "Team 2 / Khu B", collectPhoto: "gradient-blue" },
    citizenClaim: "Chỉ lấy một phần rác, còn lại bỏ lại không nói gì.",
    reportAddress: "45 Đinh Bộ Lĩnh, Phường 14, Bình Thạnh",
    wasteType: "ORGANIC", collectedAt: "2025-01-09 22:44", priority: "HIGH",
    timeline: [
      { time: "2025-01-09 20:31", event: "Citizen tạo báo cáo", actor: "Trần Minh Khoa" },
      { time: "2025-01-09 22:44", event: "Collector thu gom", actor: "Lê Văn Dũng" },
      { time: "2025-01-10 17:01", event: "Citizen mở khiếu nại", actor: "Trần Minh Khoa" },
    ],
  },
];
