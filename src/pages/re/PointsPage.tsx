import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Trash2, Calculator, CalendarDays, CheckCircle2, FileEdit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useREStore } from "@/store/useREStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getWasteClasses, getWasteLabel } from "@/lib/statusConfig";

const qualityLabels: Record<number, string> = { 1.2: "Tốt", 1.0: "Đạt", 0.8: "Kém" };

/**
 * PointsPage — configure citizen point rewards with rule sets and effective dates.
 */
const PointsPage: React.FC = () => {
  const { pointRuleSets, updatePointRule, addPointRule, deletePointRule, activateRuleSet, createDraftRuleSet, updatePenalty } = useREStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showNewDraft, setShowNewDraft] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftDate, setDraftDate] = useState("");

  const activeSet = pointRuleSets.find((rs) => rs.status === "ACTIVE");
  const draftSet = pointRuleSets.find((rs) => rs.status === "DRAFT");
  const [viewSetId, setViewSetId] = useState(activeSet?.id || "");
  const currentSet = pointRuleSets.find((rs) => rs.id === viewSetId) || activeSet;

  const previewRule = currentSet?.rules[0];
  const previewCalc = useMemo(() => {
    if (!previewRule) return 0;
    return Math.round(previewRule.basePoints * previewRule.qualityMultiplier + previewRule.timeBonus);
  }, [previewRule]);

  const handleInlineEdit = (id: string, field: string, currentValue: number) => {
    setEditingId(id);
    setEditField(field);
    setEditValue(String(currentValue));
  };

  const handleSaveEdit = () => {
    if (!editingId || !editField || !currentSet) return;
    const val = parseFloat(editValue);
    if (isNaN(val)) return;
    updatePointRule(currentSet.id, editingId, { [editField]: val });
    setEditingId(null);
    toast.success("Đã cập nhật");
  };

  const handleAddRule = () => {
    if (!currentSet) return;
    const id = `PR${String(Date.now()).slice(-6)}`;
    addPointRule(currentSet.id, {
      id, wasteType: "RECYCLABLE", basePoints: 5, qualityMultiplier: 1.0, timeBonus: 2, description: "Quy tắc mới",
    });
    toast.success("Đã thêm quy tắc");
  };

  const handleDelete = (id: string) => {
    if (!currentSet) return;
    deletePointRule(currentSet.id, id);
    setDeleteConfirm(null);
    toast.success("Đã xoá quy tắc");
  };

  const handleCreateDraft = () => {
    if (!draftName.trim() || !draftDate) return;
    createDraftRuleSet(draftName, draftDate);
    setShowNewDraft(false);
    setDraftName("");
    setDraftDate("");
    toast.success("Đã tạo bản nháp mới");
  };

  const handleActivate = () => {
    if (!currentSet || currentSet.status !== "DRAFT") return;
    activateRuleSet(currentSet.id);
    toast.success("Đã kích hoạt bộ quy tắc");
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-status-pending" /> Cấu hình điểm thưởng Citizen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Điểm được cộng cho Citizen khi báo cáo được VERIFIED</p>
      </div>

      {/* Rule set selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {pointRuleSets.map((rs) => (
            <button key={rs.id} onClick={() => setViewSetId(rs.id)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                viewSetId === rs.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {rs.status === "ACTIVE" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
              {rs.status === "DRAFT" && <FileEdit className="w-3 h-3 inline mr-1" />}
              {rs.name}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowNewDraft(true)}>
          <Plus className="w-3 h-3 mr-1" /> Tạo bản nháp
        </Button>
        {currentSet?.status === "DRAFT" && (
          <Button size="sm" className="h-8 text-xs" onClick={handleActivate}>
            <CheckCircle2 className="w-3 h-3 mr-1" /> Kích hoạt
          </Button>
        )}
      </div>

      {currentSet && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant={currentSet.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">{currentSet.status}</Badge>
          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Hiệu lực: {currentSet.effectiveDate}</span>
          <span>Phạt phân loại sai: <strong className="text-destructive font-mono">{currentSet.misclassificationPenalty} điểm</strong></span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Loại rác</TableHead>
                      <TableHead className="text-center">Điểm cơ bản</TableHead>
                      <TableHead className="text-center">Hệ số CL</TableHead>
                      <TableHead className="text-center">Thưởng sớm</TableHead>
                      <TableHead className="text-center">Ví dụ</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSet?.rules.map((rule) => (
                      <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors duration-150">
                        <TableCell>
                          <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", getWasteClasses(rule.wasteType))}>
                            {getWasteLabel(rule.wasteType)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === rule.id && editField === "basePoints" ? (
                            <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit} onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              className="w-16 h-7 text-xs text-center mx-auto" autoFocus />
                          ) : (
                            <span className="cursor-pointer hover:text-primary transition-colors font-medium font-mono"
                              onClick={() => handleInlineEdit(rule.id, "basePoints", rule.basePoints)}>
                              {rule.basePoints}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === rule.id && editField === "qualityMultiplier" ? (
                            <Select value={editValue} onValueChange={(v) => { setEditValue(v); }}>
                              <SelectTrigger className="w-20 h-7 text-xs mx-auto"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1.2">1.2 — Tốt</SelectItem>
                                <SelectItem value="1">1.0 — Đạt</SelectItem>
                                <SelectItem value="0.8">0.8 — Kém</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="cursor-pointer hover:text-primary transition-colors font-medium font-mono"
                              onClick={() => handleInlineEdit(rule.id, "qualityMultiplier", rule.qualityMultiplier)}>
                              ×{rule.qualityMultiplier} <span className="text-muted-foreground text-[10px]">({qualityLabels[rule.qualityMultiplier] || ""})</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === rule.id && editField === "timeBonus" ? (
                            <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit} onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              className="w-16 h-7 text-xs text-center mx-auto" autoFocus />
                          ) : (
                            <span className="cursor-pointer hover:text-primary transition-colors font-medium font-mono"
                              onClick={() => handleInlineEdit(rule.id, "timeBonus", rule.timeBonus)}>
                              +{rule.timeBonus}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm font-heading font-bold font-mono text-primary">
                          {Math.round(rule.basePoints * rule.qualityMultiplier + rule.timeBonus)}
                        </TableCell>
                        <TableCell>
                          <Popover open={deleteConfirm === rule.id} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteConfirm(rule.id)}>
                                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 space-y-2">
                              <p className="text-xs">Xoá quy tắc này?</p>
                              <Button size="sm" variant="destructive" className="w-full text-xs" onClick={() => handleDelete(rule.id)}>Xoá</Button>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {currentSet?.status !== "ARCHIVED" && (
                <div className="p-3 border-t border-border">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAddRule}>
                    <Plus className="w-3 h-3 mr-1" /> Thêm quy tắc
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Xem trước tính điểm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {previewRule && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-muted space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Nếu Citizen báo <strong>{getWasteLabel(previewRule.wasteType)}</strong>, ảnh rõ, trước 20h:
                  </p>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>Điểm cơ bản: <span className="text-foreground font-medium font-mono">{previewRule.basePoints}</span></p>
                    <p>× Hệ số chất lượng: <span className="text-foreground font-medium font-mono">{previewRule.qualityMultiplier}</span></p>
                    <p>+ Thưởng sớm: <span className="text-foreground font-medium font-mono">{previewRule.timeBonus}</span></p>
                    <hr className="border-border" />
                    <p className="text-base font-heading font-bold text-primary">= {previewCalc} điểm</p>
                  </div>
                  {currentSet && (
                    <p className="text-[10px] text-destructive">Phân loại sai: {currentSet.misclassificationPenalty} điểm</p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New draft dialog */}
      <Dialog open={showNewDraft} onOpenChange={setShowNewDraft}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo bộ quy tắc mới</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Tên bộ quy tắc</label>
              <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="VD: Bộ quy tắc v2.0" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Ngày hiệu lực</label>
              <Input type="date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDraft(false)}>Hủy</Button>
            <Button onClick={handleCreateDraft} disabled={!draftName.trim() || !draftDate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PointsPage;
