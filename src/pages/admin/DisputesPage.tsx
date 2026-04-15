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
import { getWasteClasses, getWasteLabel } from "@/lib/statusConfig";

type FilterTab = "ALL" | "OPEN" | "RESOLVED";

const priorityConfig = {
  HIGH: { color: "bg-destructive/15 text-destructive", label: "Cao" },
  MEDIUM: { color: "bg-status-pending/15 text-status-pending", label: "TB" },
  LOW: { color: "bg-muted text-muted-foreground", label: "Thấp" },
};

const gradientMap: Record<string, string> = {
  "gradient-blue": "from-[oklch(0.58_0.18_252)] to-[oklch(0.48_0.2_252)]",
  "gradient-green": "from-[oklch(0.62_0.19_152)] to-[oklch(0.47_0.15_152)]",
  "gradient-amber": "from-[oklch(0.79_0.15_85)] to-[oklch(0.7_0.18_60)]",
  "gradient-teal": "from-[oklch(0.6_0.12_180)] to-[oklch(0.5_0.14_180)]",
  "gradient-red": "from-[oklch(0.6_0.2_27)] to-[oklch(0.5_0.24_27)]",
  "gradient-gray": "from-[oklch(0.6_0.01_264)] to-[oklch(0.45_0.02_264)]",
  "gradient-purple": "from-[oklch(0.6_0.18_302)] to-[oklch(0.5_0.2_302)]",
  "gradient-orange": "from-[oklch(0.72_0.18_46)] to-[oklch(0.6_0.2_40)]",
};

/**
 * DisputesPage — dispute resolution with split-panel detail view and audit timeline.
 */
const DisputesPage: React.FC = () => {
  const { disputes, setVerdict } = useAdminStore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [verdictConfirm, setVerdictConfirm] = useState<"REFUND" | "REJECT" | null>(null);
  const [verdictReason, setVerdictReason] = useState("");

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

  const handleVerdict = () => {
    if (!selected || verdictReason.length < 10) return;
    if (verdictConfirm === "REFUND") {
      setVerdict(selected.id, "RESOLVED_REFUNDED", verdictReason);
      toast({ title: "✅ Chứng nhận + Hoàn điểm", description: "Citizen được cộng lại điểm. Enterprise ghi nhận penalty." });
      setSelected({ ...selected, status: "RESOLVED_REFUNDED", verdict: "REFUNDED", resolvedAt: new Date().toISOString(), resolvedBy: "Admin", resolvedReason: verdictReason });
    } else {
      setVerdict(selected.id, "RESOLVED_REJECTED", verdictReason);
      toast({ title: "❌ Bác bỏ khiếu nại", description: "Trust Score Citizen bị trừ." });
      setSelected({ ...selected, status: "RESOLVED_REJECTED", verdict: "REJECTED", resolvedAt: new Date().toISOString(), resolvedBy: "Admin", resolvedReason: verdictReason });
    }
    setVerdictConfirm(null);
    setVerdictReason("");
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "Tất cả", count: disputes.length },
    { key: "OPEN", label: "Đang mở", count: openCount },
    { key: "RESOLVED", label: "Đã giải quyết", count: resolvedCount },
  ];

  const DetailContent: React.FC<{ d: Dispute }> = ({ d }) => (
    <div className="space-y-5 p-1">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs">{d.id}</Badge>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", priorityConfig[d.priority].color)}>
            {priorityConfig[d.priority].label}
          </span>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", getWasteClasses(d.wasteType))}>
            {getWasteLabel(d.wasteType)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{d.reportAddress}</p>
        <p className="text-xs text-muted-foreground">Tạo: {d.createdAt} · Thu gom: {d.collectedAt}</p>
      </div>

      {/* Evidence comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">📸 Ảnh báo cáo — Citizen</p>
          <div className={cn("aspect-square rounded-xl bg-gradient-to-br flex items-center justify-center", gradientMap[d.citizen.reportPhoto] || gradientMap["gradient-gray"])}>
            <Recycle className="w-10 h-10 text-white/60" />
          </div>
          <p className="text-sm font-medium text-foreground">{d.citizen.name}</p>
          <p className="text-xs text-muted-foreground">{d.citizen.phone}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">📸 Ảnh thu gom — Collector</p>
          <div className={cn("aspect-square rounded-xl bg-gradient-to-br flex items-center justify-center", gradientMap[d.collector.collectPhoto] || gradientMap["gradient-gray"])}>
            <CheckCircle className="w-10 h-10 text-white/60" />
          </div>
          <p className="text-sm font-medium text-foreground">{d.collector.name}</p>
          <p className="text-xs text-muted-foreground">{d.collector.team}</p>
        </div>
      </div>

      {/* Citizen claim */}
      <div className="p-4 rounded-lg bg-status-pending/10 border border-status-pending/20">
        <p className="text-xs font-semibold text-status-pending mb-1">Khiếu nại của Citizen:</p>
        <p className="text-sm italic text-foreground">"{d.citizenClaim}"</p>
      </div>

      {/* Audit Timeline */}
      {d.timeline && d.timeline.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dòng thời gian</p>
          <div className="relative pl-4 space-y-3 border-l-2 border-border">
            {d.timeline.map((event, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[calc(1rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                <p className="text-xs font-mono text-muted-foreground">{event.time}</p>
                <p className="text-sm text-foreground">{event.event}</p>
                <p className="text-xs text-muted-foreground">{event.actor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution info */}
      {d.status !== "OPEN" && (
        <div className="p-3 rounded-lg bg-muted space-y-1">
          <p className="text-xs font-semibold">Kết quả: <Badge variant={d.verdict === "REFUNDED" ? "default" : "destructive"} className="text-[10px] ml-1">{d.verdict === "REFUNDED" ? "Hoàn điểm" : "Bác bỏ"}</Badge></p>
          {d.resolvedAt && <p className="text-xs text-muted-foreground">Giải quyết: {d.resolvedAt}</p>}
          {d.resolvedReason && <p className="text-xs text-muted-foreground">Lý do: {d.resolvedReason}</p>}
        </div>
      )}

      {/* Actions */}
      {d.status === "OPEN" && (
        <div className="space-y-2 pt-2">
          <Button className="w-full h-11 bg-status-collected text-white hover:bg-status-verified" onClick={() => setVerdictConfirm("REFUND")}>
            ✅ Chứng nhận + Hoàn điểm
          </Button>
          <Button variant="destructive" className="w-full h-11" onClick={() => setVerdictConfirm("REJECT")}>
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

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{disputes.length} Tổng</Badge>
        <Badge variant="destructive">{openCount} Đang mở</Badge>
        <Badge variant="default">{resolvedCount} Đã xử lý</Badge>
        <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Avg 3h 40m</Badge>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              filter === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >{t.label} ({t.count})</button>
        ))}
      </div>

      <div className="flex gap-4">
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
                        <Badge variant={d.verdict === "REFUNDED" ? "default" : "secondary"} className="text-[10px]">
                          {d.verdict === "REFUNDED" ? "Hoàn điểm" : "Bác bỏ"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">{d.citizen.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{d.citizenClaim}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-semibold", getWasteClasses(d.wasteType))}>{getWasteLabel(d.wasteType)}</span>
                        · {d.collector.name}
                      </span>
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

        {selected && !isMobile && (
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
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

      {isMobile && (
        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader><SheetTitle>Chi tiết tranh chấp</SheetTitle></SheetHeader>
            {selected && <DetailContent d={selected} />}
          </SheetContent>
        </Sheet>
      )}

      {/* Verdict confirmation modal */}
      <Dialog open={!!verdictConfirm} onOpenChange={(o) => { if (!o) { setVerdictConfirm(null); setVerdictReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{verdictConfirm === "REFUND" ? "Chứng nhận + Hoàn điểm" : "Bác bỏ khiếu nại"}</DialogTitle>
            <DialogDescription>
              {verdictConfirm === "REFUND"
                ? "Citizen sẽ được cộng lại điểm đã trừ. Enterprise ghi nhận penalty."
                : "Trust Score Citizen sẽ bị trừ."
              }
              <br />Vui lòng nhập lý do (tối thiểu 10 ký tự).
            </DialogDescription>
          </DialogHeader>
          <Textarea value={verdictReason} onChange={(e) => setVerdictReason(e.target.value)} placeholder="Lý do quyết định..." className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setVerdictConfirm(null); setVerdictReason(""); }}>Hủy</Button>
            <Button variant={verdictConfirm === "REFUND" ? "default" : "destructive"} onClick={handleVerdict} disabled={verdictReason.length < 10}>
              Xác nhận ({verdictReason.length}/10)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisputesPage;
