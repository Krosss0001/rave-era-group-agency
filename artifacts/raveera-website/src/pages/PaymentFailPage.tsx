import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, XCircle, RotateCcw, Ticket, HelpCircle,
} from "lucide-react";

const G = "#00FF88";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

type Lang = "en" | "uk";

export default function PaymentFailPage() {
  const [lang, setLang] = useState<Lang>("uk");

  const t = {
    back: lang === "uk" ? "Назад" : "Back",
    title: lang === "uk" ? "ОПЛАТА НЕ ВДАЛАСЯ" : "PAYMENT FAILED",
    subtitle: lang === "uk"
      ? "Щось пішло не так під час обробки платежу. Ваш квиток не був оплачено."
      : "Something went wrong during payment processing. Your ticket was not paid for.",
    reasonsTitle: lang === "uk" ? "Можливі причини:" : "Possible reasons:",
    reasons: lang === "uk"
      ? ["Недостатньо коштів на карті", "Картка тимчасово заблокована", "Технічна помилка банку", "Сплата була скасована користувачем"]
      : ["Insufficient funds on the card", "Card temporarily blocked", "Bank technical error", "Payment was cancelled by user"],
    retry: lang === "uk" ? "СПРОБУВАТИ ЗНОВУ" : "TRY AGAIN",
    contact: lang === "uk" ? "Зв'язатися з нами" : "Contact us",
    backToEvent: lang === "uk" ? "На сторінку події" : "Back to event",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-14 flex items-center justify-between">
          <Link href="/event/sbc-summit-ukraine-2026" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-[#00FF88] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "uk" ? "en" : "uk")}
            className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest border border-white/10 hover:border-[#00FF88]/30 px-2 py-1 text-white/40 hover:text-[#00FF88] transition-colors"
          >
            <span className={lang === "uk" ? "text-[#00FF88]" : ""}>UA</span>
            <span className="text-white/20">/</span>
            <span className={lang === "en" ? "text-[#00FF88]" : ""}>EN</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-lg w-full text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/[0.08]">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9]">
            {t.title}
          </h1>
          <p className="text-sm text-white/40 leading-relaxed max-w-md mx-auto">
            {t.subtitle}
          </p>

          <div className="border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 text-left">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-3">{t.reasonsTitle}</p>
            <ul className="space-y-2">
              {t.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/40">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/event/sbc-summit-ukraine-2026/ticket-form"
              className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-widest text-black"
              style={{ background: G }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="relative z-10">{t.retry}</span>
            </Link>
            <a
              href="mailto:clionintrue@gmail.com"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-[#00FF88] transition-colors border border-white/10 hover:border-[#00FF88]/30 px-5 py-2.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {t.contact}
            </a>
          </div>

          <Link href="/event/sbc-summit-ukraine-2026" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00FF88] hover:text-white transition-colors border border-[#00FF88]/30 hover:border-white/30 px-5 py-2.5">
            <Ticket className="w-3.5 h-3.5" />
            {t.backToEvent}
          </Link>
        </motion.div>
      </div>

      <footer className="border-t border-white/[0.06] py-6 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] text-white/15 font-mono">
            RAVE'ERA GROUP · <span style={{ color: G }}>SBC Summit Ukraine 2026</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
