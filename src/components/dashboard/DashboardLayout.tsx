import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, ChevronRight, Home, Bell, X } from "lucide-react";
import { getLanguageLocale } from "@/lib/i18n";
import { resolveNotificationText } from "@/lib/notifications";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
}

// Общий layout кабинетов формирует сайдбар, уведомления и контейнер для внутреннего контента.
export default function DashboardLayout({ children, title, navItems }: DashboardLayoutProps) {
  const { signOut, profile, user } = useAuth();
  const { language, t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead } = useNotifications(user?.id);
  const [showNotifs, setShowNotifs] = useState(false);
  // ref на обёртку (колокольчик + панель): иначе клик по колокольчику сначала закрывал, а потом снова открывал панель.
  const notifRef = useRef<HTMLDivElement>(null);

  // Закрываем панель уведомлений при клике вне неё.
  useEffect(() => {
    if (!showNotifs) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifs]);

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border/50">
        <Link to="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-emerald-200/60 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]">
            М
          </div>
          <div>
            <span className="text-base font-bold text-foreground block leading-tight">{t("brandName")}</span>
            <span className="text-[11px] text-muted-foreground">{t("dashboardControlPanel")}</span>
          </div>
        </Link>
      </div>

      {/* Profile mini */}
      {profile?.full_name && (
        <div className="px-5 py-3 border-b border-border/50">
          <div className="group flex items-center gap-3 rounded-xl p-1 -m-1 transition-colors hover:bg-accent/60">
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center ring-2 ring-emerald-100 transition-transform duration-300 group-hover:scale-110 [&>span]:text-white">
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
              <span className="text-sm font-bold text-primary">
                {profile.full_name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile.full_name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{profile.phone || ""}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-auto">
        <Link
          to="/"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1 transition-all duration-300 text-sm"
        >
          <Home className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          <span>{t("dashboardHomeLabel")}</span>
        </Link>

        <div className="pt-2 pb-1 px-3">
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            {t("dashboardMenuLabel")}
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 text-sm group ${
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dash-nav-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-emerald-500 shadow-md shadow-emerald-200/60"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-8deg]" />
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="relative flex items-center gap-1.5">
                {item.badge && item.badge > 0 && (
                  <Badge className={`h-5 min-w-[20px] px-1.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                    {item.badge}
                  </Badge>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-border/50">
        <Button variant="ghost" onClick={signOut} className="group w-full justify-start gap-3 text-muted-foreground rounded-xl transition-colors hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {t("logout")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border/50 flex-col bg-card shadow-sm">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <motion.h1 key={title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-bold text-foreground">{title}</motion.h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost" size="icon"
                className={`h-9 w-9 relative rounded-full transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-600 ${unreadCount > 0 ? "[&>svg]:animate-[wiggle_1.2s_ease-in-out_infinite]" : ""}`}
                onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) markAllRead(); }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60" />
                    <span className="relative inline-flex w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                )}
              </Button>
              <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-2xl shadow-xl z-50"
                >
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <span className="font-semibold text-sm">{t("notifTitle")}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNotifs(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">{t("notifEmpty")}</p>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {notifications.slice(0, 10).map((notification) => {
                        const content = resolveNotificationText(notification, t);

                        return (
                        <div key={notification.id} className={`p-3 transition-colors hover:bg-accent/60 ${!notification.read ? "bg-primary/5" : ""}`}>
                          <p className="text-sm font-medium text-foreground">{content.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{content.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(notification.created_at).toLocaleString(getLanguageLocale(language), {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto overflow-x-hidden pb-20 md:pb-6">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
