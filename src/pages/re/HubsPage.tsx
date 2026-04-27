import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, MapPin, Phone, Users, UsersRound, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useREStore } from "@/store/useREStore";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** HubsPage — list all collector hubs under enterprise. */
const HubsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hubs, teams, staff, enterprise } = useREStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return hubs;
    const q = search.toLowerCase();
    return hubs.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.serviceArea.toLowerCase().includes(q) ||
        h.manager.toLowerCase().includes(q),
    );
  }, [hubs, search]);

  return (
    <div className="space-y-5 max-w-full">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Cơ sở thu gôm
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {enterprise.name} — {hubs.length} cơ sở trực thuộc
          </p>
        </div>
        <Button onClick={() => toast.info("Tính năng tạo Cơ sở — yêu cầu Admin duyệt")}>
          <Plus className="w-4 h-4 mr-1" /> Yêu cầu thêm Cơ sở
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, khu vực, quản lý..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((hub, i) => {
          const progress =
            hub.totalReportsToday > 0 ? (hub.completedToday / hub.totalReportsToday) * 100 : 0;
          const teamCount = teams.filter((t) => t.hubId === hub.id).length;
          const staffCount = staff.filter((s) => s.hubId === hub.id).length;
          return (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 280, damping: 26 }}
              whileHover={{ y: -3 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200 h-full overflow-hidden"
                onClick={() => navigate(`/re/hubs/${hub.id}`)}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/40" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-heading">{hub.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{hub.serviceArea}</p>
                      </div>
                    </div>
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{hub.address}</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Tiến độ hôm nay</span>
                      <span className="font-mono">
                        {hub.completedToday}/{hub.totalReportsToday}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="text-center p-2 rounded-md bg-muted/40">
                      <div className="flex items-center justify-center gap-1 text-primary">
                        <UsersRound className="w-3.5 h-3.5" />
                        <span className="text-base font-heading font-bold font-mono">{teamCount}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">đội</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-muted/40">
                      <div className="flex items-center justify-center gap-1 text-primary">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-base font-heading font-bold font-mono">{staffCount}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">nhân sự</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="font-mono">{hub.managerPhone}</span>
                    </div>
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
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không tìm thấy cơ sở nào</p>
        </div>
      )}
    </div>
  );
};

export default HubsPage;
