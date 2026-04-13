import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, UserPlus, Flame, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useREStore } from "@/store/useREStore";
import { useCountUp } from "@/hooks/useCountUp";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Collector } from "@/mock/re-collectors";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  OFF_DUTY: "bg-muted text-muted-foreground",
  INACTIVE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Đang làm",
  OFF_DUTY: "Nghỉ",
  INACTIVE: "Không HĐ",
};

/** Mini stat for detail drawer */
const StatBox: React.FC<{ label: string; value: number; suffix?: string }> = ({ label, value, suffix = "" }) => {
  const animated = useCountUp(value);
  return (
    <div className="text-center p-3 rounded-lg bg-muted">
      <p className="text-xl font-heading font-bold tabular-nums">{animated}{suffix}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
};

/**
 * CollectorsPage — manage collectors with table, detail drawer, add form.
 */
const CollectorsPage: React.FC = () => {
  const { collectors, addCollector } = useREStore();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("ALL");
  const [selected, setSelected] = useState<Collector | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTeam, setNewTeam] = useState("Team 1");
  const [newArea, setNewArea] = useState("Khu A");

  const filtered = useMemo(() => {
    let list = [...collectors];
    if (filterTeam !== "ALL") {
      if (filterTeam.startsWith("Team")) list = list.filter((c) => c.team === filterTeam);
      else list = list.filter((c) => c.area === filterTeam);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [collectors, filterTeam, search]);

  const activeCount = collectors.filter((c) => c.status === "ACTIVE").length;
  const offCount = collectors.filter((c) => c.status === "OFF_DUTY").length;
  const inactiveCount = collectors.filter((c) => c.status === "INACTIVE").length;

  // Mock weekly data for detail chart
  const weeklyMock = [
    { day: "T2", tasks: 5 }, { day: "T3", tasks: 4 }, { day: "T4", tasks: 6 },
    { day: "T5", tasks: 3 }, { day: "T6", tasks: 7 }, { day: "T7", tasks: 4 }, { day: "CN", tasks: 2 },
  ];

  const handleAddCollector = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const newId = `C${String(collectors.length + 1).padStart(3, "0")}`;
    addCollector({
      id: newId, name: newName, team: newTeam, area: newArea, phone: newPhone,
      joinDate: new Date().toISOString().slice(0, 10), status: "ACTIVE",
      todayTasks: 0, completedToday: 0, onTime: 100, streak: 0, totalAllTime: 0,
    });
    setShowAdd(false);
    setNewName(""); setNewPhone("");
    toast.success("Đã thêm collector mới");
  };

  // Determine on-duty team (mock: odd day = Team 1, even = Team 2)
  const dayOfWeek = new Date().getDay();
  const onDutyTeam = [1, 3, 5].includes(dayOfWeek) ? "Team 1" : "Team 2";
  const dayName = new Date().toLocaleDateString("vi-VN", { weekday: "long" });

  const DetailDrawerContent = () => {
    if (!selected) return null;
    return (
      <div className="space-y-5 p-1">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
            {selected.name.split(" ").map((n) => n[0]).join("").slice(-2)}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg">{selected.name}</h3>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-[10px]">{selected.team}</Badge>
              <Badge variant="outline" className="text-[10px]">{selected.area}</Badge>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatBox label="Tổng nhiệm vụ" value={selected.totalAllTime} />
          <StatBox label="Đúng giờ" value={Math.round(selected.onTime)} suffix="%" />
          <StatBox label="Streak" value={selected.streak} />
          <StatBox label="Hôm nay" value={selected.completedToday} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">7 ngày gần đây</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyMock}>
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                <Bar dataKey="tasks" fill="hsl(153, 73%, 41%)" radius={[4, 4, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" /> {selected.phone}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-heading font-bold text-foreground">Quản lý Collector</h1>
        <Button onClick={() => setShowAdd(true)} className="h-9 text-sm">
          <Plus className="w-4 h-4 mr-1" /> Thêm Collector
        </Button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{collectors.length} tổng</Badge>
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">{activeCount} đang làm</Badge>
        <Badge variant="secondary">{offCount} nghỉ hôm nay</Badge>
        <Badge variant="destructive">{inactiveCount} không HĐ</Badge>
      </div>

      {/* Team schedule banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-lg bg-primary/5 border border-primary/20"
      >
        <p className="text-sm font-medium text-foreground">
          📅 Hôm nay: {dayName} — <span className="text-primary font-semibold">{onDutyTeam} trực</span> | {onDutyTeam === "Team 1" ? "Team 2" : "Team 1"} nghỉ
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="Team 1">Team 1</SelectItem>
            <SelectItem value="Team 2">Team 2</SelectItem>
            <SelectItem value="Khu A">Khu A</SelectItem>
            <SelectItem value="Khu B">Khu B</SelectItem>
            <SelectItem value="Khu C">Khu C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      {!isMobile ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Khu vực</TableHead>
                    <TableHead className="text-center">Hôm nay</TableHead>
                    <TableHead className="text-right">Đúng giờ</TableHead>
                    <TableHead className="text-center">Streak</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelected(c)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {c.name.split(" ").map((n) => n[0]).join("").slice(-2)}
                            </div>
                            <span className="font-medium text-sm">{c.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{c.team}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{c.area}</Badge></TableCell>
                        <TableCell className="text-center text-sm tabular-nums">{c.completedToday}/{c.todayTasks}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn("text-sm font-medium tabular-nums",
                            c.onTime >= 90 ? "text-green-600 dark:text-green-400" :
                            c.onTime >= 80 ? "text-yellow-600 dark:text-yellow-400" :
                            "text-red-600 dark:text-red-400"
                          )}>{c.onTime}%</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {c.streak >= 5 ? (
                            <span className="flex items-center justify-center gap-0.5 text-sm">
                              <Flame className="w-3.5 h-3.5 text-orange-500" /> {c.streak}
                            </span>
                          ) : (
                            <span className="text-sm tabular-nums">{c.streak}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusColors[c.status])}>
                            {statusLabels[c.status]}
                          </span>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelected(c)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {c.name.split(" ").map((n) => n[0]).join("").slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.team} · {c.area}</p>
                    </div>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusColors[c.status])}>
                      {statusLabels[c.status]}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Hôm nay: {c.completedToday}/{c.todayTasks}</span>
                    <span>Đúng giờ: {c.onTime}%</span>
                    {c.streak >= 5 && <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" />{c.streak}</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side={isMobile ? "bottom" : "right"} className={cn(isMobile && "h-[85vh] rounded-t-2xl", !isMobile && "w-[400px]")}>
          <SheetHeader>
            <SheetTitle>Chi tiết Collector</SheetTitle>
          </SheetHeader>
          <DetailDrawerContent />
        </SheetContent>
      </Sheet>

      {/* Add Collector Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Thêm Collector mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Họ tên *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nguyễn Văn A" className="mt-1" />
            </div>
            <div>
              <Label>Số điện thoại *</Label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="09xxxxxxxx" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Team</Label>
                <Select value={newTeam} onValueChange={setNewTeam}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Team 1">Team 1</SelectItem>
                    <SelectItem value="Team 2">Team 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Khu vực</Label>
                <Select value={newArea} onValueChange={setNewArea}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Khu A">Khu A</SelectItem>
                    <SelectItem value="Khu B">Khu B</SelectItem>
                    <SelectItem value="Khu C">Khu C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Hủy</Button>
            <Button onClick={handleAddCollector} disabled={!newName.trim() || !newPhone.trim()}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectorsPage;
