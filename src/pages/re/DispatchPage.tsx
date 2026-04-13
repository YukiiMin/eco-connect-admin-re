import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, User, Check, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useREStore } from "@/store/useREStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const wasteTypeColors: Record<string, string> = {
  RECYCLABLE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ORGANIC: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  HAZARDOUS: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MIXED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

/**
 * DispatchPage — assign queued requests to collectors.
 */
const DispatchPage: React.FC = () => {
  const { requests, collectors, assignCollector } = useREStore();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [confirmSheet, setConfirmSheet] = useState<{ requestId: string; collectorName: string } | null>(null);

  const queuedRequests = useMemo(
    () => requests.filter((r) => r.status === "QUEUED"),
    [requests]
  );

  const activeCollectors = useMemo(
    () => collectors.filter((c) => c.status === "ACTIVE"),
    [collectors]
  );

  const selectedRequest = queuedRequests.find((r) => r.id === selectedRequestId);

  const handleAssignConfirm = () => {
    if (!confirmSheet) return;
    assignCollector(confirmSheet.requestId, confirmSheet.collectorName);
    setConfirmSheet(null);
    setSelectedRequestId(null);
    toast.success("Đã gán thành công");
  };

  const getWorkloadColor = (tasks: number) => {
    if (tasks > 13) return "bg-destructive";
    if (tasks >= 10) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className="space-y-5 max-w-full">
      <h1 className="text-2xl font-heading font-bold text-foreground">Điều phối thu gom</h1>

      {queuedRequests.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không có yêu cầu nào trong hàng đợi</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Queued requests */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Yêu cầu chờ gán ({queuedRequests.length})
          </h2>
          <AnimatePresence>
            {queuedRequests.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]",
                    selectedRequestId === r.id && "ring-2 ring-primary shadow-lg"
                  )}
                  onClick={() => setSelectedRequestId(r.id === selectedRequestId ? null : r.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">{r.address}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.citizenName} · {r.weight}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px]">{r.area}</Badge>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", wasteTypeColors[r.wasteType])}>
                          {r.wasteType}
                        </span>
                      </div>
                    </div>
                    {selectedRequestId === r.id && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-primary font-medium mt-2"
                      >
                        ✓ Đã chọn — chọn collector bên phải để gán
                      </motion.p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right: Collector panel */}
        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Collector khả dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeCollectors.map((c) => {
                const workloadPercent = Math.round((c.todayTasks / 15) * 100);
                return (
                  <motion.div
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-all duration-200"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {c.name.split(" ").map((n) => n[0]).join("").slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{c.team}</span>
                        <span>·</span>
                        <span>{c.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={workloadPercent} className={cn("h-1.5 flex-1", `[&>div]:${getWorkloadColor(c.todayTasks)}`)} />
                        <span className="text-[10px] text-muted-foreground">{c.todayTasks}/15</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 text-xs shrink-0"
                      disabled={!selectedRequestId}
                      onClick={() => selectedRequestId && setConfirmSheet({ requestId: selectedRequestId, collectorName: c.name })}
                    >
                      Gán
                    </Button>
                  </motion.div>
                );
              })}

              {activeCollectors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Không có collector nào đang hoạt động</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Sheet */}
      <Sheet open={!!confirmSheet} onOpenChange={(o) => !o && setConfirmSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Xác nhận gán Collector</SheetTitle>
          </SheetHeader>
          {confirmSheet && selectedRequest && (
            <div className="space-y-3 py-4">
              <div className="p-3 rounded-lg bg-muted space-y-1">
                <p className="text-sm font-medium">{selectedRequest.address}</p>
                <p className="text-xs text-muted-foreground">{selectedRequest.citizenName} · {selectedRequest.wasteType} · {selectedRequest.weight}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{confirmSheet.collectorName}</span>
              </div>
            </div>
          )}
          <SheetFooter>
            <Button variant="outline" onClick={() => setConfirmSheet(null)}>Hủy</Button>
            <Button onClick={handleAssignConfirm}>
              <Check className="w-4 h-4 mr-2" /> Xác nhận gán
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DispatchPage;
