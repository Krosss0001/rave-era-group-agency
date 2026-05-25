import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Mail, Ticket } from "lucide-react";

const G = "#00FF88";
type Lang = "en" | "uk";

export default function PaymentSuccessPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const t = lang === "uk"
    ? {
        back: "Назад",
        title: "Статус SUCCESS",
        subtitle: "Ця сторінка призначена для майбутнього повернення з AlliancePay після підтвердженої оплати. Наразі онлайн-оплата ще не активована.",
        note: "Після активації AlliancePay квиток буде виданий тільки після серверного підтвердження статусу SUCCESS від банку. Якщо ви бачите цю сторінку без реальної оплати, зверніться до організатора.",
        event: "На сторінку події",
        contact: "Написати організатору",
      }
    : {
        back: "Back",
        title: "SUCCESS status",
        subtitle: "This page is reserved for the future AlliancePay return after confirmed payment. Online payment is not active yet.",
        note: "After AlliancePay activation, a ticket will be issued only after server-side SUCCESS confirmation from the bank. If you see this page without a real payment, contact the organizer.",
        event: "Back to event",
        contact: "Contact organizer",
      };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-14 flex items-center justify-between">
          <Link href="/event/sbc-summit-ukraine-2026" className="flex min-h-10 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
          <button type="button" onClick={() => setLang(lang === "uk" ? "en" : "uk")} className="min-h-10 px-3 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest border border-white/10 hover:border-[#00FF88]/30 text-white/40 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            {lang === "uk" ? "EN" : "UA"}
          </button>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12 py-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-lg w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: `${G}15` }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: G }} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9]">{t.title}</h1>
          <p className="text-sm text-white/45 leading-relaxed">{t.subtitle}</p>
          <div className="border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-white/40 leading-relaxed">{t.note}</div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/event/sbc-summit-ukraine-2026" className="inline-flex min-h-10 items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-[#00FF88] hover:text-white border border-[#00FF88]/30 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
              <Ticket className="w-3.5 h-3.5" />
              {t.event}
            </Link>
            <a href="mailto:ceo@rave-era.com.ua" className="inline-flex min-h-10 items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-white/45 hover:text-[#00FF88] border border-white/10 hover:border-[#00FF88]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
              <Mail className="w-3.5 h-3.5" />
              {t.contact}
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
