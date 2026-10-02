import { motion } from "framer-motion";
import { Apple, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { tx } from "@/lib/localizeNames";

const APP_STORE_URL = "https://apps.apple.com/app/id6810603725";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=tj.masterchas.masterchas_app";

// Страница «Скачать приложение»: ссылки в App Store и Google Play.
const InstallApp = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-14"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
            <Smartphone className="h-10 w-10" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
            {tx("Приложение Master.TJ", "Master.TJ app", "Барномаи Master.TJ")}
          </p>
          <h1 className="mb-4 text-3xl font-black text-slate-900 dark:text-white sm:text-5xl">
            {tx("Скачайте приложение", "Download the app", "Барномаро боргирӣ кунед")}
          </h1>
          <p className="mb-10 text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            {tx(
              "Вызывайте мастера, следите за заказом и общайтесь в чате прямо с телефона.",
              "Call a master, track your order and chat right from your phone.",
              "Усторо даъват кунед, фармоишро пайгирӣ кунед ва аз телефон чат кунед.",
            )}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
            >
              <Apple className="h-7 w-7" />
              <span className="text-left leading-tight">
                <span className="block text-[10px] opacity-80">{tx("Загрузите в", "Download on the", "Боргирӣ аз")}</span>
                <span className="block text-lg font-bold">App Store</span>
              </span>
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 text-white transition-transform hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1Zm11.6 11.6 2.4 2.4-11.2 6.4 8.8-8.8Zm0-2.8L6.4 1.8l11.2 6.4-2.4 2.4Zm3.7.6 2.5 1.4c.8.5.8 1.6 0 2.1l-2.5 1.4-2.7-2.5 2.7-2.4Z" />
              </svg>
              <span className="text-left leading-tight">
                <span className="block text-[10px] opacity-80">{tx("Доступно в", "Get it on", "Дастрас дар")}</span>
                <span className="block text-lg font-bold">Google Play</span>
              </span>
            </a>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default InstallApp;
