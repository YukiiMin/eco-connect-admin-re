import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Building2,
  Users,
  ChevronRight,
  ArrowLeft,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useREStore } from "@/store/useREStore";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

/**
 * DispatchPage — Tracking view (drill-down).
 *
 *   Cấp 1: Tổng quan Enterprise → grid các Hub với progress hôm nay
 *   Cấp 2: Click Hub → grid Teams trong hub với progress
 *   Click Team → điều hướng sang /re/teams/:teamId
 *
 * Bỏ tính năng batch/route (theo yêu cầu user — phát triển sau).
 */
const DispatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { hubs, teams, requests, staff } = useREStore();
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);

  const selectedHub = hubs.find((h) => h.id === selectedHubId);
  const hubTeams = useMemo(
    () => (selectedHubId ? teams.filter((t) => t.hubId === selectedHubId) : []),
    [teams, selectedHubId],
  );

  const enterpriseTotals = useMemo(() => {
    const total = hubs.reduce((sum, h) => sum + h.totalReportsToday, 0);
    const completed = hubs.reduce((sum, h) => sum + h.completedToday, 0);
    const failed = hubs.reduce((sum, h) => sum + h.failedToday, 0);
    const inProgress = hubs.reduce((sum, h) => sum + h.inProgressToday, 0);
    return { total, completed, failed, inProgress };
  }, [hubs]);

  return (
    <div className="space-y-5 max-w-full">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Tracking tiến độ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedHub ? "Tiến độ các Đội trong cơ sở" : "Tổng quan tiến độ các Cơ sở thu gôm hôm nay"}
          </p>
        </div>
        {selectedHub && (
          <Button variant="outline" size="sm" onClick={() => setSelectedHubId(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Về danh sách Cơ sở
          </Button>
        )}
      </div>

      {/* Enterprise totals — always visible at top */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="Tổng báo cáo hôm nay"
          value={enterpriseTotals.total}
          icon={Truck}
          tone="primary"
        />
        <KpiTile
          label="Đã hoàn thành"
          value={enterpriseTotals.completed}
          icon={CheckCircle2}
          tone="success"
        />
        <KpiTile
          label="Đang xử lý"
          value={enterpriseTotals.inProgress}
          icon={Clock}
          tone="info"
        />
        <KpiTile
          label="Thất bại"
          value={enterpriseTotals.failed}
          icon={XCircle}
          tone="danger"
        />
      </div>

      <AnimatePresence mode="wait">
        {!selectedHub ? (
          /* ===== Hub list ===== */
          <motion.div
            key="hubs"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {hubs.map((hub, i) => {
              const progress =
                hub.totalReportsToday > 0 ? (hub.completedToday / hub.totalReportsToday) * 100 : 0;
              const hubTeamCount = teams.filter((t) => t.hubId === hub.id).length;
              const hubStaffCount = staff.filter((s) => s.hubId === hub.id).length;
              const inProgressTone = progress >= 80 ? "success" : progress >= 50 ? "primary" : "pending";
              return (
                <motion.div
                  key={hub.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 280, damping: 26 }}
                  whileHover={{ y: -3 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200 h-full"
                    onClick={() => setSelectedHubId(hub.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-heading">{hub.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{hub.serviceArea}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Tiến độ hôm nay</span>
                          <span className="font-mono font-medium">
                            {hub.completedToday}/{hub.totalReportsToday}
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className={cn(
                            "h-2",
                            inProgressTone === "success" && "[&>div]:bg-status-collected",
                            inProgressTone === "pending" && "[&>div]:bg-status-pending",
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <MiniStat label="Hoàn thành" value={hub.completedToday} tone="success" />
                        <MiniStat label="Đang đi" value={hub.inProgressToday} tone="info" />
                        <MiniStat label="Thất bại" value={hub.failedToday} tone="danger" />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {hubStaffCount} nhân sự
                        </span>
                        <span>{hubTeamCount} đội</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ===== Team list inside hub ===== */
          <motion.div
            key={`hub-${selectedHubId}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Cơ sở đang xem</p>
                  <h2 className="text-lg font-heading font-bold mt-0.5">{selectedHub.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedHub.address}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Quản lý: {selectedHub.manager}
                  </Badge>
                  <Badge className="text-xs bg-status-collected/15 text-status-collected border-0">
                    {selectedHub.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {hubTeams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có đội nào trong cơ sở này</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {hubTeams.map((team, i) => {
                  const progress =
                    team.todayAssigned > 0 ? (team.todayCompleted / team.todayAssigned) * 100 : 0;
                  const teamStaff = staff.filter((s) => s.teamId === team.id);
                  const reportsForTeam = requests.filter((r) => r.assignedTo === team.name);
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 280, damping: 26 }}
                      whileHover={{ y: -3 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200 h-full"
                        onClick={() => navigate(`/re/teams/${team.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center",
                                  team.status === "ACTIVE"
                                    ? "bg-status-collected/10 text-status-collected"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <Users className="w-5 h-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-heading">{team.name}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">{team.zone}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-muted-foreground">Tiến độ hôm nay</span>
                              <span className="font-mono font-medium">
                                {team.todayCompleted}/{team.todayAssigned}
                              </span>
                            </div>
                            <Progress
                              value={progress}
                              className={cn(
                                "h-2",
                                progress >= 80 && "[&>div]:bg-status-collected",
                                progress < 50 && team.todayAssigned > 0 && "[&>div]:bg-status-pending",
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <MiniStat label="Đã giao" value={team.todayAssigned} tone="info" />
                            <MiniStat label="Xong" value={team.todayCompleted} tone="success" />
                            <MiniStat label="Lỗi" value={team.todayFailed} tone="danger" />
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                              Nhân sự ({teamStaff.length})
                            </p>
                            <div className="flex -space-x-2">
                              {teamStaff.slice(0, 5).map((s) => (
                                <div
                                  key={s.id}
                                  title={s.name}
                                  className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary"
                                >
                                  {s.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(-2)}
                                </div>
                              ))}
                              {teamStaff.length > 5 && (
                                <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium">
                                  +{teamStaff.length - 5}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" /> Tháng này
                            </span>
                            <span className="font-mono font-medium">{team.monthCompleted} đơn</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Truck className="w-3.5 h-3.5" />
                            <span className="font-mono">{team.vehiclePlate}</span>
                            <span className="ml-auto">{reportsForTeam.length} đang xử lý</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============= Sub components ============= */

const KpiTile: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  tone: "primary" | "success" | "info" | "danger";
}> = ({ label, value, icon: Icon, tone }) => {
  const toneClasses = {
    primary: "border-l-primary text-primary",
    success: "border-l-status-collected text-status-collected",
    info: "border-l-status-on-the-way text-status-on-the-way",
    danger: "border-l-destructive text-destructive",
  }[tone];
  return (
    <Card className={cn("border-l-4", toneClasses)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-heading font-bold font-mono mt-1">{value}</p>
          </div>
          <Icon className={cn("w-5 h-5 opacity-60", toneClasses.split(" ")[1])} />
        </div>
      </CardContent>
    </Card>
  );
};

const MiniStat: React.FC<{ label: string; value: number; tone: "success" | "info" | "danger" }> = ({
  label,
  value,
  tone,
}) => {
  const toneClass = {
    success: "text-status-collected",
    info: "text-status-on-the-way",
    danger: "text-destructive",
  }[tone];
  return (
    <div className="text-center p-2 rounded-md bg-muted/40">
      <p className={cn("text-base font-heading font-bold font-mono", toneClass)}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
};

export default DispatchPage;
