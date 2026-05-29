import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ArrowLeft, HelpCircle, RotateCcw, Ticket, XCircle } from "lucide-react";

const G = "#00FF88";
type Lang = "en" | "uk";

export default function PaymentFailPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [location] = useLocation();
  const type = new URLSearchParams(location.split("?")[1] || "").get("type");
  const retryHref = type ? `/event/sbc-summit-ukraine-2026/ticket-form?type=${encodeURIComponent(type)}` : "/event/sbc-summit-ukraine-2026/ticket-form";
  const t = lang === "uk"
    ? {
        back: "Назад",
        title: "Оплату не підтверджено",
        subtitle: "AlliancePay повернув статус, який не підтверджує оплату.",
        reasonsTitle: "Квиток не видається, якщо банк повертає:",
        reasons: ["FAIL - оплату відхилено або скасовано", "PENDING - остаточний статус ще не отримано", "REQUIRED_3DS - не завершено 3-D Secure підтвердження"],
        retry: "Повернутись до заявки",
        contact: "Зв'язатися з нами",
        backToEvent: "На сторінку події",
      }
    : {
        back: "Back",
        title: "Payment not confirmed",
        subtitle: "AlliancePay returned a status that does not confirm payment.",
        reasonsTitle: "A ticket is not issued when the bank returns:",
        reasons: ["FAIL - payment declined or cancelled", "PENDING - final status not received yet", "REQUIRED_3DS - 3-D Secure confirmation not completed"],
        retry: "Back to request",
        contact: "Contact us",
        backToEvent: "Back to event",
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/[0.08]">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9]">{t.title}</h1>
          <p className="text-sm text-white/45 leading-relaxed">{t.subtitle}</p>
          <div className="border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 text-left">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-3">{t.reasonsTitle}</p>
            <ul className="space-y-2">
              {t.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-xs text-white/45">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={retryHref} className="inline-flex min-h-10 items-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-widest text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]" style={{ background: G }}>
              <RotateCcw className="w-3.5 h-3.5" />
              {t.retry}
            </Link>
            <a href="mailto:ceo@rave-era.com.ua" className="inline-flex min-h-10 items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/45 hover:text-[#00FF88] border border-white/10 hover:border-[#00FF88]/30 px-5 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
              <HelpCircle className="w-3.5 h-3.5" />
              {t.contact}
            </a>
          </div>
          <Link href="/event/sbc-summit-ukraine-2026" className="inline-flex min-h-10 items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00FF88] hover:text-white border border-[#00FF88]/30 hover:border-white/30 px-5 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <Ticket className="w-3.5 h-3.5" />
            {t.backToEvent}
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
