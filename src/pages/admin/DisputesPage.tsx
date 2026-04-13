import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight, Recycle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdminStore } from "@/store/useAdminStore";
import { useToast } from "@/hooks/use-toast";
import type { Dispute } from "@/mock/admin-disputes";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type FilterTab = "ALL" | "OPEN" | "RESOLVED";

const priorityConfig = {
  HIGH: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Cao" },
  MEDIUM: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "TB" },
  LOW: { color: "bg-muted text-muted-foreground", label: "Thấp" },
};

const gradientMap: Record<string, string> = {
  "gradient-blue": "from-blue-400 to-blue-600",
  "gradient-green": "from-green-400 to-green-600",
  "gradient-amber": "from-amber-400 to-amber-600",
  "gradient-teal": "from-teal-400 to-teal-600",
  "gradient-red": "from-red-400 to-red-600",
  "gradient-gray": "from-gray-400 to-gray-600",
  "gradient-purple": "from-purple-400 to-purple-600",
  "gradient-orange": "from-orange-400 to-orange-600",
};

/**
 * DisputesPage — dispute resolution with split-panel detail view.
 */
const DisputesPage: React.FC = () => {
  const { disputes, setVerdict } = useAdminStore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [upheldConfirm, setUpheldConfirm] = useState(false);
  const [dismissReason, setDismissReason] = useState("");
  const [showDismiss, setShowDismiss] = useState(false);

  const filtered = useMemo(() => {
    let list = [...disputes];
    if (filter === "OPEN") list = list.filter((d) => d.status === "OPEN");
    if (filter === "RESOLVED") list = list.filter((d) => d.status !== "OPEN");
    list.sort((a, b) => {
      const pOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const pDiff = pOrder[a.priority] - pOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [disputes, filter]);

  const openCount = disputes.filter((d) => d.status === "OPEN").length;
  const resolvedCount = disputes.filter((d) => d.status !== "OPEN").length;

  const handleUpheld = () => {
    if (!selected) return;
    setVerdict(selected.id, "RESOLVED_UPHELD");
    toast({ title: "✅ Khiếu nại được chấp nhận", description: "Citizen được cộng lại điểm. Collector ghi nhận vi phạm." });
    setUpheldConfirm(false);
    setSelected({ ...selected, status: "RESOLVED_UPHELD", verdict: "UPHELD", resolvedAt: new Date().toISOString(), resolvedBy: "Admin" });
  };

  const handleDismiss = () => {
    if (!selected || dismissReason.length < 20) return;
    setVerdict(selected.id, "RESOLVED_DISMISSED", dismissReason);
    toast({ title: "❌ Khiếu nại bị bác bỏ", description: "Tranh chấp đã được đóng." });
    setShowDismiss(false);
    setDismissReason("");
    setSelected({ ...selected, status: "RESOLVED_DISMISSED", verdict: "DISMISSED", resolvedAt: new Date().toISOString(), resolvedBy: "Admin", resolvedReason: dismissReason });
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "Tất cả", count: disputes.length },
    { key: "OPEN", label: "Đang mở", count: openCount },
    { key: "RESOLVED", label: "Đã giải quyết", count: resolvedCount },
  ];

  /** Detail panel content (used in both Sheet and inline) */
  const DetailContent: React.FC<{ d: Dispute }> = ({ d }) => (
    <div className="space-y-5 p-1">
      {/* Header info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs">{d.id}</Badge>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", priorityConfig[d.priority].color)}>
            {priorityConfig[d.priority].label}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{d.reportAddress}</p>
        <p className="text-xs text-muted-foreground">Tạo: {d.createdAt} · Thu gom: {d.collectedAt}</p>
      </div>

      {/* Evidence comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">📸 Ảnh báo cáo của Citizen</p>
          <div className={cn("aspect-square rounded-xl bg-gradient-to-br flex items-center justify-center", gradientMap[d.citizen.reportPhoto] || "from-gray-400 to-gray-600")}>
            <Recycle className="w-10 h-10 text-white/60" />
          </div>
          <p className="text-sm font-medium text-foreground">{d.citizen.name}</p>
          <p className="text-xs text-muted-foreground">{d.citizen.phone}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">📸 Ảnh thu gom của Collector</p>
          <div className={cn("aspect-square rounded-xl bg-gradient-to-br flex items-center justify-center", gradientMap[d.collector.collectPhoto] || "from-gray-400 to-gray-600")}>
            <CheckCircle className="w-10 h-10 text-white/60" />
          </div>
          <p className="text-sm font-medium text-foreground">{d.collector.name}</p>
          <p className="text-xs text-muted-foreground">{d.collector.team}</p>
        </div>
      </div>

      {/* Citizen claim */}
      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">Khiếu nại của Citizen:</p>
        <p className="text-sm text-yellow-900 dark:text-yellow-200 italic">"{d.citizenClaim}"</p>
      </div>

      {/* Resolution info */}
      {d.status !== "OPEN" && (
        <div className="p-3 rounded-lg bg-muted space-y-1">
          <p className="text-xs font-semibold">Kết quả: <Badge variant={d.verdict === "UPHELD" ? "default" : "destructive"} className="text-[10px] ml-1">{d.verdict}</Badge></p>
          {d.resolvedAt && <p className="text-xs text-muted-foreground">Giải quyết: {d.resolvedAt}</p>}
          {d.resolvedReason && <p className="text-xs text-muted-foreground">Lý do: {d.resolvedReason}</p>}
        </div>
      )}

      {/* Actions */}
      {d.status === "OPEN" && (
        <div className="space-y-2 pt-2">
          <Button className="w-full h-11" onClick={() => setUpheldConfirm(true)}>
            ✅ Chấp nhận khiếu nại
          </Button>
          <Button variant="destructive" className="w-full h-11" onClick={() => setShowDismiss(true)}>
            ❌ Bác bỏ khiếu nại
          </Button>
          <Button variant="outline" className="w-full h-11 opacity-50 cursor-not-allowed" disabled>
            🔄 Escalate — cần xem xét thêm {/* Phase 2 */}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5 max-w-full">
      <h1 className="text-2xl font-heading font-bold text-foreground">Quản lý tranh chấp</h1>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{disputes.length} Tổng</Badge>
        <Badge variant="destructive">{openCount} Đang mở</Badge>
        <Badge variant="default">{resolvedCount} Đã xử lý</Badge>
        <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Avg 3h 40m</Badge>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              filter === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Content: List + Optional Detail Panel */}
      <div className="flex gap-4">
        {/* Dispute list */}
        <div className={cn("space-y-3 flex-1 min-w-0", selected && !isMobile && "max-w-[40%]")}>
          <AnimatePresence>
            {filtered.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} layout>
                <Card className={cn("overflow-hidden transition-all cursor-pointer hover:shadow-md", selected?.id === d.id && "ring-2 ring-primary")}
                  onClick={() => setSelected(d)}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">{d.id}</Badge>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", priorityConfig[d.priority].color)}>
                          {priorityConfig[d.priority].label}
                        </span>
                      </div>
                      {d.status === "OPEN" ? (
                        <Badge variant="destructive" className="text-[10px]">Đang mở</Badge>
                      ) : (
                        <Badge variant={d.verdict === "UPHELD" ? "default" : "secondary"} className="text-[10px]">
                          {d.verdict === "UPHELD" ? "Chấp nhận" : "Bác bỏ"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">{d.citizen.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{d.citizenClaim}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{d.wasteType} · {d.collector.name}</span>
                      {d.status === "OPEN" && (
                        <span className="text-primary font-medium flex items-center gap-0.5">
                          Xem xét <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Desktop detail panel */}
        {selected && !isMobile && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[60%] sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto"
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-foreground">Chi tiết tranh chấp</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <DetailContent d={selected} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Mobile detail sheet */}
      {isMobile && (
        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Chi tiết tranh chấp</SheetTitle>
            </SheetHeader>
            {selected && <DetailContent d={selected} />}
          </SheetContent>
        </Sheet>
      )}

      {/* Upheld confirmation modal */}
      <Dialog open={upheldConfirm} onOpenChange={setUpheldConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận chấp nhận khiếu nại</DialogTitle>
            <DialogDescription>Citizen sẽ được cộng lại điểm. Collector ghi nhận vi phạm.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpheldConfirm(false)}>Hủy</Button>
            <Button onClick={handleUpheld}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dismiss modal */}
      <Dialog open={showDismiss} onOpenChange={(o) => { setShowDismiss(o); if (!o) setDismissReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bác bỏ khiếu nại</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do (tối thiểu 20 ký tự).</DialogDescription>
          </DialogHeader>
          <Textarea value={dismissReason} onChange={(e) => setDismissReason(e.target.value)} placeholder="Lý do bác bỏ..." className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDismiss(false); setDismissReason(""); }}>Hủy</Button>
            <Button variant="destructive" onClick={handleDismiss} disabled={dismissReason.length < 20}>
              Bác bỏ ({dismissReason.length}/20)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisputesPage;
