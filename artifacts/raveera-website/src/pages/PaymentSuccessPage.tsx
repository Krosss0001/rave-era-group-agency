import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, CheckCircle2, Ticket, Mail, Clock,
} from "lucide-react";

const G = "#00FF88";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

type Lang = "en" | "uk";

export default function PaymentSuccessPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [order, setOrder] = useState<{
    id: number;
    status: string;
    ticketType: string;
    amountKopiykas: number;
    customerEmail: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const orderId = q.get("orderId");
    if (!orderId) {
      setError(lang === "uk" ? "Не вказано ID замовлення" : "No order ID provided");
      setLoading(false);
      return;
    }
    fetch(`/api/payment/status/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(lang === "uk" ? "Замовлення не знайдено" : "Order not found");
        } else {
          setOrder(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(lang === "uk" ? "Помилка зв'язку з сервером" : "Server connection error");
        setLoading(false);
      });
  }, [lang]);

  const t = {
    back: lang === "uk" ? "Назад" : "Back",
    title: lang === "uk" ? "ОПЛАТА УСПІШНА" : "PAYMENT SUCCESSFUL",
    subtitle: lang === "uk"
      ? "Дякуємо! Ваш квиток оформлено. Підтвердження надійде на email."
      : "Thank you! Your ticket has been processed. Confirmation will be sent to your email.",
    orderLabel: lang === "uk" ? "Номер замовлення" : "Order number",
    ticketLabel: lang === "uk" ? "Тип квитка" : "Ticket type",
    amountLabel: lang === "uk" ? "Сума" : "Amount",
    emailLabel: lang === "uk" ? "Email для підтвердження" : "Confirmation email",
    statusLabel: lang === "uk" ? "Статус" : "Status",
    note: lang === "uk"
      ? "Якщо підтвердження не надійшло протягом 15 хвилин, перевірте папку «Спам» або зв'яжіться з нами."
      : "If confirmation doesn't arrive within 15 minutes, check your Spam folder or contact us.",
    backToEvent: lang === "uk" ? "Повернутись до події" : "Back to event",
    loading: lang === "uk" ? "Перевірка оплати..." : "Verifying payment...",
  };

  const ticketNames: Record<string, string> = {
    sport: "SPORT",
    business: "BUSINESS",
    online: "ONLINE",
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
          className="max-w-lg w-full text-center"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Clock className="w-8 h-8 text-[#00FF88] animate-spin" />
              <p className="text-sm text-white/40">{t.loading}</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-sm text-red-400">{error}</p>
              <Link href="/event/sbc-summit-ukraine-2026" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00FF88] hover:text-white transition-colors border border-[#00FF88]/30 hover:border-white/30 px-4 py-2">
                {t.backToEvent}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: `${G}15` }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: G }} />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9]">
                {t.title}
              </h1>
              <p className="text-sm text-white/40 leading-relaxed max-w-md mx-auto">
                {t.subtitle}
              </p>

              {order && (
                <div className="border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30 font-mono uppercase tracking-widest">{t.orderLabel}</span>
                    <span className="font-mono text-white/60">#{order.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30 font-mono uppercase tracking-widest">{t.ticketLabel}</span>
                    <span className="font-bold text-white/60">{ticketNames[order.ticketType] || order.ticketType.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30 font-mono uppercase tracking-widest">{t.amountLabel}</span>
                    <span className="font-bold" style={{ color: G }}>{(order.amountKopiykas / 100).toLocaleString()} грн</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30 font-mono uppercase tracking-widest">{t.emailLabel}</span>
                    <span className="text-white/60">{order.customerEmail}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30 font-mono uppercase tracking-widest">{t.statusLabel}</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-black" style={{ background: G }}>
                      <CheckCircle2 className="w-3 h-3" />
                      {order.status}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-white/20 leading-relaxed max-w-sm mx-auto">
                {t.note}
              </p>

              <Link href="/event/sbc-summit-ukraine-2026" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00FF88] hover:text-white transition-colors border border-[#00FF88]/30 hover:border-white/30 px-5 py-2.5">
                <Ticket className="w-3.5 h-3.5" />
                {t.backToEvent}
              </Link>
            </div>
          )}
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
