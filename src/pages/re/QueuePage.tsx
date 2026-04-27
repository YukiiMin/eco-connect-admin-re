import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Check,
  X,
  AlertTriangle,
  Eye,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronRight,
  ListChecks,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useREStore } from "@/store/useREStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getStatusClasses, getStatusLabel, getWasteClasses, getWasteLabel } from "@/lib/statusConfig";
import type { CollectionRequest } from "@/mock/re-requests";

type TodoKind = "PENDING" | "VERIFY" | "FAILED";

/**
 * Reports page — Enterprise staff workflow.
 *
 * Tab "Việc cần làm" (To-do, default):
 *   - PENDING        → Chấp thuận / Từ chối
 *   - COLLECTED      → Verify (Enterprise xác nhận tính điểm citizen)
 *   - FAILED / REJECTED_BY_COLLECTOR → Xem ảnh, xử lý
 *
 * Tab "Tổng quan" → toàn bộ báo cáo (table với mọi trạng thái).
 */
const QueuePage: React.FC = () => {
  const { requests, approveRequest, rejectRequest, queueReport, completeReport, teams, hubs } = useREStore();
  const [tab, setTab] = useState<"todo" | "overview">("todo");
  const [todoFilter, setTodoFilter] = useState<TodoKind>("PENDING");
  const [search, setSearch] = useState("");
  const [overviewFilter, setOverviewFilter] = useState<string>("ALL");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [verifyTarget, setVerifyTarget] = useState<CollectionRequest | null>(null);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<CollectionRequest | null>(null);
  const [assignTeamId, setAssignTeamId] = useState<string>("");

  const todoCounts = useMemo(
    () => ({
      PENDING: requests.filter((r) => r.status === "PENDING").length,
      VERIFY: requests.filter((r) => r.status === "COLLECTED").length,
      FAILED: requests.filter(
        (r) => r.status === "FAILED" || r.status === "REJECTED_BY_COLLECTOR" || r.status === "DISPUTED",
      ).length,
    }),
    [requests],
  );
  const totalTodo = todoCounts.PENDING + todoCounts.VERIFY + todoCounts.FAILED;

  const todoList = useMemo(() => {
    let list: CollectionRequest[] = [];
    if (todoFilter === "PENDING") list = requests.filter((r) => r.status === "PENDING");
    else if (todoFilter === "VERIFY") list = requests.filter((r) => r.status === "COLLECTED");
    else
      list = requests.filter(
        (r) => r.status === "FAILED" || r.status === "REJECTED_BY_COLLECTOR" || r.status === "DISPUTED",
      );
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.address.toLowerCase().includes(q) || r.citizenName.toLowerCase().includes(q),
      );
    }
    // High priority first
    return list.sort((a, b) => (a.priority === "HIGH" ? -1 : b.priority === "HIGH" ? 1 : 0));
  }, [requests, todoFilter, search]);

  const overviewList = useMemo(() => {
    let list = [...requests];
    if (overviewFilter !== "ALL") list = list.filter((r) => r.status === overviewFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.address.toLowerCase().includes(q) || r.citizenName.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  }, [requests, overviewFilter, search]);

  const handleApprove = (id: string) => {
    approveRequest(id);
    queueReport(id);
    toast.success("Đã chấp thuận — chuyển vào hàng đợi giao team");
  };

  const handleReject = () => {
    if (!rejectTarget || rejectReason.length < 10) return;
    rejectRequest(rejectTarget, rejectReason);
    setRejectTarget(null);
    setRejectReason("");
    toast.error("Đã từ chối báo cáo");
  };

  const handleVerify = () => {
    if (!verifyTarget) return;
    completeReport(verifyTarget.id);
    toast.success(`Đã xác nhận ${verifyTarget.id} — citizen sẽ được tính điểm`);
    setVerifyTarget(null);
  };

  const handleAssign = () => {
    if (!assignTarget || !assignTeamId) return;
    useREStore.getState().assignToTeam(assignTarget.id, assignTeamId);
    const team = teams.find((t) => t.id === assignTeamId);
    toast.success(`Đã giao ${assignTarget.id} cho ${team?.name}`);
    setAssignTarget(null);
    setAssignTeamId("");
  };

  return (
    <div className="space-y-5 max-w-full">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Báo cáo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xử lý việc cần làm trước, sau đó tham khảo tổng quan.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm địa chỉ / citizen..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "todo" | "overview")}>
        <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex">
          <TabsTrigger value="todo" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Việc cần làm
            {totalTodo > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
                {totalTodo}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            Tổng quan
          </TabsTrigger>
        </TabsList>

        {/* ===== TO-DO TAB ===== */}
        <TabsContent value="todo" className="mt-5 space-y-4">
          {/* Sub-filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TodoCard
              active={todoFilter === "PENDING"}
              onClick={() => setTodoFilter("PENDING")}
              icon={Inbox}
              label="Chờ chấp thuận"
              count={todoCounts.PENDING}
              tone="pending"
              hint="Citizen vừa gửi báo cáo"
            />
            <TodoCard
              active={todoFilter === "VERIFY"}
              onClick={() => setTodoFilter("VERIFY")}
              icon={CheckCircle2}
              label="Chờ xác nhận"
              count={todoCounts.VERIFY}
              tone="collected"
              hint="Collector báo đã thu xong"
            />
            <TodoCard
              active={todoFilter === "FAILED"}
              onClick={() => setTodoFilter("FAILED")}
              icon={XCircle}
              label="Cần xử lý"
              count={todoCounts.FAILED}
              tone="failed"
              hint="Thất bại / Tranh chấp"
            />
          </div>

          {todoList.length === 0 ? (
            <EmptyState
              title="Hết việc rồi 🎉"
              hint="Không còn báo cáo nào trong nhóm này — chuyển sang nhóm khác hoặc xem Tổng quan."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {todoList.map((r, i) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 280, damping: 26 }}
                  >
                    <TodoReportCard
                      report={r}
                      kind={todoFilter}
                      onApprove={() => handleApprove(r.id)}
                      onReject={() => setRejectTarget(r.id)}
                      onVerify={() => setVerifyTarget(r)}
                      onViewPhoto={() => setFailedPhoto(r.id)}
                      onAssign={() => setAssignTarget(r)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={overviewFilter} onValueChange={setOverviewFilter}>
              <SelectTrigger className="w-44 h-9 text-xs">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="QUEUED">Hàng đợi giao team</SelectItem>
                <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
                <SelectItem value="ASSIGNED">Đã giao team</SelectItem>
                <SelectItem value="ON_THE_WAY">Đang đi</SelectItem>
                <SelectItem value="COLLECTED">Đã thu gom</SelectItem>
                <SelectItem value="VERIFIED">Đã xác nhận</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{overviewList.length} báo cáo</span>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-20">#</TableHead>
                      <TableHead>Citizen</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Khu vực</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Giao cho</TableHead>
                      <TableHead className="text-right">Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {overviewList.map((r, i) => (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className={cn(
                            "border-b transition-colors duration-150 hover:bg-muted/30",
                            r.wasteType === "HAZARDOUS" && "border-l-2 border-l-waste-hazardous",
                          )}
                        >
                          <TableCell className="font-mono text-xs">{r.id}</TableCell>
                          <TableCell className="font-medium text-sm">{r.citizenName}</TableCell>
                          <TableCell className="text-sm max-w-[220px] truncate">{r.address}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {r.area}
                            </Badge>
                          </TableCell>
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
                          <TableCell className="text-xs text-muted-foreground">{r.assignedTo || "—"}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground font-mono">
                            {r.reportedAt}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
                {overviewList.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">Không có báo cáo nào</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => {
          if (!o) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối báo cáo</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do (tối thiểu 10 ký tự).</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối..."
            className="min-h-[80px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectReason.length < 10}>
              Xác nhận ({rejectReason.length}/10)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify dialog */}
      <Dialog open={!!verifyTarget} onOpenChange={(o) => !o && setVerifyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn thành</DialogTitle>
            <DialogDescription>
              Sau khi xác nhận, citizen <strong>{verifyTarget?.citizenName}</strong> sẽ được tính điểm theo
              ruleset hiện hành.
            </DialogDescription>
          </DialogHeader>
          {verifyTarget && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã báo cáo</span>
                <span className="font-mono">{verifyTarget.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loại rác</span>
                <span>{getWasteLabel(verifyTarget.wasteType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khối lượng</span>
                <span>{verifyTarget.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collector</span>
                <span>{verifyTarget.assignedTo}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyTarget(null)}>
              Hủy
            </Button>
            <Button onClick={handleVerify}>
              <Check className="w-4 h-4 mr-1" /> Xác nhận & Tính điểm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign team dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Giao báo cáo cho team</DialogTitle>
            <DialogDescription>
              Chọn team trong cơ sở phù hợp với khu vực <strong>{assignTarget?.area}</strong>.
            </DialogDescription>
          </DialogHeader>
          <Select value={assignTeamId} onValueChange={setAssignTeamId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn team" />
            </SelectTrigger>
            <SelectContent>
              {hubs.map((hub) => (
                <React.Fragment key={hub.id}>
                  {teams.filter((t) => t.hubId === hub.id && t.status === "ACTIVE").map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {hub.name} → {t.name} ({t.zone})
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>
              Hủy
            </Button>
            <Button onClick={handleAssign} disabled={!assignTeamId}>
              Giao việc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failed photo lightbox */}
      <Dialog open={!!failedPhoto} onOpenChange={(o) => !o && setFailedPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ảnh minh chứng Collector</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Ảnh placeholder — tích hợp storage Phase 2</p>
          </div>
          {failedPhoto && (
            <p className="text-xs text-muted-foreground">
              {requests.find((r) => r.id === failedPhoto)?.collectorNote}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ============= Sub components ============= */

const TodoCard: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
  hint: string;
  tone: "pending" | "collected" | "failed";
}> = ({ active, onClick, icon: Icon, label, count, hint, tone }) => {
  const toneClasses = {
    pending: "border-l-status-pending",
    collected: "border-l-status-collected",
    failed: "border-l-destructive",
  }[tone];
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "text-left p-4 rounded-xl border bg-card border-l-4 transition-all relative overflow-hidden",
        toneClasses,
        active ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <Badge
          className={cn(
            "h-6 px-2 font-mono",
            count > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{hint}</p>
    </motion.button>
  );
};

const TodoReportCard: React.FC<{
  report: CollectionRequest;
  kind: TodoKind;
  onApprove: () => void;
  onReject: () => void;
  onVerify: () => void;
  onViewPhoto: () => void;
  onAssign: () => void;
}> = ({ report: r, kind, onApprove, onReject, onVerify, onViewPhoto, onAssign }) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/40",
        r.priority === "HIGH" && "border-destructive/40",
        r.wasteType === "HAZARDOUS" && "border-l-2 border-l-waste-hazardous",
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] text-muted-foreground">{r.id}</span>
              {r.priority === "HIGH" && (
                <Badge variant="destructive" className="h-4 text-[9px] px-1.5">
                  Ưu tiên
                </Badge>
              )}
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                  getStatusClasses(r.status),
                )}
              >
                {getStatusLabel(r.status)}
              </span>
            </div>
            <p className="font-medium text-sm truncate">{r.address}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {r.citizenName} ·{" "}
              <span className="font-mono">
                <Clock3 className="inline w-3 h-3 mr-0.5" />
                {r.reportedAt}
              </span>
            </p>
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
              getWasteClasses(r.wasteType),
            )}
          >
            {getWasteLabel(r.wasteType)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {r.area}
          </Badge>
          {r.wasteUnit && (
            <Badge variant="secondary" className="text-[10px]">
              {r.wasteUnit}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] font-mono">
            {r.weight}
          </Badge>
          {r.assignedTo && (
            <Badge variant="secondary" className="text-[10px]">
              {r.assignedTo}
            </Badge>
          )}
        </div>

        {(r.collectorNote || r.rejectedReason) && (
          <div className="text-xs p-2 rounded bg-muted/50 text-muted-foreground italic line-clamp-2">
            "{r.collectorNote || r.rejectedReason}"
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {kind === "PENDING" && (
            <>
              <Button size="sm" className="h-8 text-xs flex-1" onClick={onApprove}>
                <Check className="w-3.5 h-3.5 mr-1" /> Chấp thuận
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={onAssign}
              >
                Giao team <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
              <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={onReject}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
          {kind === "VERIFY" && (
            <>
              <Button size="sm" className="h-8 text-xs flex-1" onClick={onVerify}>
                <Check className="w-3.5 h-3.5 mr-1" /> Xác nhận hoàn thành
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onViewPhoto}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xem ảnh minh chứng</TooltipContent>
              </Tooltip>
            </>
          )}
          {kind === "FAILED" && (
            <>
              <Button size="sm" variant="outline" className="h-8 text-xs flex-1" onClick={onViewPhoto}>
                <Eye className="w-3.5 h-3.5 mr-1" /> Xem ảnh & ghi chú
              </Button>
              <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={onReject}>
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Từ chối hẳn
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState: React.FC<{ title: string; hint: string }> = ({ title, hint }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-16 border border-dashed rounded-xl bg-card"
  >
    <CheckCircle2 className="w-12 h-12 mx-auto text-primary/40 mb-3" />
    <p className="text-base font-medium">{title}</p>
    <p className="text-sm text-muted-foreground mt-1">{hint}</p>
  </motion.div>
);

export default QueuePage;
