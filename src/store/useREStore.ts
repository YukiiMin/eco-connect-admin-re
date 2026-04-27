import { create } from "zustand";
import { requests as initialRequests, type CollectionRequest } from "@/mock/re-requests";
import { collectors as initialCollectors, type Collector } from "@/mock/re-collectors";
import { pointRuleSets as initialPointRuleSets, type PointRuleSet, type PointRule } from "@/mock/re-config";
import {
  collectorHubs as initialHubs,
  collectorTeams as initialTeams,
  collectorStaff as initialStaff,
  enterpriseProfile as initialEnterprise,
  type EnterpriseHub,
  type CollectorTeam,
  type CollectorStaff,
} from "@/mock/re-enterprise";

interface REState {
  // Legacy
  requests: CollectionRequest[];
  collectors: Collector[];
  pointRuleSets: PointRuleSet[];

  // Enterprise hierarchy
  enterprise: typeof initialEnterprise;
  hubs: EnterpriseHub[];
  teams: CollectorTeam[];
  staff: CollectorStaff[];

  /** Approve a pending request → ACCEPTED */
  approveRequest: (id: string) => void;
  /** Reject a pending request */
  rejectRequest: (id: string, reason: string) => void;
  /** Pending → QUEUED (Enterprise queues for assignment) */
  queueReport: (id: string) => void;
  /** Batch dispatch (legacy) */
  batchDispatch: (area: string) => void;
  /** Assign request to a Team (Queued → ASSIGNED) */
  assignToTeam: (requestId: string, teamId: string) => void;
  assignCollector: (requestId: string, collectorName: string) => void;
  updateRequestStatus: (id: string, status: CollectionRequest["status"]) => void;
  /** Enterprise verifies a COLLECTED/FAILED report → VERIFIED (or keeps FAILED) */
  completeReport: (id: string) => void;

  // Collector legacy
  addCollector: (collector: Collector) => void;

  // Point rules
  updatePointRule: (ruleSetId: string, ruleId: string, updates: Partial<PointRule>) => void;
  addPointRule: (ruleSetId: string, rule: PointRule) => void;
  deletePointRule: (ruleSetId: string, ruleId: string) => void;
  activateRuleSet: (id: string) => void;
  createDraftRuleSet: (name: string, effectiveDate: string) => void;
  updatePenalty: (ruleSetId: string, penalty: number) => void;

  // ===== Enterprise actions =====
  /** Move a staff to a team (drag-drop). Enforces same-hub rule. Pass null to remove from team (back to pool). */
  moveStaffToTeam: (staffId: string, targetTeamId: string | null) => boolean;
  /** Create a new team in a hub */
  createTeam: (hubId: string, payload: { name: string; zone: string; vehiclePlate: string; schedule: string[] }) => void;
  /** Update team metadata */
  updateTeam: (teamId: string, updates: Partial<CollectorTeam>) => void;
  /** Inactivate team */
  inactivateTeam: (teamId: string) => void;
  /** Add new staff to a hub (optionally to a team) */
  addStaff: (hubId: string, payload: { name: string; phone: string; teamId?: string | null; role?: "LEADER" | "MEMBER" }) => void;
  /** Deactivate staff (soft delete) */
  deactivateStaff: (staffId: string) => void;
}

export const useREStore = create<REState>((set, get) => ({
  requests: [...initialRequests],
  collectors: [...initialCollectors],
  pointRuleSets: [...initialPointRuleSets],

  enterprise: { ...initialEnterprise },
  hubs: [...initialHubs],
  teams: [...initialTeams],
  staff: [...initialStaff],

  approveRequest: (id) =>
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, status: "ACCEPTED" as const } : r)),
    })),

  rejectRequest: (id, reason) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status: "REJECTED" as const, rejectedReason: reason } : r,
      ),
    })),

  queueReport: (id) =>
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, status: "QUEUED" as const } : r)),
    })),

  batchDispatch: (area) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.area === area && r.status === "ACCEPTED"
          ? { ...r, status: "QUEUED_FOR_DISPATCH" as const }
          : r,
      ),
    })),

  assignToTeam: (requestId, teamId) =>
    set((s) => {
      const team = s.teams.find((t) => t.id === teamId);
      const teamLabel = team ? team.name : teamId;
      return {
        requests: s.requests.map((r) =>
          r.id === requestId ? { ...r, status: "ASSIGNED" as const, assignedTo: teamLabel } : r,
        ),
        teams: s.teams.map((t) => (t.id === teamId ? { ...t, todayAssigned: t.todayAssigned + 1 } : t)),
      };
    }),

  assignCollector: (requestId, collectorName) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId ? { ...r, status: "ASSIGNED" as const, assignedTo: collectorName } : r,
      ),
      collectors: s.collectors.map((c) =>
        c.name === collectorName ? { ...c, todayTasks: c.todayTasks + 1 } : c,
      ),
    })),

  updateRequestStatus: (id, status) =>
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)),
    })),

  completeReport: (id) =>
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, status: "VERIFIED" as const } : r)),
    })),

  addCollector: (collector) => set((s) => ({ collectors: [...s.collectors, collector] })),

  updatePointRule: (ruleSetId, ruleId, updates) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) =>
        rs.id === ruleSetId
          ? { ...rs, rules: rs.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)) }
          : rs,
      ),
    })),

  addPointRule: (ruleSetId, rule) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) =>
        rs.id === ruleSetId ? { ...rs, rules: [...rs.rules, rule] } : rs,
      ),
    })),

  deletePointRule: (ruleSetId, ruleId) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) =>
        rs.id === ruleSetId ? { ...rs, rules: rs.rules.filter((r) => r.id !== ruleId) } : rs,
      ),
    })),

  activateRuleSet: (id) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) => ({
        ...rs,
        status:
          rs.id === id
            ? ("ACTIVE" as const)
            : rs.status === "ACTIVE"
              ? ("ARCHIVED" as const)
              : rs.status,
      })),
    })),

  createDraftRuleSet: (name, effectiveDate) =>
    set((s) => {
      const activeSet = s.pointRuleSets.find((rs) => rs.status === "ACTIVE");
      const newId = `PRS${String(s.pointRuleSets.length + 1).padStart(3, "0")}`;
      return {
        pointRuleSets: [
          ...s.pointRuleSets,
          {
            id: newId,
            name,
            status: "DRAFT" as const,
            effectiveDate,
            misclassificationPenalty: activeSet?.misclassificationPenalty ?? -1,
            rules:
              activeSet?.rules.map((r, i) => ({ ...r, id: `PR${String(100 + i).padStart(3, "0")}` })) ?? [],
          },
        ],
      };
    }),

  updatePenalty: (ruleSetId, penalty) =>
    set((s) => ({
      pointRuleSets: s.pointRuleSets.map((rs) =>
        rs.id === ruleSetId ? { ...rs, misclassificationPenalty: penalty } : rs,
      ),
    })),

  // ===== Enterprise actions =====
  moveStaffToTeam: (staffId, targetTeamId) => {
    const state = get();
    const staff = state.staff.find((s) => s.id === staffId);
    if (!staff) return false;
    if (targetTeamId) {
      const team = state.teams.find((t) => t.id === targetTeamId);
      if (!team) return false;
      // Cross-hub blocked → Phase 2
      if (team.hubId !== staff.hubId) return false;
    }
    set((s) => ({
      staff: s.staff.map((st) => (st.id === staffId ? { ...st, teamId: targetTeamId } : st)),
    }));
    return true;
  },

  createTeam: (hubId, payload) =>
    set((s) => {
      const newId = `TEAM${String(s.teams.length + 1).padStart(3, "0")}`;
      const newTeam: CollectorTeam = {
        id: newId,
        hubId,
        name: payload.name,
        leaderId: "",
        zone: payload.zone,
        schedule: payload.schedule,
        vehiclePlate: payload.vehiclePlate,
        status: "ACTIVE",
        createdAt: new Date().toISOString().slice(0, 10),
        todayAssigned: 0,
        todayCompleted: 0,
        todayFailed: 0,
        monthCompleted: 0,
      };
      return {
        teams: [...s.teams, newTeam],
        hubs: s.hubs.map((h) => (h.id === hubId ? { ...h, teamCount: h.teamCount + 1 } : h)),
      };
    }),

  updateTeam: (teamId, updates) =>
    set((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
    })),

  inactivateTeam: (teamId) =>
    set((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, status: "INACTIVE" as const } : t)),
    })),

  addStaff: (hubId, payload) =>
    set((s) => {
      const newId = `ST${String(s.staff.length + 1).padStart(3, "0")}`;
      const newStaff: CollectorStaff = {
        id: newId,
        hubId,
        teamId: payload.teamId ?? null,
        name: payload.name,
        phone: payload.phone,
        joinDate: new Date().toISOString().slice(0, 10),
        role: payload.role ?? "MEMBER",
        status: "ACTIVE",
        todayTasks: 0,
        completedToday: 0,
        onTime: 100,
        streak: 0,
        totalAllTime: 0,
      };
      return {
        staff: [...s.staff, newStaff],
        hubs: s.hubs.map((h) => (h.id === hubId ? { ...h, staffCount: h.staffCount + 1 } : h)),
      };
    }),

  deactivateStaff: (staffId) =>
    set((s) => ({
      staff: s.staff.map((st) =>
        st.id === staffId ? { ...st, status: "INACTIVE" as const, teamId: null } : st,
      ),
    })),
}));
