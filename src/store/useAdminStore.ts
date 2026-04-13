import { create } from "zustand";
import { reAccounts as initialAccounts, type REAccount } from "@/mock/admin-re-accounts";
import { disputes as initialDisputes, type Dispute } from "@/mock/admin-disputes";

interface AdminState {
  /** RE accounts list */
  accounts: REAccount[];
  /** Disputes list */
  disputes: Dispute[];
  /** Approve an RE account */
  approveAccount: (id: string) => void;
  /** Reject an RE account */
  rejectAccount: (id: string) => void;
  /** Suspend an RE account */
  suspendAccount: (id: string, reason: string, duration: string) => void;
  /** Reactivate a suspended RE account */
  reactivateAccount: (id: string) => void;
  /** Set verdict on a dispute */
  setVerdict: (id: string, verdict: "RESOLVED_UPHELD" | "RESOLVED_DISMISSED", reason?: string) => void;
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
              verdict: verdict === "RESOLVED_UPHELD" ? "UPHELD" : "DISMISSED",
              resolvedAt: new Date().toISOString(),
              resolvedBy: "Admin",
              resolvedReason: reason,
            }
          : d
      ),
    })),
}));
