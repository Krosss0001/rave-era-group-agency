import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, RefreshCcw } from "lucide-react";

const G = "#00FF88";

type Lang = "en" | "uk";

export default function ReturnsPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => setLang(l => (l === "uk" ? "en" : "uk"));

  const t = lang === "uk" ? {
    back: "Назад",
    title: "Повернення коштів",
    org: "ФОП Чекан Богдан Орестович (RAVE'ERA GROUP)",
    updated: "Останнє оновлення: травень 2026",
    sections: [
      { title: "1. Загальні умови", text: "Ця Політика повернення визначає порядок та умови повернення коштів за придбані квитки на подію SBC Summit Ukraine 2026. Повернення здійснюється відповідно до законодавства України." },
      { title: "2. Повернення за ініціативою учасника", text: "Учасник має право на повернення коштів за квиток не пізніше ніж за 14 календарних днів до дати проведення події. Повернення здійснюється на ту саму платіжну картку, з якої була здійснена оплата. Термін зарахування коштів — до 14 банківських днів." },
      { title: "3. Повернення при скасуванні події", text: "У разі скасування події Організатором з об'єктивних причин (форс-мажор, зміна умов безпеки тощо), Учаснику буде запропоновано: перенесення квитка на наступний захід без доплати, або повернення 100% вартості квитка протягом 30 днів." },
      { title: "4. Повернення при зміні формату", text: "Якщо Учасник придбав квиток BUSINESS або SPORT, але вирішив перейти на формат ONLINE, різниця у вартості повертається на платіжну картку." },
      { title: "5. Неповернення коштів", text: "Повернення коштів не здійснюється: після початку події, якщо Учасник не з'явився без попередження, за купони/промо-коди, при порушенні Учасником правил поведінки на заході." },
      { title: "6. Процедура повернення", text: "Для оформлення повернення напишіть нам на email clionintrue@gmail.com з темою 'Повернення коштів' та вкажіть: ПІБ, номер замовлення, причину повернення, реквізити для повернення. Розгляд заявки — до 5 робочих днів." },
    ],
  } : {
    back: "Back",
    title: "Refund Policy",
    org: "FOP Chekan Bohdan Orestovych (RAVE'ERA GROUP)",
    updated: "Last updated: May 2026",
    sections: [
      { title: "1. General Conditions", text: "This Refund Policy defines the procedure and conditions for refunding money for purchased tickets to the SBC Summit Ukraine 2026 event. Refunds are made in accordance with the legislation of Ukraine." },
      { title: "2. Participant-Initiated Refund", text: "The Participant has the right to a refund no later than 14 calendar days before the event date. The refund is made to the same payment card used for the purchase. The crediting period is up to 14 banking days." },
      { title: "3. Event Cancellation Refund", text: "If the Organizer cancels the event for objective reasons (force majeure, security condition changes, etc.), the Participant will be offered: transfer of the ticket to the next event without additional payment, or a 100% refund within 30 days." },
      { title: "4. Format Change Refund", text: "If a Participant purchased a BUSINESS or SPORT ticket but decided to switch to the ONLINE format, the price difference will be refunded to the payment card." },
      { title: "5. Non-Refundable Cases", text: "Refunds are not provided: after the event has started, if the Participant did not show up without prior notice, for coupons/promo codes, or if the Participant violated the event code of conduct." },
      { title: "6. Refund Procedure", text: "To request a refund, email us at clionintrue@gmail.com with the subject 'Refund' and include: full name, order number, reason for refund, refund details. Review period — up to 5 business days." },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden selection:bg-[#00FF88] selection:text-black">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/[0.06]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-[#00FF88] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
          <button onClick={toggleLang} className="h-9 px-3 flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase border border-white/10 hover:border-[#00FF88]/50 text-white/40 hover:text-[#00FF88] transition-all">
            <Globe className="w-3 h-3" />{lang === "en" ? "UA" : "EN"}
          </button>
        </div>
      </nav>

      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
              <RefreshCcw className="w-3 h-3" />
              {lang === "uk" ? "Повернення" : "Refunds"}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
              {t.title}
            </h1>
            <div className="text-xs text-white/30 font-mono leading-relaxed mb-8 sm:mb-12 space-y-1">
              <p>{t.org}</p>
              <p className="text-white/20">{t.updated}</p>
            </div>
          </motion.div>

          <div className="space-y-6 sm:space-y-8">
            {t.sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <h2 className="text-sm sm:text-base font-bold text-white/70 uppercase tracking-wider mb-3">{s.title}</h2>
                <p className="text-sm text-white/40 leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 sm:py-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-white/15 font-mono">RAVE'ERA GROUP · SBC Summit Ukraine 2026</p>
          <p className="text-[10px] text-white/15 font-mono">{lang === "uk" ? "Всі права захищено" : "All rights reserved"}</p>
        </div>
      </footer>
    </div>
  );
}
