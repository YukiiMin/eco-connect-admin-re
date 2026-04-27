import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Crown,
  Inbox,
  GripVertical,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useREStore } from "@/store/useREStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CollectorStaff } from "@/mock/re-enterprise";

/**
 * CollectorsPage — Staff pool & drag-drop điều phối staff giữa Teams trong cùng Hub.
 * Cross-hub drag bị chặn (Phase 2).
 */
const CollectorsPage: React.FC = () => {
  const { staff, teams, hubs, moveStaffToTeam, addStaff } = useREStore();
  const [hubId, setHubId] = useState<string>(hubs[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [activeStaff, setActiveStaff] = useState<CollectorStaff | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const hubStaff = useMemo(() => {
    let list = staff.filter((s) => s.hubId === hubId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [staff, hubId, search]);

  const hubTeams = useMemo(() => teams.filter((t) => t.hubId === hubId), [teams, hubId]);
  const poolStaff = hubStaff.filter((s) => s.teamId === null);

  const handleDragStart = (e: DragStartEvent) => {
    const s = staff.find((x) => x.id === e.active.id);
    if (s) setActiveStaff(s);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveStaff(null);
    if (!e.over) return;
    const staffId = e.active.id as string;
    const targetId = e.over.id as string;
    const target = staff.find((s) => s.id === staffId);
    if (!target) return;
    const targetTeamId = targetId === "POOL" ? null : targetId;
    if (target.teamId === targetTeamId) return;

    // Cross-hub guard
    if (targetTeamId) {
      const targetTeam = teams.find((t) => t.id === targetTeamId);
      if (targetTeam && targetTeam.hubId !== target.hubId) {
        toast.warning("Điều phối chéo cơ sở — Phát triển trong tương lai");
        return;
      }
    }

    const ok = moveStaffToTeam(staffId, targetTeamId);
    if (ok) {
      const name = targetTeamId
        ? teams.find((t) => t.id === targetTeamId)?.name
        : "Pool nhân sự";
      toast.success(`Đã chuyển ${target.name} → ${name}`);
    }
  };

  const handleAddStaff = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    addStaff(hubId, { name: newName, phone: newPhone });
    toast.success("Đã thêm nhân sự");
    setShowAdd(false);
    setNewName("");
    setNewPhone("");
  };

  const currentHub = hubs.find((h) => h.id === hubId);

  return (
    <div className="space-y-5 max-w-full">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Nhân sự thu gôm
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kéo thả nhân sự giữa các đội trong cùng cơ sở để điều phối
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <UserPlus className="w-4 h-4 mr-1" /> Thêm nhân sự
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={hubId} onValueChange={setHubId}>
          <SelectTrigger className="w-72 h-9 text-sm">
            <Building2 className="w-4 h-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hubs.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name} ({staff.filter((s) => s.hubId === h.id).length} người)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3 text-xs flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-primary" />
          <span>
            <strong>Mẹo:</strong> Kéo thẻ nhân sự sang cột Đội khác để chuyển. Kéo về <em>Pool nhân sự</em> để
            tách khỏi đội. Điều phối chéo cơ sở sẽ phát triển sau.
          </span>
        </CardContent>
      </Card>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <DroppableTeam
            id="POOL"
            title="Pool nhân sự"
            subtitle={`${poolStaff.length} chưa thuộc đội`}
            members={poolStaff}
            isPool
          />
          {hubTeams.map((team) => {
            const members = hubStaff.filter((s) => s.teamId === team.id);
            return (
              <DroppableTeam
                key={team.id}
                id={team.id}
                title={team.name}
                subtitle={team.zone}
                members={members}
                leaderId={team.leaderId}
                hubName={currentHub?.name}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeStaff && (
            <div className="opacity-90 rotate-2">
              <StaffCard staff={activeStaff} dragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm nhân sự mới</DialogTitle>
            <DialogDescription>
              Thêm vào <strong>{currentHub?.name}</strong>. Nhân sự sẽ vào Pool, kéo thả để gán vào đội.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Họ tên *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Số điện thoại *</Label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="mt-1 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddStaff} disabled={!newName.trim() || !newPhone.trim()}>
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ============= DnD Subcomponents ============= */

const DroppableTeam: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  members: CollectorStaff[];
  leaderId?: string;
  isPool?: boolean;
  hubName?: string;
}> = ({ id, title, subtitle, members, leaderId, isPool, hubName }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200 min-h-[280px]",
        isOver && "ring-2 ring-primary border-primary scale-[1.01]",
        isPool && "border-dashed",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              {isPool ? (
                <Inbox className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Users className="w-4 h-4 text-primary" />
              )}
              {title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            {hubName && !isPool && (
              <Badge variant="outline" className="text-[9px] mt-1">
                {hubName}
              </Badge>
            )}
          </div>
          <Badge className="text-[10px] bg-primary/15 text-primary border-0">{members.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {members.map((m) => (
          <DraggableStaff key={m.id} staff={m} isLeader={m.id === leaderId} />
        ))}
        {members.length === 0 && (
          <div className="text-center py-6 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
            {isPool ? "Pool trống" : "Kéo nhân sự vào đây"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DraggableStaff: React.FC<{ staff: CollectorStaff; isLeader?: boolean }> = ({ staff, isLeader }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: staff.id });
  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      layout
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="touch-none"
    >
      <StaffCard staff={staff} isLeader={isLeader} />
    </motion.div>
  );
};

const StaffCard: React.FC<{ staff: CollectorStaff; isLeader?: boolean; dragging?: boolean }> = ({
  staff,
  isLeader,
  dragging,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2.5 rounded-lg border bg-card transition-all cursor-grab active:cursor-grabbing",
        "hover:border-primary/40 hover:shadow-sm",
        dragging && "shadow-lg border-primary",
        isLeader && "border-l-2 border-l-primary",
      )}
    >
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
        {staff.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(-2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium truncate">{staff.name}</p>
          {isLeader && <Crown className="w-3 h-3 text-primary shrink-0" />}
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Phone className="w-2.5 h-2.5" />
          <span className="font-mono">{staff.phone}</span>
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] font-mono">{staff.completedToday}/{staff.todayTasks}</p>
        <p
          className={cn(
            "text-[9px] font-mono",
            staff.onTime >= 90
              ? "text-status-collected"
              : staff.onTime >= 80
                ? "text-status-pending"
                : "text-destructive",
          )}
        >
          {staff.onTime.toFixed(0)}%
        </p>
      </div>
    </div>
  );
};

export default CollectorsPage;
