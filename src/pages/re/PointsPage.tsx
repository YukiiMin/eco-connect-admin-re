import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Trash2, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useREStore } from "@/store/useREStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const wasteTypeColors: Record<string, string> = {
  RECYCLABLE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ORGANIC: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  HAZARDOUS: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MIXED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const wasteTypeLabels: Record<string, string> = {
  RECYCLABLE: "Tái chế",
  ORGANIC: "Hữu cơ",
  HAZARDOUS: "Nguy hại",
  MIXED: "Hỗn hợp",
};

/**
 * PointsPage — configure citizen point rewards per waste type.
 */
const PointsPage: React.FC = () => {
  const { pointRules, updatePointRule, addPointRule, deletePointRule } = useREStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");
  const [newWaste, setNewWaste] = useState<string>("RECYCLABLE");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Selected rule for preview
  const previewRule = pointRules[0];
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
    if (!editingId || !editField) return;
    const val = parseFloat(editValue);
    if (isNaN(val)) return;
    updatePointRule(editingId, { [editField]: val });
    setEditingId(null);
    toast.success("Đã cập nhật");
  };

  const handleAddRule = () => {
    const id = `PR${String(pointRules.length + 1).padStart(3, "0")}`;
    addPointRule({
      id,
      wasteType: newWaste as "RECYCLABLE" | "ORGANIC" | "HAZARDOUS" | "MIXED",
      basePoints: 5,
      qualityMultiplier: 1.0,
      timeBonus: 2,
      description: "Quy tắc mới",
    });
    toast.success("Đã thêm quy tắc");
  };

  const handleDelete = (id: string) => {
    deletePointRule(id);
    setDeleteConfirm(null);
    toast.success("Đã xoá quy tắc");
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" /> Cấu hình điểm thưởng Citizen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Điểm được cộng cho Citizen khi báo cáo được VERIFIED</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rules table */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại rác</TableHead>
                      <TableHead className="text-center">Điểm cơ bản</TableHead>
                      <TableHead className="text-center">Hệ số CL</TableHead>
                      <TableHead className="text-center">Thưởng sớm</TableHead>
                      <TableHead className="text-center">Ví dụ</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointRules.map((rule) => (
                      <TableRow key={rule.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", wasteTypeColors[rule.wasteType])}>
                            {wasteTypeLabels[rule.wasteType] || rule.wasteType}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === rule.id && editField === "basePoints" ? (
                            <Input
                              type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit} onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              className="w-16 h-7 text-xs text-center mx-auto" autoFocus
                            />
                          ) : (
                            <span className="cursor-pointer hover:text-primary transition-colors font-medium tabular-nums"
                              onClick={() => handleInlineEdit(rule.id, "basePoints", rule.basePoints)}>
                              {rule.basePoints}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === rule.id && editField === "qualityMultiplier" ? (
                            <Input
                              type="number" step="0.1" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit} onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              className="w-16 h-7 text-xs text-center mx-auto" autoFocus
                            />
                          ) : (
                            <span className="cursor-pointer hover:text-primary transition-colors font-medium tabular-nums"
                              onClick={() => handleInlineEdit(rule.id, "qualityMultiplier", rule.qualityMultiplier)}>
                              ×{rule.qualityMultiplier}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === rule.id && editField === "timeBonus" ? (
                            <Input
                              type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit} onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              className="w-16 h-7 text-xs text-center mx-auto" autoFocus
                            />
                          ) : (
                            <span className="cursor-pointer hover:text-primary transition-colors font-medium tabular-nums"
                              onClick={() => handleInlineEdit(rule.id, "timeBonus", rule.timeBonus)}>
                              +{rule.timeBonus}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm font-heading font-bold tabular-nums text-primary">
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
              <div className="p-3 border-t border-border flex items-center gap-2">
                <Select value={newWaste} onValueChange={setNewWaste}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECYCLABLE">Tái chế</SelectItem>
                    <SelectItem value="ORGANIC">Hữu cơ</SelectItem>
                    <SelectItem value="HAZARDOUS">Nguy hại</SelectItem>
                    <SelectItem value="MIXED">Hỗn hợp</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAddRule}>
                  <Plus className="w-3 h-3 mr-1" /> Thêm quy tắc
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Xem trước tính điểm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {previewRule && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 rounded-lg bg-muted space-y-2"
                >
                  <p className="text-xs text-muted-foreground">
                    Nếu Citizen báo <strong>{wasteTypeLabels[previewRule.wasteType]}</strong>, ảnh rõ, trước 20h:
                  </p>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>Điểm cơ bản: <span className="text-foreground font-medium">{previewRule.basePoints}</span></p>
                    <p>× Hệ số chất lượng: <span className="text-foreground font-medium">{previewRule.qualityMultiplier}</span></p>
                    <p>+ Thưởng sớm: <span className="text-foreground font-medium">{previewRule.timeBonus}</span></p>
                    <hr className="border-border" />
                    <p className="text-base font-heading font-bold text-primary">= {previewCalc} điểm</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PointsPage;
