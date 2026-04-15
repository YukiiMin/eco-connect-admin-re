import { create } from "zustand";
import { reAccounts as initialAccounts, type REAccount } from "@/mock/admin-re-accounts";
import { disputes as initialDisputes, type Dispute } from "@/mock/admin-disputes";

interface AdminState {
  accounts: REAccount[];
  disputes: Dispute[];
  approveAccount: (id: string) => void;
  rejectAccount: (id: string) => void;
  suspendAccount: (id: string, reason: string, duration: string) => void;
  reactivateAccount: (id: string) => void;
  /** Set verdict: RESOLVED_REFUNDED or RESOLVED_REJECTED */
  setVerdict: (id: string, verdict: "RESOLVED_REFUNDED" | "RESOLVED_REJECTED", reason: string) => void;
}

/** Admin portal Zustand store */
export const useAdminStore = create<AdminState>((set) => ({
  accounts: [...initialAccounts],
  disputes: [...initialDisputes],

  approveAccount: (id) =>
    set((s) => ({
      accounts: s.accounts.map((a) =>
        a.id === id ? { ...a, status: "ACTIVE" as const } : a
      ),
    })),

  rejectAccount: (id) =>
    set((s) => ({
      accounts: s.accounts.map((a) =>
        a.id === id ? { ...a, status: "REJECTED" as const } : a
      ),
    })),

  suspendAccount: (id, _reason, _duration) =>
    set((s) => ({
      accounts: s.accounts.map((a) =>
        a.id === id
          ? { ...a, status: "SUSPENDED" as const, suspendedAt: new Date().toISOString().slice(0, 10) }
          : a
      ),
    })),

  reactivateAccount: (id) =>
    set((s) => ({
      accounts: s.accounts.map((a) =>
        a.id === id ? { ...a, status: "ACTIVE" as const, suspendedAt: null } : a
      ),
    })),

  setVerdict: (id, verdict, reason) =>
    set((s) => ({
      disputes: s.disputes.map((d) =>
        d.id === id
          ? {
              ...d,
              status: verdict,
              verdict: verdict === "RESOLVED_REFUNDED" ? "REFUNDED" : "REJECTED",
              resolvedAt: new Date().toISOString(),
              resolvedBy: "Admin",
              resolvedReason: reason,
            }
          : d
      ),
    })),
}));
