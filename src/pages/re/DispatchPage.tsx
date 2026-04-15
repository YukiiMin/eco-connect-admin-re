import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Truck, Users, Check, MapPin, Clock, Rocket, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useREStore } from "@/store/useREStore";
import { areas } from "@/mock/re-config";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getWasteClasses, getWasteLabel } from "@/lib/statusConfig";

/**
 * DispatchPage — Batch dispatch by Work Area + Team.
 */
const DispatchPage: React.FC = () => {
  const { requests, collectors, batchDispatch } = useREStore();
  const [confirmArea, setConfirmArea] = useState<string | null>(null);

  // Calculate dispatch countdown to 20:00
  const now = new Date();
  const dispatchHour = 20;
  const hoursLeft = dispatchHour - now.getHours();
  const minutesLeft = 60 - now.getMinutes();
  const isDispatchTime = now.getHours() >= dispatchHour;

  // Group ACCEPTED requests by area
  const areaStats = useMemo(() => {
    return areas.map((area) => {
      const areaRequests = requests.filter((r) => r.area === area.name && r.status === "ACCEPTED");
      const dispatchedRequests = requests.filter((r) => r.area === area.name && r.status === "QUEUED_FOR_DISPATCH");
      const areaCollectors = collectors.filter((c) => c.area === area.name && c.status === "ACTIVE");
      const wasteUnits = areaRequests.length;
      const isOverflow = wasteUnits >= area.threshold;
      return {
        ...area,
        acceptedCount: areaRequests.length,
        dispatchedCount: dispatchedRequests.length,
        collectors: areaCollectors,
        wasteUnits,
        isOverflow,
        requests: areaRequests,
      };
    });
  }, [requests, collectors]);

  const handleBatchDispatch = (areaName: string) => {
    batchDispatch(areaName);
    setConfirmArea(null);
    toast.success(`Đã tạo batch cho ${areaName} — chuyển sang QUEUED_FOR_DISPATCH`);
  };

  return (
    <div className="space-y-5 max-w-full">
      <h1 className="text-2xl font-heading font-bold text-foreground">Điều phối thu gom</h1>

      {/* Dispatch countdown */}
      <Card className={cn("border-l-3", isDispatchTime ? "border-l-primary bg-primary/5" : "border-l-status-pending bg-status-pending/5")}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            {isDispatchTime ? (
              <p className="text-sm font-medium">🚀 Đã đến giờ xuất binh — 20:00 tối nay</p>
            ) : (
              <p className="text-sm font-medium">
                Xuất binh lúc <span className="font-mono font-bold text-primary">20:00</span> tối nay
                <span className="text-muted-foreground ml-2">— còn {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}</span>
              </p>
            )}
          </div>
          <Badge variant={isDispatchTime ? "default" : "secondary"} className="text-xs">
            {isDispatchTime ? "LIVE" : "Đang chờ"}
          </Badge>
        </CardContent>
      </Card>

      {/* Work Area panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {areaStats.map((area, i) => (
          <motion.div key={area.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={cn("h-full", area.isOverflow && "border-destructive/50")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {area.name}
                  </CardTitle>
                  {area.isOverflow && (
                    <Badge variant="destructive" className="text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-1" /> OVERFLOW
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Waste unit progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{area.acceptedCount} báo cáo ACCEPTED</span>
                    <span className="font-mono">{area.wasteUnits}/{area.threshold}</span>
                  </div>
                  <Progress value={(area.wasteUnits / area.threshold) * 100}
                    className={cn("h-2", area.wasteUnits / area.threshold >= 0.9 && "[&>div]:bg-destructive")} />
                </div>

                {area.dispatchedCount > 0 && (
                  <p className="text-xs text-status-queued-dispatch font-medium">
                    ✓ {area.dispatchedCount} đã QUEUED_FOR_DISPATCH
                  </p>
                )}

                {/* Team info */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team trực</p>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{area.team1Lead}</span>
                      <Badge variant="outline" className="text-[9px]">Team 1</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {area.collectors.length} collector khả dụng
                    </div>
                    {area.collectors.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                          {c.name.split(" ").map((n) => n[0]).join("").slice(-2)}
                        </div>
                        <span>{c.name}</span>
                        <span className="text-muted-foreground font-mono">{c.todayTasks}/15</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accepted requests preview */}
                {area.acceptedCount > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Báo cáo chờ dispatch:</p>
                    {area.requests.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30">
                        <span className="font-mono text-muted-foreground">{r.id}</span>
                        <span className="truncate flex-1">{r.address}</span>
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-semibold", getWasteClasses(r.wasteType))}>
                          {getWasteLabel(r.wasteType)}
                        </span>
                      </div>
                    ))}
                    {area.acceptedCount > 3 && (
                      <p className="text-[10px] text-muted-foreground">+{area.acceptedCount - 3} báo cáo khác</p>
                    )}
                  </div>
                )}

                {/* Dispatch button */}
                <Button className="w-full h-10" disabled={area.acceptedCount === 0}
                  onClick={() => setConfirmArea(area.name)}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Gán Batch & Tạo Route ({area.acceptedCount})
                </Button>

                {/* Route preview placeholder */}
                {area.dispatchedCount > 0 && (
                  <div className="aspect-video rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Route Preview — Leaflet Map</p>
                      <p className="text-[10px]">Phase 2: Hiển thị route từ trụ sở → các điểm thu gom</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Confirm Sheet */}
      <Sheet open={!!confirmArea} onOpenChange={(o) => !o && setConfirmArea(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Xác nhận Batch Dispatch — {confirmArea}</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              Tất cả báo cáo ACCEPTED trong <strong>{confirmArea}</strong> sẽ chuyển sang trạng thái QUEUED_FOR_DISPATCH.
            </p>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium">
                {areaStats.find((a) => a.name === confirmArea)?.acceptedCount || 0} báo cáo sẽ được dispatch
              </p>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setConfirmArea(null)}>Hủy</Button>
            <Button onClick={() => confirmArea && handleBatchDispatch(confirmArea)}>
              <Check className="w-4 h-4 mr-2" /> Xác nhận Dispatch
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DispatchPage;
