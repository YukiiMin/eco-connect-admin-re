import { create } from "zustand";
import { requests as initialRequests, type CollectionRequest } from "@/mock/re-requests";
import { collectors as initialCollectors, type Collector } from "@/mock/re-collectors";
import { pointRuleSets as initialPointRuleSets, type PointRuleSet, type PointRule } from "@/mock/re-config";

interface REState {
  requests: CollectionRequest[];
  collectors: Collector[];
  pointRuleSets: PointRuleSet[];
  /** Approve a pending request → ACCEPTED */
  approveRequest: (id: string) => void;
  /** Reject a pending request */
  rejectRequest: (id: string, reason: string) => void;
  /** Batch dispatch: move all ACCEPTED in an area to QUEUED_FOR_DISPATCH */
  batchDispatch: (area: string) => void;
  /** Assign a collector to a request */
  assignCollector: (requestId: string, collectorName: string) => void;
  /** Update request status */
  updateRequestStatus: (id: string, status: CollectionRequest["status"]) => void;
  /** Add a new collector */
  addCollector: (collector: Collector) => void;
  /** Update point rule in a rule set */
  updatePointRule: (ruleSetId: string, ruleId: string, updates: Partial<PointRule>) => void;
  /** Add point rule to a set */
  addPointRule: (ruleSetId: string, rule: PointRule) => void;
  /** Delete point rule from a set */
  deletePointRule: (ruleSetId: string, ruleId: string) => void;
  /** Activate a draft rule set */
  activateRuleSet: (id: string) => void;
  /** Create new draft rule set */
  createDraftRuleSet: (name: string, effectiveDate: string) => void;
  /** Update misclassification penalty */
  updatePenalty: (ruleSetId: string, penalty: number) => void;
}

/** RE Manager Zustand store */
export const useREStore = create<REState>((set) => ({
  requests: [...initialRequests],
  collectors: [...initialCollectors],
  pointRuleSets: [...initialPointRuleSets],

  approveRequest: (id) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status: "ACCEPTED" as const } : r
      ),
    })),

  rejectRequest: (id, reason) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status: "REJECTED" as const, rejectedReason: reason } : r
      ),
    })),

  batchDispatch: (area) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.area === area && r.status === "ACCEPTED"
          ? { ...r, status: "QUEUED_FOR_DISPATCH" as const }
          : r
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

  updatePointRule: (ruleSetId, ruleId, updates) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) =>
        rs.id === ruleSetId
          ? { ...rs, rules: rs.rules.map((r) => r.id === ruleId ? { ...r, ...updates } : r) }
          : rs
      ),
    })),

  addPointRule: (ruleSetId, rule) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) =>
        rs.id === ruleSetId ? { ...rs, rules: [...rs.rules, rule] } : rs
      ),
    })),

  deletePointRule: (ruleSetId, ruleId) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) =>
        rs.id === ruleSetId ? { ...rs, rules: rs.rules.filter((r) => r.id !== ruleId) } : rs
      ),
    })),

  activateRuleSet: (id) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) => ({
        ...rs,
        status: rs.id === id ? "ACTIVE" as const : rs.status === "ACTIVE" ? "ARCHIVED" as const : rs.status,
      })),
    })),

  createDraftRuleSet: (name, effectiveDate) =>
    set((s) => {
      const activeSet = s.pointRuleSets.find((rs) => rs.status === "ACTIVE");
      const newId = `PRS${String(s.pointRuleSets.length + 1).padStart(3, "0")}`;
      return {
        pointRuleSets: [...s.pointRuleSets, {
          id: newId,
          name,
          status: "DRAFT" as const,
          effectiveDate,
          misclassificationPenalty: activeSet?.misclassificationPenalty ?? -1,
          rules: activeSet?.rules.map((r, i) => ({ ...r, id: `PR${String(100 + i).padStart(3, "0")}` })) ?? [],
        }],
      };
    }),

  updatePenalty: (ruleSetId, penalty) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) =>
        rs.id === ruleSetId ? { ...rs, misclassificationPenalty: penalty } : rs
      ),
    })),
}));
