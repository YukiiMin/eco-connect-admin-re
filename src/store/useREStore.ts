import { create } from "zustand";
import { requests as initialRequests, type CollectionRequest } from "@/mock/re-requests";
import { collectors as initialCollectors, type Collector } from "@/mock/re-collectors";
import { pointRules as initialPointRules, type PointRule } from "@/mock/re-config";

interface REState {
  /** Collection requests */
  requests: CollectionRequest[];
  /** Collectors list */
  collectors: Collector[];
  /** Point rules */
  pointRules: PointRule[];
  /** Approve a pending request → QUEUED */
  approveRequest: (id: string) => void;
  /** Reject a pending request */
  rejectRequest: (id: string, reason: string) => void;
  /** Assign a collector to a queued request */
  assignCollector: (requestId: string, collectorName: string) => void;
  /** Update request status */
  updateRequestStatus: (id: string, status: CollectionRequest["status"]) => void;
  /** Add a new collector */
  addCollector: (collector: Collector) => void;
  /** Update point rules */
  updatePointRule: (id: string, updates: Partial<PointRule>) => void;
  /** Add point rule */
  addPointRule: (rule: PointRule) => void;
  /** Delete point rule */
  deletePointRule: (id: string) => void;
}

/** RE Manager Zustand store */
export const useREStore = create<REState>((set) => ({
  requests: [...initialRequests],
  collectors: [...initialCollectors],
  pointRules: [...initialPointRules],

  approveRequest: (id) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status: "QUEUED" as const } : r
      ),
    })),

  rejectRequest: (id, reason) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status: "REJECTED" as const, rejectedReason: reason } : r
      ),
    })),

  assignCollector: (requestId, collectorName) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId ? { ...r, status: "ASSIGNED" as const, assignedTo: collectorName } : r
      ),
      collectors: s.collectors.map((c) =>
        c.name === collectorName ? { ...c, todayTasks: c.todayTasks + 1 } : c
      ),
    })),

  updateRequestStatus: (id, status) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),

  addCollector: (collector) =>
    set((s) => ({ collectors: [...s.collectors, collector] })),

  updatePointRule: (id, updates) =>
    set((s) => ({
      pointRules: s.pointRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  addPointRule: (rule) =>
    set((s) => ({ pointRules: [...s.pointRules, rule] })),

  deletePointRule: (id) =>
    set((s) => ({ pointRules: s.pointRules.filter((r) => r.id !== id) })),
}));
