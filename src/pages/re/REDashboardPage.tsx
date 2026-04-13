import React from "react";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, ShieldCheck, Users, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCountUp } from "@/hooks/useCountUp";
import { todayStats, weeklyTrend, areaLoad, qciAlerts } from "@/mock/re-dashboard";
import { cn } from "@/lib/utils";

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

/** KPI chip component */
const KPIChip: React.FC<{
  label: string; value: number; icon: React.ElementType; color: string; index: number;
}> = ({ label, value, icon: Icon, color, index }) => {
  const animatedValue = useCountUp(value);
  return (
    <motion.div custom={index} variants={cardAnim} initial="hidden" animate="show">
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold tabular-nums">{animatedValue}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const alertIconMap = {
  WARNING: AlertTriangle,
  INFO: Info,
  SUCCESS: CheckCircle2,
};

const alertColorMap = {
  WARNING: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
  INFO: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  SUCCESS: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
};

/** Custom tooltip for weekly chart */
const WeeklyTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
  if (!active || !payload) return null;
  const data = payload[0]?.payload as typeof weeklyTrend[0] | undefined;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-card-foreground">{label}</p>
      <p className="text-muted-foreground">Tổng: <span className="text-card-foreground font-medium">{data?.total}</span></p>
      <p className="text-muted-foreground">Thu gom: <span className="text-primary font-medium">{data?.collected}</span></p>
      <p className="text-muted-foreground">Từ chối: <span className="text-destructive font-medium">{data?.rejected}</span></p>
      <p className="text-muted-foreground">TB xử lý: <span className="text-card-foreground font-medium">{data?.avgMinutes} phút</span></p>
    </div>
  );
};

/**
 * REDashboardPage — RE Manager dashboard with live status, KPIs, charts, alerts, area load.
 */
const REDashboardPage: React.FC = () => {
  const hour = new Date().getHours();
  const isCollectionTime = hour >= 21;
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric", year: "numeric" });
  const completionPercent = Math.round(((todayStats.collected + todayStats.verified) / todayStats.totalRequests) * 100);

  return (
    <div className="space-y-6 max-w-full">
      {/* Row 1: Live status banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {isCollectionTime ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">🔔 Ca thu gom đang diễn ra — 22:00 hôm nay</p>
                <Badge variant="default" className="text-xs">{completionPercent}%</Badge>
              </div>
              <Progress value={completionPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">Dự kiến hoàn thành: {todayStats.estimatedCompletion}</p>
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

      {/* Row 2: KPI chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPIChip label="Tổng yêu cầu" value={todayStats.totalRequests} icon={FileText} color="bg-primary" index={0} />
        <KPIChip label="Đang chờ" value={todayStats.pending} icon={Clock} color="bg-yellow-500" index={1} />
        <KPIChip label="Đã thu gom" value={todayStats.collected} icon={CheckCircle} color="bg-green-600" index={2} />
        <KPIChip label="Đã xác nhận" value={todayStats.verified} icon={ShieldCheck} color="bg-blue-600" index={3} />
        <KPIChip label="Collector HĐ" value={todayStats.assigned + todayStats.onTheWay} icon={Users} color="bg-purple-600" index={4} />
      </div>

      {/* Row 3: Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
        {/* Weekly trend chart */}
        <motion.div className="lg:col-span-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Xu hướng 7 ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip content={<WeeklyTooltip />} />
                    <Bar dataKey="collected" name="Thu gom" fill="hsl(153, 73%, 41%)" radius={[4, 4, 0, 0]} stackId="a" animationDuration={600} animationEasing="ease-out" />
                    <Bar dataKey="rejected" name="Từ chối" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} stackId="a" animationDuration={600} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* QCI Alerts */}
        <motion.div className="lg:col-span-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Cảnh báo QCI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {qciAlerts.map((alert, i) => {
                const Icon = alertIconMap[alert.level];
                const colors = alertColorMap[alert.level];
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer",
                      colors,
                      alert.level === "WARNING" && "animate-pulse"
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{alert.msg}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70">{alert.time}</span>
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
              <motion.div
                key={area.area}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
              >
                <Card className={cn("overflow-hidden hover:shadow-md transition-all duration-300", isOverflow && "border-destructive/50")}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold text-foreground">{area.area}</h3>
                      <Badge variant="outline" className="text-[10px]">{area.onDutyTeam}</Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{area.active}/{area.threshold} túi</span>
                        <span>{loadPercent}%</span>
                      </div>
                      <Progress value={loadPercent} className={cn("h-2", isNearOverflow && "[&>div]:bg-destructive")} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{area.collectors} collector</span>
                    </div>
                    {isOverflow && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                      >
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                          ⚠️ Overflow — Team 2 sẽ hỗ trợ
                        </p>
                      </motion.div>
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
