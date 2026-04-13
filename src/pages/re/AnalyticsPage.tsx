import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, BarChart3, TrendingUp, Recycle } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCountUp } from "@/hooks/useCountUp";
import {
  volumeByType, volumeByArea, collectionRate, performanceSummary, WASTE_COLORS,
} from "@/mock/re-analytics";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const KPISummary: React.FC<{ label: string; value: number; suffix?: string; index: number }> = ({ label, value, suffix = "", index }) => {
  const animated = useCountUp(value);
  return (
    <motion.div custom={index} variants={cardAnim} initial="hidden" animate="show">
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-heading font-bold tabular-nums">{animated}{suffix}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--card-foreground))",
};

/**
 * AnalyticsPage — charts and reporting for RE manager.
 */
const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState("30");

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const csv = "date,recyclable,organic,hazardous,mixed\n" +
      volumeByType.map((d) => `${d.date},${d.RECYCLABLE},${d.ORGANIC},${d.HAZARDOUS},${d.MIXED}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecoconnect-report-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất file CSV");
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-heading font-bold text-foreground">Báo cáo & Phân tích</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {[{ key: "7", label: "7N" }, { key: "30", label: "30N" }, { key: "90", label: "3T" }].map((r) => (
              <button key={r.key} onClick={() => setDateRange(r.key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  dateRange === r.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1" /> Xuất CSV
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPISummary label="Tổng báo cáo" value={performanceSummary.totalReports} index={0} />
        <KPISummary label="Đã thu gom" value={performanceSummary.totalCollected} index={1} />
        <KPISummary label="Tỷ lệ thu gom" value={Math.round(performanceSummary.collectionRate)} suffix="%" index={2} />
        <KPISummary label="TB xử lý" value={134} suffix=" phút" index={3} />
        <KPISummary label="Khu vực tốt nhất" value={0} index={4} />
        <KPISummary label="Nguy hại xử lý" value={performanceSummary.hazardousHandled} index={5} />
      </div>

      {/* Stacked Area Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Recycle className="w-4 h-4" /> Khối lượng theo loại rác
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="RECYCLABLE" name="Tái chế" stackId="1" fill={WASTE_COLORS.RECYCLABLE} stroke={WASTE_COLORS.RECYCLABLE} fillOpacity={0.6} animationDuration={700} />
                  <Area type="monotone" dataKey="ORGANIC" name="Hữu cơ" stackId="1" fill={WASTE_COLORS.ORGANIC} stroke={WASTE_COLORS.ORGANIC} fillOpacity={0.6} animationDuration={700} />
                  <Area type="monotone" dataKey="HAZARDOUS" name="Nguy hại" stackId="1" fill={WASTE_COLORS.HAZARDOUS} stroke={WASTE_COLORS.HAZARDOUS} fillOpacity={0.6} animationDuration={700} />
                  <Area type="monotone" dataKey="MIXED" name="Hỗn hợp" stackId="1" fill={WASTE_COLORS.MIXED} stroke={WASTE_COLORS.MIXED} fillOpacity={0.6} animationDuration={700} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two columns: Bar + Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Phân bổ theo khu vực
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeByArea}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="area" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="RECYCLABLE" name="Tái chế" fill={WASTE_COLORS.RECYCLABLE} radius={[3, 3, 0, 0]} animationDuration={700} />
                    <Bar dataKey="ORGANIC" name="Hữu cơ" fill={WASTE_COLORS.ORGANIC} radius={[3, 3, 0, 0]} animationDuration={700} />
                    <Bar dataKey="HAZARDOUS" name="Nguy hại" fill={WASTE_COLORS.HAZARDOUS} radius={[3, 3, 0, 0]} animationDuration={700} />
                    <Bar dataKey="MIXED" name="Hỗn hợp" fill={WASTE_COLORS.MIXED} radius={[3, 3, 0, 0]} animationDuration={700} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Tỷ lệ thu gom theo ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={collectionRate}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis domain={[80, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <ReferenceLine y={90} stroke="hsl(0, 84%, 60%)" strokeDasharray="4 4" label={{ value: "Mục tiêu 90%", fill: "hsl(0, 84%, 60%)", fontSize: 10 }} />
                    <Line type="monotone" dataKey="rate" name="Tỷ lệ %" stroke="hsl(153, 73%, 41%)" strokeWidth={2} dot={{ r: 4 }} animationDuration={700} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Phase 2 heatmap placeholder */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-lg">🗺 Heatmap sắp ra mắt</p>
            <p className="text-xs mt-1">Phase 2 — Bản đồ nhiệt phân bổ rác theo khu vực</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
