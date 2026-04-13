import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Phone, Mail, FileText, Users as UsersIcon, AlertTriangle, Check, X, Pause, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAdminStore } from "@/store/useAdminStore";
import { useToast } from "@/hooks/use-toast";
import type { REAccount } from "@/mock/admin-re-accounts";
import { cn } from "@/lib/utils";

type FilterTab = "ALL" | "ACTIVE" | "PENDING" | "SUSPENDED";

const statusBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  ACTIVE: { variant: "default", label: "Hoạt động" },
  WARNING: { variant: "outline", label: "Cảnh báo" },
  PENDING: { variant: "secondary", label: "Chờ duyệt" },
  SUSPENDED: { variant: "destructive", label: "Đình chỉ" },
  REJECTED: { variant: "destructive", label: "Từ chối" },
};

/**
 * AccountsPage — RE account management with approve/reject/suspend modals.
 */
const AccountsPage: React.FC = () => {
  const { accounts, approveAccount, rejectAccount, suspendAccount, reactivateAccount } = useAdminStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("joinDate");
  const [approveTarget, setApproveTarget] = useState<REAccount | null>(null);
  const [rejectTarget, setRejectTarget] = useState<REAccount | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<REAccount | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("30");

  const filtered = useMemo(() => {
    let list = accounts.filter((a) => a.status !== "REJECTED");
    if (filter === "ACTIVE") list = list.filter((a) => a.status === "ACTIVE" || a.status === "WARNING");
    if (filter === "PENDING") list = list.filter((a) => a.status === "PENDING");
    if (filter === "SUSPENDED") list = list.filter((a) => a.status === "SUSPENDED");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.ward.toLowerCase().includes(q));
    }
    if (sortBy === "reports") list.sort((a, b) => b.reports - a.reports);
    else if (sortBy === "disputes") list.sort((a, b) => b.disputes - a.disputes);
    else list.sort((a, b) => b.joinDate.localeCompare(a.joinDate));
    return list;
  }, [accounts, filter, search, sortBy]);

  const pendingAccounts = accounts.filter((a) => a.status === "PENDING");

  const handleApprove = (acc: REAccount) => {
    approveAccount(acc.id);
    setApproveTarget(null);
    toast({ title: "✅ Đã phê duyệt", description: `${acc.name} đã được kích hoạt thành công.` });
  };

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    rejectAccount(rejectTarget.id);
    setRejectTarget(null);
    setRejectReason("");
    toast({ title: "❌ Đã từ chối", description: `Tài khoản đã bị từ chối.` });
  };

  const handleSuspend = () => {
    if (!suspendTarget || !suspendReason.trim()) return;
    suspendAccount(suspendTarget.id, suspendReason, suspendDuration);
    setSuspendTarget(null);
    setSuspendReason("");
    toast({ title: "⏸ Đã đình chỉ", description: `${suspendTarget.name} đã bị đình chỉ.` });
  };

  const handleReactivate = (acc: REAccount) => {
    reactivateAccount(acc.id);
    toast({ title: "▶️ Đã kích hoạt lại", description: `${acc.name} đã hoạt động trở lại.` });
  };

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "ALL", label: "Tất cả", count: accounts.filter((a) => a.status !== "REJECTED").length },
    { key: "ACTIVE", label: "Đang hoạt động", count: accounts.filter((a) => a.status === "ACTIVE" || a.status === "WARNING").length },
    { key: "PENDING", label: "Chờ duyệt", count: pendingAccounts.length },
    { key: "SUSPENDED", label: "Đình chỉ", count: accounts.filter((a) => a.status === "SUSPENDED").length },
  ];

  return (
    <div className="space-y-5 max-w-full">
      <h1 className="text-2xl font-heading font-bold text-foreground">Quản lý tài khoản RE</h1>

      {/* Pending banner */}
      {pendingAccounts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{pendingAccounts.length} tài khoản chờ phê duyệt</span>
          </div>
          <div className="flex gap-2">
            {pendingAccounts.map((a) => (
              <Button key={a.id} size="sm" className="h-7 text-xs" onClick={() => setApproveTarget(a)}>
                {a.name}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filter tabs + search + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                filter === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label} {t.count !== undefined && <span className="ml-1 opacity-60">({t.count})</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, phường..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 h-9 text-xs">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="joinDate">Ngày tham gia</SelectItem>
            <SelectItem value="reports">Báo cáo</SelectItem>
            <SelectItem value="disputes">Tranh chấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filtered.map((acc, i) => {
            const sb = statusBadge[acc.status] || statusBadge.ACTIVE;
            return (
              <motion.div key={acc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }} layout>
                <Card className="overflow-hidden">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">{acc.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{acc.ward}</p>
                      </div>
                      <Badge variant={sb.variant} className="text-[10px]">{sb.label}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{acc.manager}</p>
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{acc.phone}</p>
                      <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{acc.email}</p>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{acc.reports} báo cáo</span>
                      <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{acc.collectors} collector</span>
                      <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{acc.disputes} tranh chấp</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {acc.status === "PENDING" && (
                        <>
                          <Button size="sm" className="h-8 text-xs flex-1" onClick={() => setApproveTarget(acc)}>
                            <Check className="w-3 h-3 mr-1" /> Phê duyệt
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 text-xs flex-1" onClick={() => setRejectTarget(acc)}>
                            <X className="w-3 h-3 mr-1" /> Từ chối
                          </Button>
                        </>
                      )}
                      {(acc.status === "ACTIVE" || acc.status === "WARNING") && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 text-xs flex-1">👁 Chi tiết</Button>
                          <Button size="sm" variant="destructive" className="h-8 text-xs flex-1" onClick={() => setSuspendTarget(acc)}>
                            <Pause className="w-3 h-3 mr-1" /> Đình chỉ
                          </Button>
                        </>
                      )}
                      {acc.status === "SUSPENDED" && (
                        <Button size="sm" className="h-8 text-xs flex-1" onClick={() => handleReactivate(acc)}>
                          <Play className="w-3 h-3 mr-1" /> Kích hoạt lại
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Approve modal */}
      <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phê duyệt tài khoản RE</DialogTitle>
            <DialogDescription>Xác nhận kích hoạt tài khoản này?</DialogDescription>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-2 text-sm">
              <p><strong>{approveTarget.name}</strong></p>
              <p>{approveTarget.ward}</p>
              <p>Quản lý: {approveTarget.manager}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Hủy</Button>
            <Button onClick={() => approveTarget && handleApprove(approveTarget)}>Xác nhận phê duyệt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject modal */}
      <Dialog open={!!rejectTarget} onOpenChange={() => { setRejectTarget(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối tài khoản RE</DialogTitle>
            <DialogDescription>Vui lòng cung cấp lý do từ chối.</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Lý do từ chối..." className="min-h-[80px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Hủy</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend modal */}
      <Dialog open={!!suspendTarget} onOpenChange={() => { setSuspendTarget(null); setSuspendReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đình chỉ tài khoản RE</DialogTitle>
            <DialogDescription>Hành động này sẽ dừng toàn bộ hoạt động thu gom của phường này.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={suspendDuration} onValueChange={setSuspendDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
                <SelectItem value="0">Vô thời hạn</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Lý do đình chỉ..." className="min-h-[80px]" />
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              ⚠️ Hành động này sẽ dừng toàn bộ hoạt động thu gom của phường này
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSuspendTarget(null); setSuspendReason(""); }}>Hủy</Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={!suspendReason.trim()}>Xác nhận đình chỉ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountsPage;
