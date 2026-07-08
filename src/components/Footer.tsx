import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, MapPin, MessageCircle, Facebook, Send, Instagram } from "lucide-react";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0f172a] text-slate-400 py-16">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand and Description */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                М
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Мастер ТЧ</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Сервис вызова мастеров на дом в Душанбе. Электрика, сантехника, уборка, ремонт и многие другие услуги.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <SocialLink href="#" icon={<Send className="w-4 h-4" />} />
              <SocialLink href="#" icon={<Instagram className="w-4 h-4" />} />
              <SocialLink href="#" icon={<Facebook className="w-4 h-4" />} />
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Навигация</h3>
            <ul className="space-y-4">
              <FooterLink path="/" label="Главная" />
              <FooterLink path="/categories" label="Услуги" />
              <FooterLink path="/masters" label="Мастера" />
              <FooterLink path="/shop" label="Магазин" />
              <FooterLink path="/about" label="О нас" />
              <FooterLink path="/contacts" label="Контакты" />
            </ul>
          </div>

          {/* For Clients */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Для клиентов</h3>
            <ul className="space-y-4">
              <FooterLink path="/how-it-works" label="Как это работает" />
              <FooterLink path="/guarantee" label="Гарантии" />
              <FooterLink path="/faq" label="Вопросы и ответы" />
              <FooterLink path="/reviews" label="Отзывы" />
              <FooterLink path="/blog" label="Блог" />
            </ul>
          </div>

          {/* Contacts */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Контакты</h3>
            <div className="space-y-5">
              <ContactItem icon={<Phone className="w-4 h-4 text-emerald-500" />} text="+992 979 117 007" />
              <ContactItem icon={<Mail className="w-4 h-4 text-emerald-500" />} text="support@masterchas.tj" />
              <ContactItem icon={<MapPin className="w-4 h-4 text-emerald-500" />} text="Душанбе, Таджикистан" />
              <ContactItem icon={<MessageCircle className="w-4 h-4 text-emerald-500" />} text="Ежедневно с 8:00 до 22:00" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          <p>© 2025 Мастер ТЧ. Все права защищены.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-emerald-500 transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ path, label }: { path: string; label: string }) => (
  <li>
    <Link to={path} className="text-sm hover:text-emerald-500 transition-colors duration-300">
      {label}
    </Link>
  </li>
);

const ContactItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
      {icon}
    </div>
    <span className="text-sm group-hover:text-white transition-colors">{text}</span>
  </div>
);

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all duration-300"
  >
    {icon}
  </a>
);
