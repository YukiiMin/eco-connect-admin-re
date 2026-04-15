import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, X, List, LayoutGrid, AlertTriangle, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useREStore } from "@/store/useREStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getStatusClasses, getStatusLabel, getWasteClasses, getWasteLabel } from "@/lib/statusConfig";

type FilterTab = "ALL" | "PENDING" | "ACCEPTED" | "QUEUED_FOR_DISPATCH" | "ON_THE_WAY" | "COLLECTED" | "VERIFIED" | "DISPUTED" | "DONE";
type ViewMode = "table" | "card";

/**
 * QueuePage — RE request queue management with full state machine support.
 */
const QueuePage: React.FC = () => {
  const { requests, approveRequest, rejectRequest } = useREStore();
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("time");
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem("eco-queue-view") as ViewMode) || "table"
  );
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  const setView = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("eco-queue-view", mode);
  };

  // Overflow check
  const queuedForDispatch = requests.filter((r) => r.status === "QUEUED_FOR_DISPATCH");
  const overflowByArea = useMemo(() => {
    const counts: Record<string, number> = {};
    queuedForDispatch.forEach((r) => { counts[r.area] = (counts[r.area] || 0) + 1; });
    // threshold 20 per area
    return Object.entries(counts).filter(([, c]) => c >= 20);
  }, [queuedForDispatch]);

  const filtered = useMemo(() => {
    let list = [...requests];
    if (filter === "PENDING") list = list.filter((r) => r.status === "PENDING");
    else if (filter === "ACCEPTED") list = list.filter((r) => r.status === "ACCEPTED");
    else if (filter === "QUEUED_FOR_DISPATCH") list = list.filter((r) => r.status === "QUEUED_FOR_DISPATCH");
    else if (filter === "ON_THE_WAY") list = list.filter((r) => r.status === "ON_THE_WAY");
    else if (filter === "COLLECTED") list = list.filter((r) => r.status === "COLLECTED");
    else if (filter === "VERIFIED") list = list.filter((r) => r.status === "VERIFIED");
    else if (filter === "DISPUTED") list = list.filter((r) => r.status === "DISPUTED");
    else if (filter === "DONE") list = list.filter((r) => ["COLLECTED", "VERIFIED", "REJECTED", "FAILED"].includes(r.status));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.address.toLowerCase().includes(q) || r.citizenName.toLowerCase().includes(q));
    }
    if (sortBy === "waste") list.sort((a, b) => a.wasteType.localeCompare(b.wasteType));
    else if (sortBy === "area") list.sort((a, b) => a.area.localeCompare(b.area));
    else if (sortBy === "priority") list.sort((a, b) => (a.priority === "HIGH" ? -1 : 1));
    else list.sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
    return list;
  }, [requests, filter, search, sortBy]);

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const handleApprove = (id: string) => {
    approveRequest(id);
    toast.success("Đã chấp nhận — chuyển sang ACCEPTED");
  };

  const handleReject = () => {
    if (!rejectTarget || rejectReason.length < 10) return;
    rejectRequest(rejectTarget, rejectReason);
    setRejectTarget(null);
    setRejectReason("");
    toast.error("Đã từ chối báo cáo");
  };

  const statusCount = (s: string) => requests.filter((r) => r.status === s).length;

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "Tất cả", count: requests.length },
    { key: "PENDING", label: "Chờ duyệt", count: pendingCount },
    { key: "ACCEPTED", label: "Đã chấp nhận", count: statusCount("ACCEPTED") },
    { key: "QUEUED_FOR_DISPATCH", label: "Chờ xuất binh", count: statusCount("QUEUED_FOR_DISPATCH") },
    { key: "ON_THE_WAY", label: "Đang đi", count: statusCount("ON_THE_WAY") },
    { key: "COLLECTED", label: "Đã thu gom", count: statusCount("COLLECTED") },
    { key: "VERIFIED", label: "Đã xác nhận", count: statusCount("VERIFIED") },
    { key: "DONE", label: "Hoàn thành", count: requests.filter((r) => ["COLLECTED", "VERIFIED", "REJECTED", "FAILED"].includes(r.status)).length },
  ];

  return (
    <div className="space-y-5 max-w-full">
      <h1 className="text-2xl font-heading font-bold text-foreground">Hàng đợi yêu cầu</h1>

      {/* Overflow banner */}
      {overflowByArea.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">⚠ OVERFLOW — {overflowByArea.map(([a, c]) => `${a}: ${c} đơn`).join(", ")} — Cần thêm team hỗ trợ</span>
        </motion.div>
      )}

      {/* Pending callout */}
      {pendingCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-status-pending/10 border border-status-pending/30 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-status-pending" />
          <span className="text-sm font-medium text-status-pending">{pendingCount} báo cáo chờ duyệt</span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                filter === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >{t.label} <span className="opacity-60">({t.count})</span></button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm địa chỉ, citizen..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Thời gian</SelectItem>
            <SelectItem value="waste">Loại rác</SelectItem>
            <SelectItem value="area">Khu vực</SelectItem>
            <SelectItem value="priority">Ưu tiên</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button variant={viewMode === "table" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setView("table")}><List className="w-4 h-4" /></Button>
          <Button variant={viewMode === "card" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setView("card")}><LayoutGrid className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
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
                    <TableHead>Loại rác</TableHead>
                    <TableHead>Waste Unit</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((r, i) => (
                      <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className={cn("border-b transition-colors duration-150 hover:bg-muted/30 group",
                          r.wasteType === "HAZARDOUS" && "border-l-2 border-l-waste-hazardous"
                        )}
                      >
                        <TableCell className="font-mono text-xs">{r.id}</TableCell>
                        <TableCell className="font-medium text-sm">{r.citizenName}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{r.address}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{r.area}</Badge></TableCell>
                        <TableCell>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getWasteClasses(r.wasteType))}>
                            {getWasteLabel(r.wasteType)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.wasteUnit || "—"}</TableCell>
                        <TableCell>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getStatusClasses(r.status))}>
                            {getStatusLabel(r.status)}
                          </span>
                          {r.status === "FAILED" && r.collectorNote && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertTriangle className="w-3 h-3 text-destructive inline ml-1 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs max-w-[200px]">{r.collectorNote}</p></TooltipContent>
                            </Tooltip>
                          )}
                          {r.status === "REJECTED_BY_COLLECTOR" && r.collectorNote && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertTriangle className="w-3 h-3 text-status-disputed inline ml-1 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs max-w-[200px]">{r.collectorNote}</p></TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{r.reportedAt}</TableCell>
                        <TableCell className="text-right">
                          {r.status === "PENDING" ? (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleApprove(r.id)}>
                                <Check className="w-3 h-3 mr-1" /> Chấp nhận
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setRejectTarget(r.id)}>
                                <X className="w-3 h-3 mr-1" /> Từ chối
                              </Button>
                            </div>
                          ) : r.status === "FAILED" ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setFailedPhoto(r.id)}>
                              <Eye className="w-3 h-3 mr-1" /> Xem ảnh
                            </Button>
                          ) : (
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getStatusClasses(r.status))}>
                              {getStatusLabel(r.status)}
                            </span>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} layout>
                <Card className={cn("overflow-hidden hover:shadow-md transition-all duration-200",
                  r.wasteType === "HAZARDOUS" && "border-l-2 border-l-waste-hazardous"
                )}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{r.address}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.citizenName} · <span className="font-mono">{r.reportedAt}</span></p>
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", getStatusClasses(r.status))}>
                        {getStatusLabel(r.status)}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{r.area}</Badge>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getWasteClasses(r.wasteType))}>
                        {getWasteLabel(r.wasteType)}
                      </span>
                      {r.wasteUnit && <Badge variant="secondary" className="text-[10px]">{r.wasteUnit}</Badge>}
                      {r.priority === "HIGH" && <Badge variant="destructive" className="text-[10px]">Ưu tiên</Badge>}
                    </div>
                    {r.status === "PENDING" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" className="h-8 text-xs flex-1" onClick={() => handleApprove(r.id)}>
                          <Check className="w-3 h-3 mr-1" /> Chấp nhận
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8 text-xs flex-1" onClick={() => setRejectTarget(r.id)}>
                          <X className="w-3 h-3 mr-1" /> Từ chối
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không có yêu cầu nào phù hợp</p>
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => { if (!o) { setRejectTarget(null); setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối báo cáo</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do (tối thiểu 10 ký tự).</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Lý do từ chối..." className="min-h-[80px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Hủy</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectReason.length < 10}>
              Xác nhận ({rejectReason.length}/10)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failed evidence lightbox */}
      <Dialog open={!!failedPhoto} onOpenChange={(o) => !o && setFailedPhoto(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ảnh minh chứng Collector</DialogTitle></DialogHeader>
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

export default QueuePage;
