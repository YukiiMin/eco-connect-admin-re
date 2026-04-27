import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  Users,
  Building2,
  UsersRound,
  BarChart3,
  Star,
  Settings,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Leaf,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useREStore } from "@/store/useREStore";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  disabled?: boolean;
  phase2?: boolean;
}

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: LayoutDashboard, path: "/re/dashboard" },
  { label: "Báo cáo", icon: ClipboardList, path: "/re/queue" },
  { label: "Tracking", icon: Activity, path: "/re/dispatch" },
  { label: "Cơ sở", icon: Building2, path: "/re/hubs" },
  { label: "Đội thu gôm", icon: UsersRound, path: "/re/teams" },
  { label: "Nhân sự", icon: Users, path: "/re/collectors" },
  { label: "Phân tích", icon: BarChart3, path: "/re/analytics" },
  { label: "Điểm thưởng", icon: Star, path: "/re/points" },
  { label: "Cấu hình", icon: Settings, path: "/re/config" },
];

const mobileNavItems: NavItem[] = [
  { label: "Tổng quan", icon: LayoutDashboard, path: "/re/dashboard" },
  { label: "Báo cáo", icon: ClipboardList, path: "/re/queue" },
  { label: "Tracking", icon: Activity, path: "/re/dispatch" },
  { label: "Đội", icon: UsersRound, path: "/re/teams" },
];

/**
 * RELayout — layout wrapper for all /re/* pages.
 * Sidebar always uses dark slate theme regardless of light/dark mode.
 */
const RELayout: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const enterprise = useREStore((s) => s.enterprise);
  const [clock, setClock] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="min-h-screen flex bg-background font-body">
      {/* Desktop Sidebar — always dark slate */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 border-r border-sidebar-border bg-sidebar z-40">
        {/* Logo */}
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <span className="font-heading font-bold text-base text-sidebar-foreground">EcoConnect</span>
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-sidebar-accent text-sidebar-accent-foreground border-0">RE</Badge>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.disabled ? "#" : item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive(item.path)
                  ? "bg-sidebar-primary/15 text-sidebar-primary"
                  : item.disabled
                  ? "text-sidebar-foreground/30 cursor-not-allowed"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon className={cn("w-[18px] h-[18px] transition-transform duration-200", isActive(item.path) && "scale-110")} />
              <span>{item.label}</span>
              {item.phase2 && (
                <span className="ml-auto text-[10px] text-sidebar-foreground/40">Phase 2</span>
              )}
            </Link>
          ))}
        </nav>

        {/* RE info bottom */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm font-bold text-sidebar-primary">
              LM
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">{reInfo.manager}</div>
              <div className="text-xs text-sidebar-foreground/50 truncate">{reInfo.ward}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-3">
          <button
            className="lg:hidden p-2 -ml-2 text-foreground active:scale-95 transition-transform"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary lg:hidden" />
            <span className="font-heading font-semibold text-sm text-foreground hidden sm:inline">
              RE Manager
            </span>
          </div>

          <div className="flex-1 text-center">
            <span className="font-mono text-sm font-medium text-muted-foreground tabular-nums">
              {clock.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost" size="icon" onClick={toggleTheme}
              className="h-9 w-9 hover:scale-105 active:scale-95 transition-transform"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9 relative hover:scale-105 active:scale-95 transition-transform" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold animate-pulse">
                4
              </span>
            </Button>

            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ml-1">
              LM
            </div>
          </div>
        </header>

        {/* Mobile dropdown nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="lg:hidden border-b border-border bg-background overflow-hidden"
            >
              <nav className="p-3 space-y-0.5">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.disabled ? "#" : item.path}
                    onClick={(e) => {
                      if (item.disabled) e.preventDefault();
                      else setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : item.disabled
                        ? "text-muted-foreground/40"
                        : "text-foreground hover:bg-accent active:scale-[0.98]"
                    )}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-background/95 backdrop-blur flex items-center justify-around z-40">
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px] min-h-[44px] justify-center transition-all duration-200",
                isActive(item.path) ? "text-primary scale-105" : "text-muted-foreground active:scale-95"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default RELayout;
