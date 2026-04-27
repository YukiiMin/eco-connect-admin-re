import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UsersRound, Search, Truck, Users, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useREStore } from "@/store/useREStore";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/** TeamsPage — list of all teams across all hubs. */
const TeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { teams, hubs, staff } = useREStore();
  const [search, setSearch] = useState("");
  const [hubFilter, setHubFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    let list = [...teams];
    if (hubFilter !== "ALL") list = list.filter((t) => t.hubId === hubFilter);
    if (statusFilter !== "ALL") list = list.filter((t) => t.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.zone.toLowerCase().includes(q),
      );
    }
    return list;
  }, [teams, hubFilter, statusFilter, search]);

  const getHubName = (hubId: string) => hubs.find((h) => h.id === hubId)?.name ?? "—";

  return (
    <div className="space-y-5 max-w-full">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <UsersRound className="w-6 h-6 text-primary" /> Đội thu gôm
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tất cả đội trong hệ thống — {teams.length} đội
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đội, khu vực..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={hubFilter} onValueChange={setHubFilter}>
          <SelectTrigger className="w-48 h-9 text-xs">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả cơ sở</SelectItem>
            {hubs.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi trạng thái</SelectItem>
            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem value="OFF_DUTY">Nghỉ trực</SelectItem>
            <SelectItem value="INACTIVE">Ngừng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((team, i) => {
          const progress =
            team.todayAssigned > 0 ? (team.todayCompleted / team.todayAssigned) * 100 : 0;
          const teamStaff = staff.filter((s) => s.teamId === team.id);
          const leader = staff.find((s) => s.id === team.leaderId);
          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 280, damping: 26 }}
              whileHover={{ y: -3 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200 h-full"
                onClick={() => navigate(`/re/teams/${team.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center",
                          team.status === "ACTIVE"
                            ? "bg-status-collected/10 text-status-collected"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <UsersRound className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-heading">{team.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{team.zone}</p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px]",
                        team.status === "ACTIVE"
                          ? "bg-status-collected/15 text-status-collected border-0"
                          : team.status === "OFF_DUTY"
                            ? "bg-muted text-muted-foreground border-0"
                            : "bg-destructive/15 text-destructive border-0",
                      )}
                    >
                      {team.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {getHubName(team.hubId)}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Hôm nay</span>
                      <span className="font-mono">
                        {team.todayCompleted}/{team.todayAssigned}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  {leader && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/40">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {leader.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(-2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{leader.name}</p>
                        <p className="text-[10px] text-muted-foreground">Đội trưởng</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {teamStaff.length} người
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span className="font-mono">{team.vehiclePlate}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <UsersRound className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không tìm thấy đội nào</p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
