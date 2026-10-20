import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useCart } from "@/hooks/useCart";
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
  ChevronRight,
  Phone,
  User,
  ShoppingBag,
  ShoppingCart,
  Wrench,
  Bot,
  Download,
  Apple,
} from "lucide-react";
import HeaderNav from "@/components/HeaderNav";
import { FlagIcon } from "@/components/FlagIcon";
import OrderModal from "@/components/OrderModal";

const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=tj.masterchas.masterchas_app";
const APP_STORE_URL = "https://apps.apple.com/app/id6810603725";

function AndroidGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
    </svg>
  );
}

export default function Header() {
  const { language, languageShortLabel, setLanguage, t } = useLanguage();
  const { user, signOut, loading, getDashboardPath } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  const handleDownloadAndroid = () => {
    window.open(GOOGLE_PLAY_URL, "_blank", "noopener,noreferrer");
  };

  const handleDownloadIphone = () => {
    window.open(APP_STORE_URL, "_blank", "noopener,noreferrer");
  };

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
    { path: "/ai-call", labelKey: "navAiCall", icon: Bot },
    { path: "/about", labelKey: "navAbout", icon: null },
    { path: "/contacts", labelKey: "navContacts", icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800"
          : "bg-white dark:bg-slate-950 border-b border-slate-50 dark:border-slate-800"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              М
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block whitespace-nowrap">
              Master.TJ
            </span>
          </Link>

          {/* Center Navigation */}
          <HeaderNav items={navItems} />

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden 2xl:flex items-center gap-2 mr-1">
               <a href="tel:+992979117007" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-black tracking-tight whitespace-nowrap">+992 979 117 007</span>
               </a>
            </div>

            <Button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="group relative hidden md:flex overflow-hidden bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 h-11 rounded-xl shadow-lg shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-300 active:scale-95"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Wrench className="relative h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
              <span className="relative">{t("heroOrderButton")}</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex gap-1.5 rounded-xl h-10 px-3 border-slate-200 dark:border-slate-700 font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs">{t("downloadApp")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl">
                <DropdownMenuItem onClick={handleDownloadAndroid} className="cursor-pointer font-medium gap-2">
                  <AndroidGlyph className="w-4 h-4 text-emerald-600" />
                  Android
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadIphone} className="cursor-pointer font-medium gap-2">
                  <Apple className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                  iPhone
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl px-2.5 h-10 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <FlagIcon code={(language === "tj" || language === "en" ? language : "ru") as "ru" | "tj" | "en"} className="h-3.5 w-5" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{languageShortLabel}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[130px] rounded-xl">
                <DropdownMenuItem onClick={() => setLanguage("ru")} className={`cursor-pointer gap-2.5 font-medium ${language === "ru" ? "bg-emerald-50 text-emerald-700" : ""}`}><FlagIcon code="ru" /> {t("languageOptionRu")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("tj")} className={`cursor-pointer gap-2.5 font-medium ${language === "tj" ? "bg-emerald-50 text-emerald-700" : ""}`}><FlagIcon code="tj" /> {t("languageOptionTj")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")} className={`cursor-pointer gap-2.5 font-medium ${language === "en" ? "bg-emerald-50 text-emerald-700" : ""}`}><FlagIcon code="en" /> {t("languageOptionEn")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <HeaderCartButton />

            {!loading && user && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate(getDashboardPath())}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl h-10 px-3 bg-slate-50 dark:bg-slate-800 gap-1.5 hidden sm:flex"
                >
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{t("cabinet")}</span>
                </Button>
                <Button
                  onClick={() => navigate(getDashboardPath())}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10 bg-slate-50 dark:bg-slate-800 sm:hidden"
                >
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </Button>
              </div>
            )}

            {!loading && !user && (
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                size="sm"
                className="hidden md:flex rounded-xl h-10 px-4 font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                {t("login")}
              </Button>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden rounded-xl h-10 w-10 bg-slate-50 dark:bg-slate-800">
                  <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">М</div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Master.TJ</span>
                    </div>
                  </div>
                  <div className="px-4 pt-4">
                    <SheetClose asChild>
                      <Button
                        type="button"
                        onClick={() => setOrderOpen(true)}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-emerald-200 gap-2 active:scale-95"
                      >
                        <Wrench className="h-5 w-5" /> {t("heroOrderButton")}
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SheetClose asChild key={item.path}>
                          <Link
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                              isActive(item.path) ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                  <div className="px-4 pb-2">
                    <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{t("downloadApp")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <SheetClose asChild>
                        <button
                          onClick={handleDownloadAndroid}
                          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <AndroidGlyph className="w-6 h-6 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Android</span>
                        </button>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          onClick={handleDownloadIphone}
                          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Apple className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">iPhone</span>
                        </button>
                      </SheetClose>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
                    {user ? (
                      <>
                        <SheetClose asChild>
                          <Button
                            onClick={() => navigate(getDashboardPath())}
                            className="w-full rounded-2xl h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2"
                          >
                            <User className="w-5 h-5" />
                            {t("cabinet")}
                          </Button>
                        </SheetClose>
                        <Button onClick={signOut} variant="outline" className="w-full rounded-2xl h-14 border-red-100 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 gap-2">
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
                          {t("loginRegister")}
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
      <OrderModal isOpen={orderOpen} onClose={() => setOrderOpen(false)} category={null} />
    </header>
  );
}

// Иконка корзины в шапке: счётчик товаров, подпрыгивает при добавлении товара.
function HeaderCartButton() {
  const { itemCount } = useCart();
  const location = useLocation();
  const controls = useAnimationControls();
  const prev = useRef(itemCount);
  const active = location.pathname === "/cart";

  useEffect(() => {
    if (itemCount > prev.current) {
      controls.start({
        y: [0, -8, 0, -3, 0],
        rotate: [0, -12, 10, -4, 0],
        transition: { duration: 0.6, ease: "easeOut" },
      });
    }
    prev.current = itemCount;
  }, [itemCount, controls]);

  const label = itemCount > 0 ? `Корзина: ${itemCount}` : "Корзина";

  return (
    <Link
      to="/cart"
      aria-label={label}
      title={label}
      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md hover:shadow-emerald-100 dark:hover:bg-emerald-500/10 ${
        active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      <motion.span animate={controls} className="inline-flex">
        <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      </motion.span>
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-500 to-teal-500 px-1 text-[10px] font-black text-white shadow-md shadow-emerald-300/60 dark:border-slate-950"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white dark:text-slate-900">
        {label}
      </span>
    </Link>
  );
}
