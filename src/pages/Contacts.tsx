import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, Mail, Clock, MapPin, MessageCircle, Send, 
  HelpCircle, Paperclip, CheckCircle2, Zap, Trophy, Shield, Headset,
  Map as MapIcon, ChevronRight
} from "lucide-react";

const Contacts = () => {
  // Временное стоковое изображение — замени на реальное фото.
  const contactHeroImage = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=1400&fit=crop";
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Сообщение отправлено", description: "Мы свяжемся с вами в ближайшее время." });
      setFormData({ name: "", phone: "", email: "", message: "" });
    }, 1000);
  };

  const contactCards = [
    { icon: <Phone className="w-5 h-5 text-emerald-500" />, label: "Телефон", value: "+992 979 117 007", sub: "Звоните в любое время", color: "bg-emerald-50", href: "tel:+992979117007" },
    { icon: <Mail className="w-5 h-5 text-blue-500" />, label: "Почта", value: "support@masterchas.tj", sub: "Ответим в течение часа", color: "bg-blue-50", href: "mailto:support@masterchas.tj" },
    { icon: <MapPin className="w-5 h-5 text-purple-500" />, label: "Адрес", value: "Душанбе, Тоҷикистон", sub: "Работаем по всему городу", color: "bg-purple-50", href: "https://www.google.com/maps/search/?api=1&query=Dushanbe" },
    { icon: <Clock className="w-5 h-5 text-amber-500" />, label: "Режим работы", value: "24/7 — круглосуточно", sub: "Без выходных", color: "bg-amber-50", href: null },
    { icon: <MessageCircle className="w-5 h-5 text-green-500" />, label: "WhatsApp", value: "+992 979 117 007", sub: "Быстрый ответ", color: "bg-green-50", href: "https://wa.me/992979117007" },
    { icon: <Send className="w-5 h-5 text-sky-500" />, label: "Telegram", value: "@masterchas_tj", sub: "Напишите нам", color: "bg-sky-50", href: "https://t.me/masterchas_tj" },
  ];

  const faqs = [
    { q: "Как заказать мастера?", a: "Вы можете оставить заявку на сайте через форму быстрого заказа, выбрать мастера в каталоге или просто позвонить нам по телефону." },
    { q: "Какие гарантии на работу?", a: "Мы предоставляем официальную гарантию на все виды выполненных работ. Срок гарантии зависит от типа услуги и составляет от 3 до 12 месяцев." },
    { q: "Сколько стоит вызов мастера?", a: "Вызов мастера для осмотра и консультации бесплатен при условии выполнения работ. В случае отказа от работ стоимость выезда составляет 30 сомони." },
    { q: "Можно ли выбрать конкретного мастера?", a: "Да, в нашем каталоге вы можете ознакомиться с профилями мастеров, их рейтингом и отзывами, и выбрать того, кто вам больше нравится." },
    { q: "Как быстро приедет мастер?", a: "В среднем мастер приезжает в течение 45-60 минут после подтверждения заказа, в зависимости от вашего местоположения и загруженности дорог." },
    { q: "Как оплатить услуги?", a: "Оплатить услуги можно наличными мастеру или переводом на карту/кошелек после завершения и проверки всех работ." },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-green-100 bg-[#eefbf5] pt-12 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.12),transparent_28%),linear-gradient(135deg,#f7fffb_0%,#eefbf5_52%,#f8fafc_100%)]" />
        <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="relative flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left Content */}
            <div className="flex-1 text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 shadow-sm backdrop-blur">
                  Контакты 24/7
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Свяжитесь с нами</h1>
                <p className="text-lg text-slate-600 mb-8 max-w-xl font-medium">
                  Звоните, пишите в WhatsApp или Telegram — мы на связи 24/7.
                </p>
                <div className="hidden lg:block relative max-w-[500px] lg:ml-auto group">
                  {/* Background glow effects */}
                  <div className="absolute -inset-10 bg-emerald-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-[0_32px_80px_-16px_rgba(15,23,42,0.15)] hover-lift transition-all duration-700">
                    <div className="relative h-[480px] overflow-hidden">
                      <img
                        src={contactHeroImage}
                        alt="Мастер ТЧ"
                        className="h-full w-full object-cover object-top transition-transform duration-[1.5s] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                    
                    {/* Integrated Info Panel */}
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-between transition-transform duration-500 group-hover:translate-y-[-4px]">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-1">Мастер ТЧ</p>
                          <p className="text-lg font-bold text-slate-900 leading-tight">Быстрый выезд по Душанбе</p>
                        </div>
                        <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-200 transition-colors group-hover:bg-emerald-600">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="https://wa.me/992979117007" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover-soft">
                    Написать в WhatsApp
                  </a>
                  <a href="tel:+992979117007" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/85 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition-all hover:border-emerald-300 hover:text-emerald-700 hover-soft">
                    Позвонить сейчас
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right Contact Grid */}
            <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contactCards.map((card, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: i * 0.05 }}
                >
                  {card.href ? (
                    <a href={card.href} target="_blank" rel="noopener noreferrer" className="block">
                      <ContactCard card={card} />
                    </a>
                  ) : (
                    <ContactCard card={card} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form & Map Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="lg:col-span-5"
            >
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Напишите нам</h2>
                <p className="text-sm text-slate-500 mb-8">Заполните форму и мы ответим вам в ближайшее время</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-2">Ваше имя</label>
                    <Input 
                      placeholder="Иван Иванов" 
                      value={formData.name} 
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
                      required 
                      className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-emerald-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-2">Телефон</label>
                    <Input 
                      placeholder="+992 000 000 000" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} 
                      required 
                      className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-emerald-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-2">Email (необязательно)</label>
                    <Input 
                      placeholder="example@mail.com" 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} 
                      className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-emerald-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-2">Ваше сообщение</label>
                    <Textarea 
                      placeholder="Опишите вашу задачу..." 
                      value={formData.message} 
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} 
                      required 
                      className="min-h-[120px] rounded-2xl bg-slate-50 border-none focus-visible:ring-emerald-500 resize-none p-4" 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 cursor-pointer transition-colors pt-2 group">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Прикрепить файл (фото, документ)</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full rounded-2xl h-16 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-100 transition-all gap-2" 
                    disabled={sending}
                  >
                    {sending ? "Отправка..." : "Отправить сообщение"}
                    <Send className="w-5 h-5" />
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 mt-4">
                    Отправляя форму, вы соглашаетесь с <span className="underline cursor-pointer">политикой конфиденциальности</span>
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="lg:col-span-7 h-full min-h-[500px] lg:min-h-[600px] relative rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm"
            >
              <iframe 
                src="https://www.openstreetmap.org/export/embed.html?bbox=68.7038%2C38.5198%2C68.8438%2C38.5998&layer=mapnik&marker=38.5598%2C68.7738" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                title="Душанбе" 
                loading="lazy" 
              />
              
              {/* Custom Map Marker Overlay */}
              <div className="absolute top-10 left-10 z-10">
                <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Наш офис</p>
                    <p className="text-[10px] text-slate-400">Душанбе, Тоҷикистон</p>
                    <p className="text-[10px] text-emerald-500 font-bold mt-1">Мы находимся в центре города</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                <Button size="sm" className="rounded-xl bg-white text-slate-900 hover:bg-slate-50 shadow-lg border border-slate-100 h-10 px-4 font-bold text-xs gap-2">
                  <MapIcon className="w-4 h-4 text-emerald-500" />
                  Построить маршрут
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Row */}
      <section className="py-10 border-y border-slate-100 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <FeatureItem icon={<Zap className="w-5 h-5 text-emerald-500" />} title="Быстрый ответ" sub="Ответим в течение 15 минут" />
            <FeatureItem icon={<Trophy className="w-5 h-5 text-emerald-500" />} title="Профессиональная помощь" sub="Опытные специалисты" />
            <FeatureItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} title="Гарантия качества" sub="На все виды работ" />
            <FeatureItem icon={<Shield className="w-5 h-5 text-emerald-500" />} title="Честные цены" sub="Фиксированная стоимость" />
            <FeatureItem icon={<Headset className="w-5 h-5 text-emerald-500" />} title="Поддержка 24/7" sub="Всегда на связи" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Часто задаваемые вопросы</h2>
            <p className="text-slate-500">Ответы на популярные вопросы наших клиентов</p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.slice(0, 3).map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-none bg-white rounded-[2rem] px-6 shadow-sm">
                  <AccordionTrigger className="text-left font-bold text-slate-900 hover:no-underline py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 leading-relaxed pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.slice(3).map((faq, i) => (
                <AccordionItem key={i+3} value={`faq-${i+3}`} className="border-none bg-white rounded-[2rem] px-6 shadow-sm">
                  <AccordionTrigger className="text-left font-bold text-slate-900 hover:no-underline py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 leading-relaxed pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

function ContactCard({ card }: { card: any }) {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all cursor-pointer h-full">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center shrink-0`}>
          {card.icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{card.label}</p>
          <p className="text-sm font-bold text-slate-900 truncate">{card.value}</p>
          <p className="text-[10px] text-slate-400">{card.sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-1">
        {icon}
      </div>
      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
  );
}

export default Contacts;
