/** Dispute type */
export interface Dispute {
  id: string;
  status: "OPEN" | "RESOLVED_UPHELD" | "RESOLVED_DISMISSED" | "ESCALATED";
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
}

/** Mock disputes */
export const disputes: Dispute[] = [
  {
    id: "DSP001", status: "OPEN", reportId: "RPT009", createdAt: "2025-01-10 14:32",
    citizen: { name: "Bùi Thanh Tùng", phone: "0912000001", reportPhoto: "gradient-blue" },
    collector: { name: "Trần Văn Hùng", team: "Team 1 / Khu A", collectPhoto: "gradient-green" },
    citizenClaim: "Collector không đến thu gom nhưng vẫn bấm COLLECTED. Rác vẫn còn đây.",
    reportAddress: "66 Đinh Tiên Hoàng, Phường 13, Bình Thạnh",
    wasteType: "RECYCLABLE", collectedAt: "2025-01-09 22:51", priority: "HIGH"
  },
  {
    id: "DSP002", status: "OPEN", reportId: "RPT015", createdAt: "2025-01-10 09:18",
    citizen: { name: "Vũ Trọng Bình", phone: "0912000002", reportPhoto: "gradient-amber" },
    collector: { name: "Nguyễn Văn Khoa", team: "Team 2 / Khu B", collectPhoto: "gradient-teal" },
    citizenClaim: "Ảnh thu gom nhìn như ảnh cũ, không phải hôm qua.",
    reportAddress: "22 Hoàng Hoa Thám, Phường 13, Bình Thạnh",
    wasteType: "HAZARDOUS", collectedAt: "2025-01-09 23:05", priority: "MEDIUM"
  },
  {
    id: "DSP003", status: "RESOLVED_UPHELD", reportId: "RPT003", createdAt: "2025-01-09 16:44",
    citizen: { name: "Lê Thu Hương", phone: "0912000003", reportPhoto: "gradient-red" },
    collector: { name: "Phạm Thanh Bình", team: "Team 1 / Khu C", collectPhoto: "gradient-gray" },
    citizenClaim: "Thu gom không đúng giờ, gây phiền nhiễu hàng xóm.",
    verdict: "UPHELD", resolvedAt: "2025-01-09 20:10", resolvedBy: "Admin",
    reportAddress: "7 Xô Viết Nghệ Tĩnh, Phường 13, Bình Thạnh",
    wasteType: "HAZARDOUS", collectedAt: "2025-01-09 06:15", priority: "LOW"
  },
  {
    id: "DSP004", status: "RESOLVED_DISMISSED", reportId: "RPT007", createdAt: "2025-01-08 11:30",
    citizen: { name: "Huỳnh Thị Nga", phone: "0912000004", reportPhoto: "gradient-purple" },
    collector: { name: "Trần Văn Hùng", team: "Team 1 / Khu A", collectPhoto: "gradient-green" },
    citizenClaim: "Collector thái độ không tốt khi đến thu gom.",
    verdict: "DISMISSED", resolvedAt: "2025-01-08 15:20", resolvedBy: "Admin",
    reportAddress: "56 Nguyễn Xí, Phường 13, Bình Thạnh",
    wasteType: "RECYCLABLE", collectedAt: "2025-01-08 22:33", priority: "LOW"
  },
  {
    id: "DSP005", status: "OPEN", reportId: "RPT002", createdAt: "2025-01-10 17:01",
    citizen: { name: "Trần Minh Khoa", phone: "0912000005", reportPhoto: "gradient-orange" },
    collector: { name: "Lê Văn Dũng", team: "Team 2 / Khu B", collectPhoto: "gradient-blue" },
    citizenClaim: "Chỉ lấy một phần rác, còn lại bỏ lại không nói gì.",
    reportAddress: "45 Đinh Bộ Lĩnh, Phường 14, Bình Thạnh",
    wasteType: "ORGANIC", collectedAt: "2025-01-09 22:44", priority: "HIGH"
  },
];
