/** Centralized status & waste type configuration — single source of truth for colors and labels */

export const STATUS_CONFIG = {
  PENDING:             { label: 'Chờ duyệt',        color: 'bg-status-pending/15 text-status-pending' },
  ACCEPTED:            { label: 'Đã chấp nhận',     color: 'bg-status-accepted/15 text-status-accepted' },
  ASSIGNED:            { label: 'Đã gán',            color: 'bg-status-assigned/15 text-status-assigned' },
  QUEUED:              { label: 'Đã xếp hàng',      color: 'bg-status-queued-dispatch/15 text-status-queued-dispatch' },
  QUEUED_FOR_DISPATCH: { label: 'Chờ xuất binh',    color: 'bg-status-queued-dispatch/15 text-status-queued-dispatch' },
  ON_THE_WAY:          { label: 'Đang di chuyển',   color: 'bg-status-on-the-way/15 text-status-on-the-way' },
  COLLECTED:           { label: 'Đã thu gom',       color: 'bg-status-collected/15 text-status-collected' },
  VERIFIED:            { label: 'Đã xác nhận',      color: 'bg-status-verified/15 text-status-verified' },
  REJECTED:            { label: 'Từ chối',           color: 'bg-status-rejected/15 text-status-rejected' },
  FAILED:              { label: 'Thu gom thất bại',  color: 'bg-status-failed/15 text-status-failed' },
  DISPUTED:            { label: 'Đang tranh chấp',  color: 'bg-status-disputed/15 text-status-disputed' },
  CANCELLED:           { label: 'Đã hủy',            color: 'bg-status-cancelled/15 text-status-cancelled' },
  REJECTED_BY_COLLECTOR: { label: 'Collector từ chối', color: 'bg-status-disputed/15 text-status-disputed' },
} as const;

export const WASTE_CONFIG = {
  RECYCLABLE: { label: 'Tái chế',    color: 'bg-waste-recyclable/15 text-waste-recyclable', hex: '#5B8DEF' },
  ORGANIC:    { label: 'Hữu cơ',    color: 'bg-waste-organic/15 text-waste-organic',       hex: '#1DB36E' },
  HAZARDOUS:  { label: 'Nguy hại',  color: 'bg-waste-hazardous/15 text-waste-hazardous',   hex: '#E74C3C' },
  MIXED:      { label: 'Hỗn hợp',   color: 'bg-waste-bulky/15 text-waste-bulky',           hex: '#F5A623' },
  BULKY:      { label: 'Cồng kềnh', color: 'bg-waste-bulky/15 text-waste-bulky',           hex: '#9B7FD4' },
} as const;

export type StatusKey = keyof typeof STATUS_CONFIG;
export type WasteKey = keyof typeof WASTE_CONFIG;

/** Get status badge classes */
export function getStatusClasses(status: string): string {
  return (STATUS_CONFIG as Record<string, { color: string }>)[status]?.color ?? 'bg-muted text-muted-foreground';
}

/** Get status label */
export function getStatusLabel(status: string): string {
  return (STATUS_CONFIG as Record<string, { label: string }>)[status]?.label ?? status;
}

/** Get waste type badge classes */
export function getWasteClasses(wasteType: string): string {
  return (WASTE_CONFIG as Record<string, { color: string }>)[wasteType]?.color ?? 'bg-muted text-muted-foreground';
}

/** Get waste type label */
export function getWasteLabel(wasteType: string): string {
  return (WASTE_CONFIG as Record<string, { label: string }>)[wasteType]?.label ?? wasteType;
}
