import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Scale,
  Users,
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

/** Nav item configuration */
interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  disabled?: boolean;
  phase2?: boolean;
}

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Tài khoản RE", icon: Building2, path: "/admin/accounts" },
  { label: "Tranh chấp", icon: Scale, path: "/admin/disputes" },
  { label: "Người dùng", icon: Users, path: "/admin/users", disabled: true, phase2: true }, // Phase 2
  { label: "Cài đặt", icon: Settings, path: "/admin/settings" },
];

const mobileNavItems = navItems.filter((n) => !n.phase2).slice(0, 4);

/**
 * AdminLayout — layout wrapper for all /admin/* pages.
 * Desktop: fixed 240px sidebar + scrolling main. Mobile: header + bottom nav.
 */
const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [clock, setClock] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(() =>
    localStorage.getItem("eco-install-dismissed") === "true"
  );

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const dismissInstall = () => {
    setInstallDismissed(true);
    localStorage.setItem("eco-install-dismissed", "true");
  };

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 border-r border-border bg-sidebar-background z-40">
        {/* Logo */}
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-heading font-bold text-base text-sidebar-foreground">EcoConnect</span>
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">Admin</Badge>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.disabled ? "#" : item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive(item.path)
                  ? "bg-primary/10 text-primary"
                  : item.disabled
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {item.phase2 && (
                <span className="ml-auto text-[10px] text-muted-foreground">Phase 2</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User avatar bottom */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              NQ
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">Nguyễn Quản Trị</div>
              <div className="text-xs text-muted-foreground">Platform Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-3">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Left: logo mark (mobile) + title */}
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary lg:hidden" />
            <span className="font-heading font-semibold text-sm text-foreground hidden sm:inline">
              Admin Platform
            </span>
          </div>

          {/* Center: clock */}
          <div className="flex-1 text-center">
            <span className="font-heading text-sm font-medium text-muted-foreground tabular-nums">
              {clock.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          {/* Right: toggles */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9" aria-label="Toggle theme">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                3
              </span>
            </Button>

            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ml-1">
              NQ
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
                        : "text-foreground hover:bg-accent"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
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
                "flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]",
                isActive(item.path) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
            </Link>
          ))}
        </nav>

        {/* PWA install banner */}
        {!installDismissed && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-60 p-3 bg-primary text-primary-foreground flex items-center justify-between z-30"
          >
            <span className="text-sm font-medium">📱 Cài đặt EcoConnect Admin trên thiết bị của bạn</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={dismissInstall} className="h-8 text-xs">
                Bỏ qua
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
