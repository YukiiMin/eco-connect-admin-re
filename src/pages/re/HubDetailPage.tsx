import React, { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Users,
  UsersRound,
  Plus,
  ChevronRight,
  TrendingUp,
  Truck,
  Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  CartesianGrid,
} from "recharts";
import { useREStore } from "@/store/useREStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { enterpriseDailyStats } from "@/mock/re-enterprise";

/** HubDetailPage — detail of one collector hub. */
const HubDetailPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const { hubs, teams, staff, createTeam } = useREStore();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamZone, setNewTeamZone] = useState("");
  const [newTeamPlate, setNewTeamPlate] = useState("");

  const hub = hubs.find((h) => h.id === hubId);
  const hubTeams = useMemo(() => teams.filter((t) => t.hubId === hubId), [teams, hubId]);
  const hubStaff = useMemo(() => staff.filter((s) => s.hubId === hubId), [staff, hubId]);

  if (!hub) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
        <p className="text-sm text-muted-foreground">Không tìm thấy cơ sở</p>
        <Link to="/re/hubs" className="text-primary text-sm hover:underline mt-2 inline-block">
          ← Về danh sách
        </Link>
      </div>
    );
  }

  const progress =
    hub.totalReportsToday > 0 ? (hub.completedToday / hub.totalReportsToday) * 100 : 0;

  const handleCreateTeam = () => {
    if (!newTeamName.trim() || !newTeamZone.trim()) return;
    createTeam(hub.id, {
      name: newTeamName,
      zone: newTeamZone,
      vehiclePlate: newTeamPlate || "—",
      schedule: ["Mon", "Wed", "Fri"],
    });
    toast.success(`Đã tạo đội ${newTeamName}`);
    setShowCreateTeam(false);
    setNewTeamName("");
    setNewTeamZone("");
    setNewTeamPlate("");
  };

  return (
    <div className="space-y-5 max-w-full">
      <Button variant="outline" size="sm" onClick={() => navigate("/re/hubs")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Về danh sách Cơ sở
      </Button>

      {/* Header card */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary to-primary/40" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-heading font-bold">{hub.name}</h1>
                  <Badge
                    className={cn(
                      "text-[10px]",
                      hub.status === "ACTIVE"
                        ? "bg-status-collected/15 text-status-collected border-0"
                        : "bg-muted text-muted-foreground border-0",
                    )}
                  >
                    {hub.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {hub.address}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>
                    Quản lý: <span className="font-medium text-foreground">{hub.manager}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span className="font-mono">{hub.managerPhone}</span>
                  </span>
                  <span>
                    Lập từ: <span className="font-mono">{hub.createdAt}</span>
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-1" /> Chỉnh sửa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Báo cáo hôm nay" value={hub.totalReportsToday} tone="primary" />
        <KpiCard label="Hoàn thành" value={hub.completedToday} tone="success" />
        <KpiCard label="Đang xử lý" value={hub.inProgressToday} tone="info" />
        <KpiCard label="Thất bại" value={hub.failedToday} tone="danger" />
      </div>

      {/* Progress bar large */}
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Tiến độ hôm nay</span>
            <span className="text-sm font-mono">
              {hub.completedToday}/{hub.totalReportsToday} ({Math.round(progress)}%)
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* 14-day chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Xu hướng 14 ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enterpriseDailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
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

      {/* Teams in this hub */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold flex items-center gap-2">
          <UsersRound className="w-5 h-5" /> Đội thu gôm ({hubTeams.length})
        </h2>
        <Button size="sm" onClick={() => setShowCreateTeam(true)}>
          <Plus className="w-4 h-4 mr-1" /> Tạo đội mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {hubTeams.map((team, i) => {
          const teamProgress =
            team.todayAssigned > 0 ? (team.todayCompleted / team.todayAssigned) * 100 : 0;
          const memberCount = hubStaff.filter((s) => s.teamId === team.id).length;
          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 280, damping: 26 }}
              whileHover={{ y: -2 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
                onClick={() => navigate(`/re/teams/${team.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading font-semibold text-sm">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{team.zone}</p>
                    </div>
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
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Hôm nay</span>
                      <span className="font-mono">
                        {team.todayCompleted}/{team.todayAssigned}
                      </span>
                    </div>
                    <Progress value={teamProgress} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {memberCount} người
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span className="font-mono">{team.vehiclePlate}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create team dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo đội mới</DialogTitle>
            <DialogDescription>
              Đội sẽ thuộc cơ sở <strong>{hub.name}</strong>. Sau khi tạo, bạn có thể điều phối nhân sự
              vào đội từ trang Nhân sự.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tên đội *</Label>
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Đội Alpha"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Khu vực phụ trách *</Label>
              <Input
                value={newTeamZone}
                onChange={(e) => setNewTeamZone(e.target.value)}
                placeholder="Khu A — Hiệp Bình"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Biển số xe</Label>
              <Input
                value={newTeamPlate}
                onChange={(e) => setNewTeamPlate(e.target.value)}
                placeholder="51C-12345"
                className="mt-1 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateTeam} disabled={!newTeamName.trim() || !newTeamZone.trim()}>
              Tạo đội
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const KpiCard: React.FC<{
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

export default HubDetailPage;
