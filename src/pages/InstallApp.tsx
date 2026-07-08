import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const InstallApp = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-14 shadow-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold mb-4">Установка приложения</p>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">Приложение в процессе</h1>
          <p className="text-lg leading-8 text-slate-600 mb-10">
            Мы сейчас работаем над приложением. Скоро оно будет доступно для установки и запуска.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/">
              <Button className="rounded-full bg-emerald-600 px-8 py-4 text-white hover:bg-emerald-700">На главную</Button>
            </Link>
            <Link to="/contacts">
              <Button variant="outline" className="rounded-full px-8 py-4">Связаться с нами</Button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default InstallApp;
