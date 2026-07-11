import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, Star, Phone, Zap, Droplets, Wrench,
  Package, ArrowRight, Percent, Shield, Truck,
  ChevronRight, Sparkles, Heart, Plus, CheckCircle2,
  Headset, Users, Award, Trophy, MessageCircle, Clock,
  CreditCard, RotateCcw, HelpCircle
} from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function Shop() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  
  // Custom Images from public/shop directory
  const heroImage = "/shop/hero.png";
  const specialistImage = "/shop/specialist.png";
  const drillImg = "/shop/drill.png";
  const faucetImg = "/shop/faucet.png";
  const waterHeaterImg = "/shop/heater.png";
  const toiletImg = "/shop/toilet.png";
  const tilesImg = "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=400&auto=format&fit=crop"; 

  const popularProducts = [
    { id: "1", name: "Дрель-шуруповерт Bosch GSR 120-Li", price: "350", oldPrice: "450", rating: "4.8", reviews: "124", image: drillImg, label: "Скидка -15%", labelColor: "bg-red-500" },
    { id: "2", name: "Смеситель для кухни Grohe Start", price: "85", oldPrice: null, rating: "4.9", reviews: "86", image: faucetImg, label: "Хит продаж", labelColor: "bg-purple-600" },
    { id: "3", name: "Водонагреватель Ariston 80 л", price: "750", oldPrice: null, rating: "4.7", reviews: "42", image: waterHeaterImg, label: "Новинка", labelColor: "bg-orange-500" },
    { id: "4", name: "Унитаз-компакт Cersanit Parva", price: "450", oldPrice: "520", rating: "4.8", reviews: "115", image: toiletImg, label: "Скидка -10%", labelColor: "bg-blue-500" },
    { id: "5", name: "Керамическая плитка 60х60 см", price: "120", oldPrice: "150", rating: "4.5", reviews: "18", image: tilesImg, label: "Акция", labelColor: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <section className="relative py-12 bg-slate-50/30">
        <div className="container px-4 mx-auto max-w-[1600px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 min-h-[750px] flex flex-col lg:flex-row items-stretch"
          >
            {/* Left Content Column */}
            <div className="w-full lg:w-[65%] relative z-20 py-16 px-8 md:py-24 md:px-24 flex items-center">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-8">
                   <Clock className="w-3.5 h-3.5" />
                   <span className="text-[11px] font-black uppercase tracking-widest">О магазине</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-tight">
                  О магазине <span className="text-emerald-500">Мастер ТЧ</span>
                </h1>
                
                <div className="space-y-6 mb-12 text-slate-500">
                  <p className="text-base md:text-lg leading-relaxed">
                    Магазин Мастер ТЧ — это надёжный выбор для дома, ремонта и профессиональных работ в Душанбе и по всему Таджикистану.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed">
                    Мы предлагаем только качественные товары от проверенных производителей и помогаем не только купить, но и установить с помощью наших мастеров.
                  </p>
                  <p className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                    Наша цель — сделать ремонт простым, быстрым и доступным для каждого клиента.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-8">
                  <ShopFeatureItem icon={<Shield />} title="Проверенное качество" desc="Только оригинальные товары" />
                  <ShopFeatureItem icon={<Truck />} title="Быстрая доставка" desc="Доставим ваш заказ" />
                  <ShopFeatureItem icon={<Wrench />} title="Установка мастером" desc="С гарантией 1 год" />
                  <ShopFeatureItem icon={<CreditCard />} title="Удобная оплата" desc="Картой или наличными" />
                  <ShopFeatureItem icon={<RotateCcw />} title="Возврат товара" desc="В течение 14 дней" />
                  <ShopFeatureItem icon={<Headset />} title="Поддержка 24/7" desc="Ответим на вопросы" />
                </div>
              </div>
            </div>

            {/* Right Photo Column */}
            <div className="w-full lg:w-[35%] relative min-h-[400px] lg:min-h-full overflow-hidden">
               <img 
                 src={heroImage} 
                 alt="Workshop" 
                 className="absolute inset-0 w-full h-full object-cover object-center"
               />
               {/* Mask for smooth transition */}
               <div className="absolute inset-0 bg-gradient-to-r from-white via-white/5 to-transparent z-10" />
               
               {/* Rating Badge - Absolute inside the photo column but fixed to bottom right */}
               <div className="absolute bottom-10 right-10 z-30 hidden xl:block scale-90 origin-bottom-right">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 w-[400px]"
                  >
                    <div className="flex items-center justify-between mb-5">
                       <div className="space-y-1">
                         <p className="text-sm font-bold text-slate-900 leading-tight">Нам доверяют тысячи клиентов</p>
                         <p className="text-sm font-bold text-slate-900 leading-tight">по всему Таджикистану</p>
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-black text-slate-900">4.8</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                          </div>
                          <span className="text-xs font-bold text-slate-400 ml-1">4.8 (1200+ отзывов)</span>
                       </div>
                       <div className="flex -space-x-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                              <img src={`https://i.pravatar.cc/100?u=user${i}`} alt="user" />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-white flex items-center justify-center shadow-lg">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                       </div>
                    </div>
                  </motion.div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem icon={<Users className="w-8 h-8 text-emerald-500" />} value="1000+" label="довольных клиентов" />
            <StatItem icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />} value="5000+" label="успешных заказов" />
            <StatItem icon={<Award className="w-8 h-8 text-emerald-500" />} value="50+" label="проверенных брендов" />
            <StatItem icon={<Trophy className="w-8 h-8 text-emerald-500" />} value="98%" label="положительных отзывов" />
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              Популярные товары 🔥
            </h2>
            <Link to="#" className="text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-2">
              Смотреть все товары <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {popularProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group h-full border-slate-100 hover:border-emerald-100 hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col hover-lift">
                  <div className="relative aspect-square bg-slate-50 p-6 flex items-center justify-center overflow-hidden">
                    <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="absolute top-4 left-4">
                      <Badge className={`${p.labelColor} text-white font-black text-[10px] px-3 py-1 rounded-full shadow-lg`}>
                        {p.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-snug h-10">
                      {p.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-4">
                       <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                       <span className="text-[11px] font-bold text-slate-900">{p.rating}</span>
                       <span className="text-[11px] text-slate-400">({p.reviews})</span>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div>
                        <p className="text-lg font-black text-slate-900">{p.price} сомони</p>
                        {p.oldPrice && <p className="text-[11px] text-slate-400 line-through">{p.oldPrice} сомони</p>}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="icon" className="h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100" onClick={() => addToCart(p.id)}>
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Row */}
      <section className="py-12 bg-emerald-50/30 border-y border-emerald-100/50">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            <BenefitSmallItem icon={<Truck />} text="Быстрая доставка по Душанбе" />
            <BenefitSmallItem icon={<Shield />} text="Гарантия качества на все товары" />
            <BenefitSmallItem icon={<CreditCard />} text="Безопасная оплата любым способом" />
            <BenefitSmallItem icon={<RotateCcw />} text="Возврат товара в течение 14 дней" />
            <BenefitSmallItem icon={<Wrench />} text="Установка мастером с гарантией" />
          </div>
        </div>
      </section>

      {/* Consultation Banner */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="bg-[#F1F5F9] rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
             <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-3xl rounded-full" />
             
             <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
               <div className="relative">
                 <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full" />
                 <img src={specialistImage} alt="Specialist" className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full border-8 border-white shadow-2xl relative z-10" />
                 <div className="absolute bottom-4 right-4 bg-white p-4 rounded-3xl shadow-xl z-20">
                   <Wrench className="w-8 h-8 text-emerald-500" />
                 </div>
               </div>
             </div>

             <div className="flex-1 z-10">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Нужна помощь с выбором?</h2>
               <p className="text-lg text-slate-600 mb-8 max-w-xl">Наши специалисты помогут подобрать товар и мастера для установки</p>
               
               <div className="space-y-4 mb-10">
                 <CheckPoint text="Проконсультируем и ответим на вопросы" />
                 <CheckPoint text="Поможем подобрать лучший вариант" />
                 <CheckPoint text="Подскажем по установке и доставке" />
               </div>
               
               <div className="flex flex-col sm:flex-row items-center gap-8">
                 <div className="flex items-center gap-4 text-slate-900">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black">+992 979 117 007</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ежедневно с 8:00 до 22:00</p>
                    </div>
                 </div>
                 
                 <Button className="bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-2xl px-10 h-16 flex items-center gap-3 shadow-xl shadow-emerald-100 transition-all active:scale-95">
                   <MessageCircle className="w-6 h-6" /> Написать в WhatsApp
                 </Button>
               </div>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ShopFeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{title}</h4>
        <p className="text-[10px] text-slate-400 leading-normal max-w-[150px]">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
      <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center shrink-0">
        {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8 text-emerald-500" })}
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-black text-slate-900 leading-none mb-2">{value}</p>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest leading-tight break-words">{label}</p>
      </div>
    </div>
  );
}

function BenefitSmallItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 text-emerald-500">
        {React.cloneElement(icon as React.ReactElement, { className: "w-full h-full" })}
      </div>
      <span className="text-xs font-bold text-slate-600">{text}</span>
    </div>
  );
}

function CheckPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      </div>
      <span className="text-sm font-bold text-slate-700">{text}</span>
    </div>
  );
}
