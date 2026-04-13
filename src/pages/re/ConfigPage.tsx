import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Bell, Building2, Save, Copy, Download, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { areas, teamSchedule } from "@/mock/re-config";
import { areaLoad } from "@/mock/re-dashboard";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const dayLabels: Record<string, string> = {
  Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7", Sun: "CN",
};
const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * ConfigPage — area config, team schedule, RE info, and PWA sharing.
 */
const ConfigPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [thresholds, setThresholds] = useState<Record<string, number>>(
    Object.fromEntries(areas.map((a) => [a.id, a.threshold]))
  );
  const [collectionTime, setCollectionTime] = useState(teamSchedule.collectionTime);
  const [autoNotify, setAutoNotify] = useState(teamSchedule.overflowAutoNotify);
  const [reName, setReName] = useState("Xanh Môi Trường Co.");
  const [reEmail, setReEmail] = useState("leminh@xanhmt.vn");
  const [rePhone, setRePhone] = useState("0901234567");
  const [hasChanges, setHasChanges] = useState(false);

  const updateThreshold = (id: string, val: number) => {
    setThresholds((prev) => ({ ...prev, [id]: val }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    toast.success("Đã lưu cấu hình");
  };

  const copyLink = () => {
    navigator.clipboard.writeText("ecoconnect.app/re");
    toast.success("Đã sao chép link");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-heading font-bold text-foreground">Cấu hình hệ thống</h1>

      {/* Section 1: Area Config */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Cấu hình Khu vực
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {areas.map((area, i) => {
            const load = areaLoad.find((a) => a.area === area.name);
            const active = load?.active || 0;
            const threshold = thresholds[area.id] || area.threshold;
            const loadPercent = Math.round((active / threshold) * 100);
            return (
              <motion.div key={area.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-heading font-semibold">{area.name}</h3>
                    <p className="text-xs text-muted-foreground">{area.centerAddress}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Hôm nay: {active}/{threshold}</span>
                        <span>{loadPercent}%</span>
                      </div>
                      <Progress value={loadPercent} className={cn("h-2", loadPercent >= 90 && "[&>div]:bg-destructive")} />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Team 1: {area.team1Lead}</p>
                      <p>Team 2: {area.team2Lead}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Threshold:</Label>
                      <Input
                        type="number" value={threshold}
                        onChange={(e) => updateThreshold(area.id, parseInt(e.target.value) || 0)}
                        className="w-20 h-7 text-xs text-center"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Team Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Lịch thu gom
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Weekly grid */}
          <div className="grid grid-cols-7 gap-2">
            {allDays.map((day) => {
              const isTeam1 = teamSchedule.team1Days.includes(day);
              const isTeam2 = teamSchedule.team2Days.includes(day);
              const isSunday = day === "Sun";
              return (
                <div
                  key={day}
                  className={cn(
                    "text-center p-3 rounded-lg border text-sm font-medium transition-colors",
                    isTeam1 && "bg-primary/10 border-primary/30 text-primary",
                    isTeam2 && "bg-accent/30 border-accent/30 text-accent-foreground",
                    isSunday && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  <p className="text-xs">{dayLabels[day]}</p>
                  <p className="text-[10px] mt-1">
                    {isTeam1 ? "Team 1" : isTeam2 ? "Team 2" : "Nghỉ"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Collection time */}
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Giờ thu gom:</span>
            <Input
              value={collectionTime}
              onChange={(e) => { setCollectionTime(e.target.value); setHasChanges(true); }}
              className="w-24 h-8 text-sm text-center font-heading font-bold"
            />
          </div>

          {/* Auto notify toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Tự động thông báo overflow</span>
            </div>
            <Switch checked={autoNotify} onCheckedChange={(v) => { setAutoNotify(v); setHasChanges(true); }} />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: RE Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Thông tin RE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Tên doanh nghiệp</Label>
            <Input value={reName} onChange={(e) => { setReName(e.target.value); setHasChanges(true); }} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={reEmail} onChange={(e) => { setReEmail(e.target.value); setHasChanges(true); }} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Số điện thoại</Label>
              <Input value={rePhone} onChange={(e) => { setRePhone(e.target.value); setHasChanges(true); }} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <motion.div animate={hasChanges ? { scale: [1, 1.02, 1] } : {}} transition={{ repeat: hasChanges ? Infinity : 0, duration: 1.5 }}>
        <Button onClick={handleSave} disabled={!hasChanges} className="w-full h-11">
          <Save className="w-4 h-4 mr-2" /> Lưu tất cả thay đổi
        </Button>
      </motion.div>

      {/* PWA sharing section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Chia sẻ ứng dụng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted shrink-0">
              <div className="grid grid-cols-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${[0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i) ? "bg-foreground" : "bg-transparent"}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-foreground">ecoconnect.app/re</p>
              <p className="text-xs text-muted-foreground">Quét mã QR hoặc chia sẻ link để cài đặt ứng dụng.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyLink} className="h-8 text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Sao chép
                </Button>
                <Button size="sm" className="h-8 text-xs">
                  <Download className="w-3 h-3 mr-1" /> Cài đặt
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigPage;
