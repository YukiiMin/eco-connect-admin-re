import React, { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UsersRound,
  ArrowLeft,
  Truck,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Phone,
  Crown,
  UserPlus,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useREStore } from "@/store/useREStore";
import { teamMonthlyStats } from "@/mock/re-enterprise";
import { cn } from "@/lib/utils";
import {
  getStatusClasses,
  getStatusLabel,
  getWasteClasses,
  getWasteLabel,
} from "@/lib/statusConfig";

/** TeamDetailPage — full info, members, current jobs, monthly history. */
const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { teams, hubs, staff, requests } = useREStore();
  const [tab, setTab] = useState<"overview" | "members" | "jobs" | "history">("overview");

  const team = teams.find((t) => t.id === teamId);
  const hub = team ? hubs.find((h) => h.id === team.hubId) : null;
  const members = useMemo(() => (team ? staff.filter((s) => s.teamId === team.id) : []), [staff, team]);
  const leader = team ? staff.find((s) => s.id === team.leaderId) : null;

  const teamReports = useMemo(
    () => (team ? requests.filter((r) => r.assignedTo === team.name) : []),
    [requests, team],
  );
  const activeJobs = teamReports.filter((r) =>
    ["ASSIGNED", "ON_THE_WAY", "COLLECTED"].includes(r.status),
  );
  const completedJobs = teamReports.filter((r) =>
    ["VERIFIED", "FAILED"].includes(r.status),
  );

  if (!team || !hub) {
    return (
      <div className="text-center py-16">
        <UsersRound className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
        <p className="text-sm text-muted-foreground">Không tìm thấy đội</p>
        <Link to="/re/teams" className="text-primary text-sm hover:underline mt-2 inline-block">
          ← Về danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-full">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
      </Button>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary to-primary/40" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center",
                  team.status === "ACTIVE"
                    ? "bg-status-collected/10 text-status-collected"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <UsersRound className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-heading font-bold">{team.name}</h1>
                  <Badge
                    className={cn(
                      "text-[10px]",
                      team.status === "ACTIVE"
                        ? "bg-status-collected/15 text-status-collected border-0"
                        : "bg-muted text-muted-foreground border-0",
                    )}
                  >
                    {team.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{team.zone}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <Link
                    to={`/re/hubs/${hub.id}`}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    🏢 {hub.name}
                  </Link>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span className="font-mono">{team.vehiclePlate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Trực: {team.schedule.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="Hôm nay đã giao" value={team.todayAssigned} tone="primary" />
        <KpiTile label="Đã hoàn thành" value={team.todayCompleted} tone="success" />
        <KpiTile label="Thất bại hôm nay" value={team.todayFailed} tone="danger" />
        <KpiTile label="Tổng tháng này" value={team.monthCompleted} tone="info" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-flex">
          <TabsTrigger value="overview" className="gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Tổng quan
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5">
            <UsersRound className="w-3.5 h-3.5" /> Thành viên ({members.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Đang xử lý ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Hoàn thành theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamMonthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <ReTooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--card-foreground)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="completed" fill="var(--primary)" radius={[6, 6, 0, 0]} animationDuration={700} />
                    <Bar dataKey="failed" fill="var(--destructive)" radius={[6, 6, 0, 0]} animationDuration={700} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Khối lượng (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamMonthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <ReTooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--card-foreground)",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weightKg"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "var(--primary)" }}
                      animationDuration={700}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEMBERS */}
        <TabsContent value="members" className="mt-5 space-y-3">
          {leader && (
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4 flex items-center gap-3">
                <Crown className="w-5 h-5 text-primary" />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {leader.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(-2)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{leader.name}</p>
                    <p className="text-xs text-muted-foreground">Đội trưởng · {leader.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Thành viên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="text-center">Hôm nay</TableHead>
                    <TableHead className="text-right">Đúng giờ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m, i) => (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {m.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(-2)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {m.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.role === "LEADER" ? "default" : "outline"} className="text-[10px]">
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm font-mono">
                        {m.completedToday}/{m.todayTasks}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "text-sm font-medium font-mono",
                            m.onTime >= 90
                              ? "text-status-collected"
                              : m.onTime >= 80
                                ? "text-status-pending"
                                : "text-destructive",
                          )}
                        >
                          {m.onTime.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-[10px]",
                            m.status === "ACTIVE"
                              ? "bg-status-collected/15 text-status-collected border-0"
                              : m.status === "OFF_DUTY"
                                ? "bg-muted text-muted-foreground border-0"
                                : "bg-destructive/15 text-destructive border-0",
                          )}
                        >
                          {m.status}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
              {members.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Đội chưa có thành viên</p>
                  <p className="text-xs mt-1">Đến trang Nhân sự để điều phối nhân sự vào đội này</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTIVE JOBS */}
        <TabsContent value="jobs" className="mt-5">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-20">#</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeJobs.map((r) => (
                    <TableRow key={r.id} className="border-b hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-sm">{r.citizenName}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{r.address}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                            getWasteClasses(r.wasteType),
                          )}
                        >
                          {getWasteLabel(r.wasteType)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                            getStatusClasses(r.status),
                          )}
                        >
                          {getStatusLabel(r.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono">
                        {r.startedAt || r.reportedAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {activeJobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Không có công việc đang xử lý</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY (monthly) */}
        <TabsContent value="history" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Lịch sử theo tháng</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tháng</TableHead>
                    <TableHead className="text-right">Hoàn thành</TableHead>
                    <TableHead className="text-right">Thất bại</TableHead>
                    <TableHead className="text-right">Khối lượng (kg)</TableHead>
                    <TableHead className="text-right">Tái chế</TableHead>
                    <TableHead className="text-right">Hữu cơ</TableHead>
                    <TableHead className="text-right">Nguy hại</TableHead>
                    <TableHead className="text-right">Hỗn hợp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMonthlyStats.map((m, i) => (
                    <motion.tr
                      key={m.month}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b hover:bg-muted/30"
                    >
                      <TableCell className="font-mono text-sm font-medium">{m.month}</TableCell>
                      <TableCell className="text-right font-mono text-status-collected">
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                        {m.completed}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" />
                        {m.failed}
                      </TableCell>
                      <TableCell className="text-right font-mono">{m.weightKg}</TableCell>
                      <TableCell className="text-right font-mono text-waste-recyclable">
                        {m.byType.RECYCLABLE}
                      </TableCell>
                      <TableCell className="text-right font-mono text-waste-organic">
                        {m.byType.ORGANIC}
                      </TableCell>
                      <TableCell className="text-right font-mono text-waste-hazardous">
                        {m.byType.HAZARDOUS}
                      </TableCell>
                      <TableCell className="text-right font-mono text-waste-bulky">
                        {m.byType.MIXED}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {completedJobs.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base font-heading">Công việc đã xong gần đây</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-20">#</TableHead>
                      <TableHead>Citizen</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hoàn thành</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedJobs.map((r) => (
                      <TableRow key={r.id} className="border-b">
                        <TableCell className="font-mono text-xs">{r.id}</TableCell>
                        <TableCell className="text-sm">{r.citizenName}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              getStatusClasses(r.status),
                            )}
                          >
                            {getStatusLabel(r.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground font-mono">
                          {r.verifiedAt || r.collectedAt || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const KpiTile: React.FC<{
  label: string;
  value: number;
  tone: "primary" | "success" | "info" | "danger";
}> = ({ label, value, tone }) => {
  const toneClass = {
    primary: "border-l-primary",
    success: "border-l-status-collected",
    info: "border-l-status-on-the-way",
    danger: "border-l-destructive",
  }[tone];
  return (
    <Card className={cn("border-l-4", toneClass)}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-heading font-bold font-mono mt-1">{value}</p>
      </CardContent>
    </Card>
  );
};

export default TeamDetailPage;
