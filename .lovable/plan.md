

## EcoConnect Admin Portal — Implementation Plan

### 1. Foundation & Layout
- **Theme system**: CSS custom properties for light (white-green, clean SaaS) and dark (deep green + warm amber accents) modes. Toggle persists to `localStorage("eco-theme")`. Load **Syne** (headings) + **DM Sans** (body) from Google Fonts.
- **Admin layout component** (`src/components/admin/AdminLayout.tsx`): Fixed 240px sidebar on desktop, top header + bottom nav on mobile. Header has logo, live clock, dark mode toggle, notification bell (badge count 3), admin avatar.
- **Sidebar**: EcoConnect logo + "Admin" badge, 5 nav items (Tổng quan, Tài khoản RE, Tranh chấp, Người dùng [greyed/Phase 2], Cài đặt [greyed/Phase 2]). Active route highlighted.
- **Mobile bottom nav**: 4 items max (Tổng quan, Tài khoản, Tranh chấp, Cài đặt).
- **Routes**: `/admin` → redirect to `/admin/dashboard`, plus `/admin/accounts`, `/admin/disputes`, `/admin/settings`. All under admin layout. No changes to existing routes.

### 2. Dashboard Page (`/admin/dashboard`)
- **Mock data** in `src/mock/admin-stats.ts` with systemStats, weeklyTrend, rePerformance, recentAlerts, wasteBreakdown, monthlyVolume.
- **Row 1**: 4 KPI cards (Tổng báo cáo, Tỷ lệ thu gom, Tranh chấp mở, RE hoạt động) with icons, big numbers, delta chips. Count-up animation on mount.
- **Row 2**: Weekly trend stacked bar chart (Recharts) + Recent alerts list (color-coded by type).
- **Row 3**: RE Performance table with status badges, sortable, row click → navigate to accounts.
- **Row 4 (analytics)**: Waste breakdown donut chart, monthly volume line chart, top dispute REs horizontal bar chart.
- **Animations**: Framer Motion staggered fade+slide-up for cards, chart grow animations.

### 3. Accounts Page (`/admin/accounts`)
- **Mock data** in `src/mock/admin-re-accounts.ts` with 8 RE accounts.
- **Filter tabs** (All/Active/Pending/Suspended) + search + sort dropdown.
- **Pending banner** callout with quick-approve buttons.
- **Card grid** (1 col mobile, 2 col desktop): RE name, ward, status badge, manager info, stats, action buttons.
- **Approve/Reject modal**: Animated, shows RE summary. Rejection requires reason text.
- **Suspend modal**: Reason + duration select (7d/30d/indefinite), warning message.
- **Zustand store** (`src/store/useAdminStore.ts`): manages RE accounts state, approve/reject/suspend actions. Toast notifications on state changes.

### 4. Disputes Page (`/admin/disputes`)
- **Mock data** in `src/mock/admin-disputes.ts` with 5 disputes.
- **Filter tabs** (All/Open/Resolved) + stats chips.
- **Dispute cards**: Priority chip, citizen claim preview, address, status badge, "Xem xét" button.
- **Detail split-panel**: Slides in from right on desktop (60% width), bottom sheet on mobile. Shows evidence comparison (gradient placeholders for photos), citizen claim in amber quote block.
- **Verdict flow**: 3 buttons (Upheld/Dismissed/Escalated[Phase 2]). Upheld → confirmation modal. Dismissed → requires reason (min 20 chars). Updates Zustand store + toast.
- **Animations**: Spring panel slide-in, verdict animations, status badge transitions.

### 5. Settings Page (`/admin/settings`)
- Admin profile card with role badge.
- Light/dark toggle synced with header.
- Mock notification preference toggles.
- PWA section: QR code placeholder + app URL + copy link + install button.
- System info: version, last deploy date.
- Danger zone: mock CSV export button.

### 6. PWA (Basic)
- `manifest.json` in `/public` with EcoConnect Admin branding, theme color `#1DB36E`.
- Small install-app banner at bottom on first visit, dismiss persists to localStorage. No service worker (just installability).

### 7. Cross-cutting
- **Responsive**: All pages work at 390px. Tables scroll horizontally. Charts 100% width. 44px touch targets.
- **Animation consistency**: Framer Motion page transitions, spring modals, layout animations on status changes, hover effects on table rows.
- **Theme consistency**: All Recharts charts respect current theme via CSS variables. Modals/toasts themed in both modes.
- **TypeScript strict**, JSDoc on every component, `// Phase 2` comments on placeholders.

