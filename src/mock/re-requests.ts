/** Request type for RE queue/dispatch */
export interface CollectionRequest {
  id: string;
  status: "PENDING" | "ACCEPTED" | "QUEUED" | "QUEUED_FOR_DISPATCH" | "ASSIGNED" | "ON_THE_WAY" | "COLLECTED" | "VERIFIED" | "REJECTED" | "FAILED" | "REJECTED_BY_COLLECTOR" | "DISPUTED" | "CANCELLED";
  citizenName: string;
  address: string;
  area: string;
  wasteType: "RECYCLABLE" | "ORGANIC" | "HAZARDOUS" | "MIXED";
  wasteUnit?: "Túi nhỏ" | "Bao tải" | "Cồng kềnh";
  reportedAt: string;
  weight: string;
  photo: boolean;
  priority: "NORMAL" | "HIGH";
  assignedTo?: string;
  startedAt?: string;
  collectedAt?: string;
  verifiedAt?: string;
  rejectedReason?: string;
  collectorNote?: string;
}

/** Mock requests */
export const requests: CollectionRequest[] = [
  { id: "RPT001", status: "PENDING", citizenName: "Nguyễn Thị Lan", address: "23 Nơ Trang Long", area: "Khu A", wasteType: "RECYCLABLE", wasteUnit: "Túi nhỏ", reportedAt: "20:14", weight: "~3kg", photo: true, priority: "NORMAL" },
  { id: "RPT002", status: "PENDING", citizenName: "Trần Minh Khoa", address: "45 Đinh Bộ Lĩnh", area: "Khu B", wasteType: "ORGANIC", wasteUnit: "Bao tải", reportedAt: "20:31", weight: "~5kg", photo: true, priority: "NORMAL" },
  { id: "RPT003", status: "PENDING", citizenName: "Lê Thu Hương", address: "7 Xô Viết Nghệ Tĩnh", area: "Khu C", wasteType: "HAZARDOUS", wasteUnit: "Túi nhỏ", reportedAt: "19:55", weight: "~1kg", photo: true, priority: "HIGH" },
  { id: "RPT004", status: "ACCEPTED", citizenName: "Phạm Văn Tú", address: "12 Lê Quang Định", area: "Khu A", wasteType: "RECYCLABLE", wasteUnit: "Túi nhỏ", reportedAt: "19:10", weight: "~4kg", photo: true, priority: "NORMAL" },
  { id: "RPT005", status: "ACCEPTED", citizenName: "Võ Thị Bích", address: "88 Bạch Đằng", area: "Khu B", wasteType: "MIXED", wasteUnit: "Bao tải", reportedAt: "18:45", weight: "~6kg", photo: true, priority: "NORMAL" },
  { id: "RPT006", status: "QUEUED_FOR_DISPATCH", citizenName: "Đặng Hoài Nam", address: "34 Phan Văn Trị", area: "Khu A", wasteType: "ORGANIC", wasteUnit: "Túi nhỏ", reportedAt: "17:20", weight: "~4kg", photo: true, priority: "NORMAL" },
  { id: "RPT007", status: "QUEUED_FOR_DISPATCH", citizenName: "Huỳnh Thị Nga", address: "56 Nguyễn Xí", area: "Khu B", wasteType: "RECYCLABLE", wasteUnit: "Túi nhỏ", reportedAt: "17:05", weight: "~2kg", photo: true, priority: "NORMAL" },
  { id: "RPT008", status: "ON_THE_WAY", citizenName: "Lý Minh Châu", address: "19 Ung Văn Khiêm", area: "Khu A", wasteType: "HAZARDOUS", wasteUnit: "Túi nhỏ", reportedAt: "16:30", weight: "~1kg", photo: true, priority: "HIGH", assignedTo: "Trần Văn Hùng", startedAt: "22:10" },
  { id: "RPT009", status: "ON_THE_WAY", citizenName: "Bùi Thanh Tùng", address: "66 Đinh Tiên Hoàng", area: "Khu C", wasteType: "RECYCLABLE", wasteUnit: "Bao tải", reportedAt: "16:15", weight: "~3kg", photo: true, priority: "NORMAL", assignedTo: "Lê Văn Dũng", startedAt: "22:18" },
  { id: "RPT010", status: "COLLECTED", citizenName: "Cao Thị Mai", address: "101 Bình Lợi", area: "Khu B", wasteType: "ORGANIC", wasteUnit: "Túi nhỏ", reportedAt: "15:50", weight: "~5kg", photo: true, priority: "NORMAL", assignedTo: "Phạm Thanh Bình", collectedAt: "22:35" },
  { id: "RPT011", status: "COLLECTED", citizenName: "Hoàng Văn Phúc", address: "29 Ngô Tất Tố", area: "Khu C", wasteType: "MIXED", wasteUnit: "Cồng kềnh", reportedAt: "15:40", weight: "~7kg", photo: true, priority: "NORMAL", assignedTo: "Lê Văn Dũng", collectedAt: "22:41" },
  { id: "RPT012", status: "VERIFIED", citizenName: "Phan Thị Oanh", address: "55 Lê Văn Duyệt", area: "Khu A", wasteType: "RECYCLABLE", wasteUnit: "Túi nhỏ", reportedAt: "14:10", weight: "~3kg", photo: true, priority: "NORMAL", assignedTo: "Trần Văn Hùng", verifiedAt: "23:02" },
  { id: "RPT013", status: "VERIFIED", citizenName: "Phan Minh Nhật", address: "77 Bùi Đình Túy", area: "Khu A", wasteType: "ORGANIC", wasteUnit: "Túi nhỏ", reportedAt: "13:55", weight: "~4kg", photo: true, priority: "NORMAL", assignedTo: "Trần Văn Hùng", verifiedAt: "22:55" },
  { id: "RPT014", status: "REJECTED", citizenName: "Trịnh Văn Long", address: "33 Phan Đình Phùng", area: "Khu B", wasteType: "MIXED", wasteUnit: "Túi nhỏ", reportedAt: "12:30", weight: "~2kg", photo: true, priority: "NORMAL", rejectedReason: "Ảnh không rõ ràng, không xác định được loại rác" },
  { id: "RPT015", status: "FAILED", citizenName: "Ngô Văn Sơn", address: "88 Lê Quang Định", area: "Khu A", wasteType: "ORGANIC", wasteUnit: "Bao tải", reportedAt: "11:00", weight: "~3kg", photo: true, priority: "NORMAL", assignedTo: "Trần Văn Hùng", collectorNote: "Không tìm thấy rác tại địa chỉ, đã chụp ảnh minh chứng." },
  { id: "RPT016", status: "REJECTED_BY_COLLECTOR", citizenName: "Lê Thị Hạnh", address: "22 Nguyễn Cửu Vân", area: "Khu C", wasteType: "HAZARDOUS", wasteUnit: "Túi nhỏ", reportedAt: "10:30", weight: "~2kg", photo: true, priority: "HIGH", assignedTo: "Lê Văn Dũng", collectorNote: "Phân loại sai — không phải rác nguy hại." },
];
