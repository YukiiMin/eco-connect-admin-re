/** RE Account type */
export interface REAccount {
  id: string;
  name: string;
  ward: string;
  manager: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "WARNING" | "PENDING" | "SUSPENDED" | "REJECTED";
  joinDate: string;
  reports: number;
  collectors: number;
  disputes: number;
  suspendedAt: string | null;
}

/** Mock RE accounts */
export const reAccounts: REAccount[] = [
  { id: "RE001", name: "Xanh Môi Trường Co.", ward: "Phường 13, Bình Thạnh", manager: "Lê Văn Minh", phone: "0901234567", email: "leminh@xanhmt.vn", status: "ACTIVE", joinDate: "2024-03-15", reports: 312, collectors: 8, disputes: 1, suspendedAt: null },
  { id: "RE002", name: "EcoViet Recycling", ward: "Phường 14, Bình Thạnh", manager: "Nguyễn Thu Hà", phone: "0912345678", email: "thuha@ecoviet.vn", status: "ACTIVE", joinDate: "2024-04-20", reports: 289, collectors: 6, disputes: 2, suspendedAt: null },
  { id: "RE003", name: "Tái Chế Xanh Ltd", ward: "Phường 25, Bình Thạnh", manager: "Trần Quốc Bảo", phone: "0923456789", email: "qbao@taichexanh.vn", status: "ACTIVE", joinDate: "2024-05-10", reports: 264, collectors: 7, disputes: 0, suspendedAt: null },
  { id: "RE004", name: "GreenLoop Vietnam", ward: "Phường 26, Bình Thạnh", manager: "Phạm Thị Lan", phone: "0934567890", email: "ptlan@greenloop.vn", status: "ACTIVE", joinDate: "2024-06-01", reports: 198, collectors: 5, disputes: 3, suspendedAt: null },
  { id: "RE005", name: "Môi Trường Sạch JSC", ward: "Phường 27, Bình Thạnh", manager: "Vũ Hoàng Nam", phone: "0945678901", email: "vhnam@mtsach.vn", status: "WARNING", joinDate: "2024-07-15", reports: 145, collectors: 4, disputes: 4, suspendedAt: null },
  { id: "RE006", name: "RecyclePro Bình Thạnh", ward: "Phường 28, Bình Thạnh", manager: "Đặng Minh Tuấn", phone: "0956789012", email: "dmtuan@rpbt.vn", status: "PENDING", joinDate: "2025-01-08", reports: 0, collectors: 0, disputes: 0, suspendedAt: null },
  { id: "RE007", name: "Việt Xanh Services", ward: "Phường 22, Bình Thạnh", manager: "Lý Thị Bích", phone: "0967890123", email: "ltbich@vietxanh.vn", status: "PENDING", joinDate: "2025-01-09", reports: 0, collectors: 0, disputes: 0, suspendedAt: null },
  { id: "RE008", name: "Đô Thị Xanh Co.", ward: "Phường 21, Bình Thạnh", manager: "Hoàng Văn Tú", phone: "0978901234", email: "hvtu@dothi.vn", status: "SUSPENDED", joinDate: "2023-11-01", reports: 87, collectors: 3, disputes: 9, suspendedAt: "2024-12-01" },
];
