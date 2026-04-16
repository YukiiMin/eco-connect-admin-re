import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Bell, Download, Copy, Smartphone, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";

/**
 * SettingsPage — admin settings with profile, theme, notifications, PWA, and system info.
 */
const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const copyLink = () => {
    navigator.clipboard.writeText("ecoconnect.app/admin");
    toast({ title: "Đã sao chép", description: "Link đã được sao chép vào clipboard." });
  };

  const exportCSV = () => {
    const csv = "id,name,reports,rate\nRE001,Xanh Môi Trường,312,97.1\nRE002,EcoViet,289,94.8\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecoconnect-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Đã xuất báo cáo", description: "File CSV đã được tải xuống." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-heading font-bold text-foreground">Cài đặt</h1>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
              NQ
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground">Nguyễn Quản Trị</h3>
              <p className="text-sm text-muted-foreground">admin@ecoconnect.vn</p>
            </div>
            <Badge className="text-xs"><Shield className="w-3 h-3 mr-1" />Platform Admin</Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Giao diện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-sm">Chế độ tối</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Bell className="w-4 h-4" /> Thông báo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Tranh chấp mới", "RE chờ phê duyệt", "Cảnh báo hiệu suất", "Báo cáo tổng hợp"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PWA Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Cài đặt ứng dụng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted">
              <div className="grid grid-cols-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${[0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i) ? "bg-foreground" : "bg-transparent"}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-foreground font-mono">ecoconnect.app/admin</p>
              <p className="text-xs text-muted-foreground">Quét mã QR hoặc sao chép link để cài đặt ứng dụng trên thiết bị di động.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyLink} className="h-8 text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Sao chép link
                </Button>
                <Button size="sm" className="h-8 text-xs">
                  <Download className="w-3 h-3 mr-1" /> Cài đặt
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between"><span>Phiên bản</span><span className="text-foreground font-mono">EcoConnect v1.0.0-mvp</span></div>
          <div className="flex justify-between"><span>Triển khai cuối</span><span className="text-foreground font-mono">2025-01-10</span></div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading text-destructive">Khu vực nguy hiểm</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={exportCSV} className="h-9 text-sm">
            <Download className="w-4 h-4 mr-2" /> Xuất báo cáo hệ thống (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
