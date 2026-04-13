import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, X, List, LayoutGrid, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useREStore } from "@/store/useREStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FilterTab = "ALL" | "PENDING" | "QUEUED" | "PROCESSING" | "DONE";
type ViewMode = "table" | "card";

const wasteTypeColors: Record<string, string> = {
  RECYCLABLE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ORGANIC: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  HAZARDOUS: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MIXED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const statusLabels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  QUEUED: "Đã xếp hàng",
  ASSIGNED: "Đã gán",
  ON_THE_WAY: "Đang đi",
  COLLECTED: "Đã thu gom",
  VERIFIED: "Đã xác nhận",
  REJECTED: "Từ chối",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  QUEUED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ASSIGNED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ON_THE_WAY: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  COLLECTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  VERIFIED: "bg-primary/10 text-primary",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/**
 * QueuePage — RE request queue management with table/card views.
 */
const QueuePage: React.FC = () => {
  const { requests, approveRequest, rejectRequest } = useREStore();
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("time");
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem("eco-queue-view") as ViewMode) || "table"
  );
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const setView = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("eco-queue-view", mode);
  };

  const filtered = useMemo(() => {
    let list = [...requests];
    if (filter === "PENDING") list = list.filter((r) => r.status === "PENDING");
    else if (filter === "QUEUED") list = list.filter((r) => r.status === "QUEUED");
    else if (filter === "PROCESSING") list = list.filter((r) => ["ASSIGNED", "ON_THE_WAY"].includes(r.status));
    else if (filter === "DONE") list = list.filter((r) => ["COLLECTED", "VERIFIED", "REJECTED"].includes(r.status));
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
    toast.success("Đã thêm vào hàng đợi");
  };

  const handleReject = () => {
    if (!rejectId || rejectReason.length < 10) return;
    rejectRequest(rejectId, rejectReason);
    setRejectId(null);
    setRejectReason("");
    toast.error("Đã từ chối báo cáo");
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "Tất cả", count: requests.length },
    { key: "PENDING", label: "Chờ duyệt", count: pendingCount },
    { key: "QUEUED", label: "Đã xếp hàng", count: requests.filter((r) => r.status === "QUEUED").length },
    { key: "PROCESSING", label: "Đang xử lý", count: requests.filter((r) => ["ASSIGNED", "ON_THE_WAY"].includes(r.status)).length },
    { key: "DONE", label: "Hoàn thành", count: requests.filter((r) => ["COLLECTED", "VERIFIED", "REJECTED"].includes(r.status)).length },
  ];

  return (
    <div className="space-y-5 max-w-full">
      <h1 className="text-2xl font-heading font-bold text-foreground">Hàng đợi yêu cầu</h1>

      {/* Pending callout */}
      {pendingCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{pendingCount} báo cáo chờ duyệt</span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                filter === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label} <span className="opacity-60">({t.count})</span>
            </button>
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
                  <TableRow>
                    <TableHead className="w-20">#</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Khu vực</TableHead>
                    <TableHead>Loại rác</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((r, i) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className={cn(
                          "border-b transition-colors hover:bg-muted/50 group",
                          r.wasteType === "HAZARDOUS" && "border-l-2 border-l-yellow-400"
                        )}
                      >
                        <TableCell className="font-mono text-xs">{r.id}</TableCell>
                        <TableCell className="font-medium text-sm">{r.citizenName}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{r.address}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{r.area}</Badge></TableCell>
                        <TableCell>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", wasteTypeColors[r.wasteType])}>
                            {r.wasteType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusColors[r.status])}>
                            {statusLabels[r.status]}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.reportedAt}</TableCell>
                        <TableCell className="text-right">
                          {r.status === "PENDING" && (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleApprove(r.id)}>
                                <Check className="w-3 h-3 mr-1" /> Duyệt
                              </Button>
                              <Popover open={rejectId === r.id} onOpenChange={(o) => { if (!o) { setRejectId(null); setRejectReason(""); } }}>
                                <PopoverTrigger asChild>
                                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setRejectId(r.id)}>
                                    <X className="w-3 h-3 mr-1" /> Từ chối
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 space-y-3">
                                  <p className="text-sm font-medium">Lý do từ chối</p>
                                  <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Tối thiểu 10 ký tự..." className="min-h-[60px] text-sm" />
                                  <Button size="sm" variant="destructive" className="w-full" onClick={handleReject} disabled={rejectReason.length < 10}>
                                    Xác nhận ({rejectReason.length}/10)
                                  </Button>
                                </PopoverContent>
                              </Popover>
                            </div>
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
                <Card className={cn(
                  "overflow-hidden hover:shadow-md transition-all duration-300",
                  r.wasteType === "HAZARDOUS" && "border-l-2 border-l-yellow-400"
                )}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{r.address}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.citizenName} · {r.reportedAt}</p>
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", statusColors[r.status])}>
                        {statusLabels[r.status]}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px]">{r.area}</Badge>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", wasteTypeColors[r.wasteType])}>
                        {r.wasteType}
                      </span>
                      {r.priority === "HIGH" && <Badge variant="destructive" className="text-[10px]">Ưu tiên</Badge>}
                    </div>
                    {r.status === "PENDING" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" className="h-8 text-xs flex-1" onClick={() => handleApprove(r.id)}>
                          <Check className="w-3 h-3 mr-1" /> Duyệt
                        </Button>
                        <Popover open={rejectId === r.id} onOpenChange={(o) => { if (!o) { setRejectId(null); setRejectReason(""); } }}>
                          <PopoverTrigger asChild>
                            <Button size="sm" variant="destructive" className="h-8 text-xs flex-1" onClick={() => setRejectId(r.id)}>
                              <X className="w-3 h-3 mr-1" /> Từ chối
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 space-y-3">
                            <p className="text-sm font-medium">Lý do từ chối</p>
                            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Tối thiểu 10 ký tự..." className="min-h-[60px] text-sm" />
                            <Button size="sm" variant="destructive" className="w-full" onClick={handleReject} disabled={rejectReason.length < 10}>
                              Xác nhận ({rejectReason.length}/10)
                            </Button>
                          </PopoverContent>
                        </Popover>
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
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không có yêu cầu nào phù hợp</p>
        </div>
      )}
    </div>
  );
};

const FileText = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);

export default QueuePage;
