import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileText, Recycle, AlertTriangle, Building2, AlertCircle, CheckCircle, Info, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCountUp } from "@/hooks/useCountUp";
import {
  systemStats, weeklyTrend, rePerformance, recentAlerts,
  wasteBreakdown, monthlyVolume,
} from "@/mock/admin-stats";
import { cn } from "@/lib/utils";

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

/** Single KPI card */
const KPICard: React.FC<{
  title: string; value: number; suffix?: string; delta?: number; icon: React.ElementType;
  color: string; index: number;
}> = ({ title, value, suffix = "", delta, icon: Icon, color, index }) => {
  const animatedValue = useCountUp(value);
  return (
    <motion.div custom={index} variants={cardAnim} initial="hidden" animate="show">
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-3xl font-heading font-bold tabular-nums">
                {animatedValue}{suffix}
              </p>
              {delta !== undefined && (
                <Badge variant={delta >= 0 ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                  {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}
                </Badge>
              )}
            </div>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const alertTypeConfig = {
  WARNING: { icon: AlertTriangle, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  INFO: { icon: Info, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  DISPUTE: { icon: AlertCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
  SUCCESS: { icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
};

/**
 * DashboardPage — Admin dashboard with KPIs, charts, tables.
 * @returns JSX.Element
 */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Tổng quan hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-1">Giám sát hoạt động toàn nền tảng EcoConnect</p>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Tổng báo cáo" value={systemStats.totalReports} delta={systemStats.reportsTodayDelta} icon={FileText} color="bg-primary" index={0} />
        <KPICard title="Tỷ lệ thu gom" value={systemStats.collectionRate} suffix="%" icon={Recycle} color="bg-green-600" index={1} />
        <KPICard title="Tranh chấp mở" value={systemStats.openDisputes} icon={AlertTriangle} color="bg-destructive" index={2} />
        <KPICard title="RE hoạt động" value={systemStats.activeREs} delta={systemStats.pendingREApprovals} icon={Building2} color="bg-blue-600" index={3} />
      </div>

      {/* Row 2: Weekly trend + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Xu hướng tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="collected" name="Thu gom" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} animationDuration={800} />
                  <Bar dataKey="disputes" name="Tranh chấp" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Cảnh báo gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {recentAlerts.map((alert) => {
              const cfg = alertTypeConfig[alert.type];
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: alert.id * 0.1 }}
                  className={cn("flex items-start gap-3 p-3 rounded-lg", cfg.bg)}
                >
                  <cfg.icon className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{alert.msg}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: RE Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">Hiệu suất RE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên RE</TableHead>
                  <TableHead className="text-right">Báo cáo xử lý</TableHead>
                  <TableHead className="text-right">Tỷ lệ hoàn thành</TableHead>
                  <TableHead className="text-right">Tranh chấp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rePerformance.map((re) => (
                  <TableRow
                    key={re.name}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate("/admin/accounts")}
                  >
                    <TableCell className="font-medium">{re.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{re.reportsHandled}</TableCell>
                    <TableCell className="text-right tabular-nums">{re.rate}%</TableCell>
                    <TableCell className="text-right tabular-nums">{re.disputes}</TableCell>
                    <TableCell>
                      <Badge variant={re.status === "ACTIVE" ? "default" : "destructive"} className="text-[10px]">
                        {re.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waste breakdown donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Phân loại rác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    dataKey="value"
                    nameKey="type"
                    animationDuration={800}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {wasteBreakdown.map((entry) => (
                      <Cell key={entry.type} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly volume line chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Xu hướng 6 tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyVolume}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="reports" name="Báo cáo" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
                  <Line type="monotone" dataKey="collected" name="Thu gom" stroke="hsl(210, 79%, 65%)" strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
