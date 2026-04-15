import React from "react";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, ShieldCheck, Users, AlertTriangle, Info, CheckCircle2, Truck, Timer } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCountUp } from "@/hooks/useCountUp";
import { todayStats, weeklyTrend, areaLoad, qciAlerts } from "@/mock/re-dashboard";
import { cn } from "@/lib/utils";
import { useREStore } from "@/store/useREStore";

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.25, ease: [0, 0, 0.2, 1] as const },
  }),
};

const KPIChip: React.FC<{
  label: string; value: number; icon: React.ElementType; colorClass: string; index: number;
}> = ({ label, value, icon: Icon, colorClass, index }) => {
  const animatedValue = useCountUp(value);
  return (
    <motion.div custom={index} variants={cardAnim} initial="hidden" animate="show">
      <Card className="overflow-hidden border-l-3 border-l-primary hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-3xl font-heading font-bold font-mono">{animatedValue}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const alertIconMap = { WARNING: AlertTriangle, INFO: Info, SUCCESS: CheckCircle2 };
const alertColorMap = {
  WARNING: "text-status-pending bg-status-pending/10",
  INFO: "text-status-accepted bg-status-accepted/10",
  SUCCESS: "text-status-collected bg-status-collected/10",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WeeklyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-card-foreground">{label}</p>
      <p className="text-muted-foreground">Tổng: <span className="text-card-foreground font-medium font-mono">{data?.total}</span></p>
      <p className="text-muted-foreground">Thu gom: <span className="text-primary font-medium font-mono">{data?.collected}</span></p>
      <p className="text-muted-foreground">Từ chối: <span className="text-destructive font-medium font-mono">{data?.rejected}</span></p>
      <p className="text-muted-foreground">TB xử lý: <span className="text-card-foreground font-medium font-mono">{data?.avgMinutes} phút</span></p>
    </div>
  );
};

const REDashboardPage: React.FC = () => {
  const { requests } = useREStore();
  const hour = new Date().getHours();
  const isCollectionTime = hour >= 21;
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric", year: "numeric" });
  const completionPercent = Math.round(((todayStats.collected + todayStats.verified) / todayStats.totalRequests) * 100);

  // Dispatch countdown
  const dispatchHour = 20;
  const hoursToDispatch = dispatchHour - hour;
  const isDispatched = hour >= dispatchHour;

  // Overflow areas
  const overflowAreas = areaLoad.filter((a) => a.active >= a.threshold);

  return (
    <div className="space-y-6 max-w-full">
      {/* Row 1: Live status banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {isCollectionTime ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">🔔 Ca thu gom đang diễn ra — 22:00 hôm nay</p>
                <Badge variant="default" className="text-xs font-mono">{completionPercent}%</Badge>
              </div>
              <Progress value={completionPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">Dự kiến hoàn thành: <span className="font-mono">{todayStats.estimatedCompletion}</span></p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-foreground">
                📅 Hôm nay {today} — Ca thu gom bắt đầu lúc <span className="font-heading font-bold text-primary">22:00</span>
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Row 1.5: Overflow + Dispatch widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Overflow Alert Widget */}
        <Card className={cn(overflowAreas.length > 0 && "border-destructive/30")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={cn("w-4 h-4", overflowAreas.length > 0 ? "text-destructive" : "text-muted-foreground")} />
              <span className="text-sm font-semibold">Overflow Alert</span>
            </div>
            {overflowAreas.length > 0 ? (
              <div className="space-y-1">
                {overflowAreas.map((a) => (
                  <p key={a.area} className="text-xs text-destructive font-medium">
                    ⚠ {a.area}: {a.active}/{a.threshold} — Vượt ngưỡng
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Tất cả khu vực trong ngưỡng an toàn</p>
            )}
          </CardContent>
        </Card>

        {/* Dispatch Countdown */}
        <Card className={cn(isDispatched ? "border-primary/30 bg-primary/5" : "border-status-pending/30")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Dispatch</span>
            </div>
            {isDispatched ? (
              <p className="text-xs text-primary font-medium">✓ Đã dispatch tối nay lúc 20:00</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Đếm ngược: <span className="font-mono font-bold text-foreground">{hoursToDispatch}h</span> đến 20:00
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: KPI chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPIChip label="Tổng yêu cầu" value={todayStats.totalRequests} icon={FileText} colorClass="bg-primary" index={0} />
        <KPIChip label="Đang chờ" value={todayStats.pending} icon={Clock} colorClass="bg-status-pending" index={1} />
        <KPIChip label="Đã thu gom" value={todayStats.collected} icon={CheckCircle} colorClass="bg-status-collected" index={2} />
        <KPIChip label="Đã xác nhận" value={todayStats.verified} icon={ShieldCheck} colorClass="bg-status-accepted" index={3} />
        <KPIChip label="Collector HĐ" value={todayStats.assigned + todayStats.onTheWay} icon={Users} colorClass="bg-status-assigned" index={4} />
      </div>

      {/* Row 3: Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
        <motion.div className="lg:col-span-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.25 }}>
          <Card className="h-full">
            <CardHeader className="pb-2"><CardTitle className="text-base font-heading">Xu hướng 7 ngày</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <Tooltip content={<WeeklyTooltip />} />
                    <Bar dataKey="collected" name="Thu gom" fill="var(--primary)" radius={[4, 4, 0, 0]} stackId="a" animationDuration={600} />
                    <Bar dataKey="rejected" name="Từ chối" fill="var(--destructive)" radius={[4, 4, 0, 0]} stackId="a" animationDuration={600} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.25 }}>
          <Card className="h-full">
            <CardHeader className="pb-2"><CardTitle className="text-base font-heading">Cảnh báo QCI</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {qciAlerts.map((alert, i) => {
                const Icon = alertIconMap[alert.level];
                const colors = alertColorMap[alert.level];
                return (
                  <motion.div key={alert.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.2 }}
                    className={cn("flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer", colors)}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{alert.msg}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70 font-mono">{alert.time}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{alert.area}</Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Row 4: Area Load cards */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-3">Tải khu vực</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {areaLoad.map((area, i) => {
            const loadPercent = Math.round((area.active / area.threshold) * 100);
            const isOverflow = area.active >= area.threshold;
            const isNearOverflow = loadPercent >= 90;
            return (
              <motion.div key={area.area} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.25 }}
              >
                <Card className={cn("overflow-hidden hover:shadow-md transition-all duration-200", isOverflow && "border-destructive/50")}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold text-foreground">{area.area}</h3>
                      <Badge variant="outline" className="text-[10px]">{area.onDutyTeam}</Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-mono">{area.active}/{area.threshold} túi</span>
                        <span className="font-mono">{loadPercent}%</span>
                      </div>
                      <Progress value={loadPercent} className={cn("h-2", isNearOverflow && "[&>div]:bg-destructive")} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{area.collectors} collector</span>
                    </div>
                    {isOverflow && (
                      <div className="p-2 rounded-md bg-status-pending/10 border border-status-pending/20">
                        <p className="text-xs text-status-pending font-medium">⚠️ Overflow — Team 2 sẽ hỗ trợ</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default REDashboardPage;
