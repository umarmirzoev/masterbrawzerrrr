import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Languages,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Phone,
  User,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function Header() {
  const { languageShortLabel, setLanguage, t } = useLanguage();
  const { user, signOut, loading, getDashboardPath } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", labelKey: "navHome", icon: null },
    { path: "/categories", labelKey: "navCategories", icon: Wrench },
    { path: "/masters", labelKey: "navMasters", icon: User },
    { path: "/shop", labelKey: "navShop", icon: ShoppingBag },
    { path: "/about", labelKey: "navAbout", icon: null },
    { path: "/contacts", labelKey: "navContacts", icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-white border-b border-slate-50"
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              М
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
              Мастер ТЧ
            </span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative group ${
                  isActive(item.path)
                    ? "text-emerald-500"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t(item.labelKey)}
                <span className={`absolute bottom-1 left-4 right-4 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 transform origin-left ${isActive(item.path) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-4 mr-2">
               <a href="tel:+992979117007" className="flex items-center gap-2 text-slate-600 hover:text-emerald-500 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-black tracking-tight">+992 979 117 007</span>
               </a>
            </div>

            <Button
              className="hidden md:flex bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 h-11 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              Вызвать мастера
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl px-2.5 h-10 hover:bg-slate-50">
                  <Languages className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">{languageShortLabel}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[130px] rounded-xl">
                <DropdownMenuItem onClick={() => setLanguage("ru")} className="cursor-pointer font-medium">🇷🇺 {t("languageOptionRu")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("tj")} className="cursor-pointer font-medium">🇹🇯 {t("languageOptionTj")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")} className="cursor-pointer font-medium">🇬🇧 {t("languageOptionEn")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!loading && user && (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Button
                  onClick={() => navigate(getDashboardPath())}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl h-10 px-3 bg-slate-50 gap-1.5 hidden sm:flex"
                >
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-700">Кабинет</span>
                </Button>
                <Button
                  onClick={() => navigate(getDashboardPath())}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10 bg-slate-50 sm:hidden"
                >
                  <User className="w-5 h-5 text-slate-600" />
                </Button>
              </div>
            )}

            {!loading && !user && (
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                size="sm"
                className="hidden md:flex rounded-xl h-10 px-4 font-bold border-slate-200 text-slate-700"
              >
                Войти
              </Button>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl h-10 w-10 bg-slate-50">
                  <Menu className="w-5 h-5 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">М</div>
                        <span className="text-lg font-bold text-slate-900 tracking-tight">Мастер ТЧ</span>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9"><X className="w-5 h-5" /></Button>
                      </SheetClose>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SheetClose asChild key={item.path}>
                          <Link
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                              isActive(item.path) ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {Icon && <Icon className="w-5 h-5" />}
                              <span className="font-bold text-sm">{t(item.labelKey)}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-30" />
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>
                  <div className="p-4 border-t border-slate-50 space-y-2">
                    {user ? (
                      <>
                        <SheetClose asChild>
                          <Button
                            onClick={() => navigate(getDashboardPath())}
                            className="w-full rounded-2xl h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2"
                          >
                            <User className="w-5 h-5" />
                            Кабинет
                          </Button>
                        </SheetClose>
                        <Button onClick={signOut} variant="outline" className="w-full rounded-2xl h-14 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-2">
                          <LogOut className="w-5 h-5" />
                          {t("logout")}
                        </Button>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <Button
                          onClick={() => navigate("/auth")}
                          className="w-full rounded-2xl h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2"
                        >
                          <User className="w-5 h-5" />
                          Войти / Регистрация
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
