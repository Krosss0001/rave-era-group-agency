import { useState, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, ArrowRight, Ticket, User, Mail, Phone,
  AlertCircle, CheckCircle2,
} from "lucide-react";

const G = "#00FF88";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
} as const;

const fadeUpChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
} as const;

type Lang = "en" | "uk";
type TicketType = "sport" | "business" | "online";

const TIERS: Record<TicketType, { nameUk: string; nameEn: string; price: string }> = {
  sport: { nameUk: "SPORT", nameEn: "SPORT", price: "2 500" },
  business: { nameUk: "BUSINESS", nameEn: "BUSINESS", price: "6 500" },
  online: { nameUk: "ONLINE", nameEn: "ONLINE", price: "1 000" },
};

export default function TicketFormPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [location] = useLocation();
  const [ticketType, setTicketType] = useState<TicketType>("sport");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Parse ?type= from URL
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("type") as TicketType;
    if (t && TIERS[t]) setTicketType(t);
  }, [location]);

  const t = {
    back: lang === "uk" ? "Назад" : "Back",
    badge: lang === "uk" ? "РЕЄСТРАЦІЯ НА ЗАХІД" : "EVENT REGISTRATION",
    title: lang === "uk" ? "ОФОРМЛЕННЯ КВИТКА" : "TICKET CHECKOUT",
    subtitle: lang === "uk"
      ? "Заповніть дані для реєстрації на SBC Summit Ukraine 2026"
      : "Fill in your details to register for SBC Summit Ukraine 2026",
    ticketLabel: lang === "uk" ? "Тип квитка" : "Ticket type",
    firstNameLabel: lang === "uk" ? "Ім'я" : "First name",
    lastNameLabel: lang === "uk" ? "Прізвище" : "Last name",
    emailLabel: lang === "uk" ? "Email" : "Email",
    phoneLabel: lang === "uk" ? "Телефон" : "Phone",
    phonePlaceholder: lang === "uk" ? "+380 XX XXX XX XX" : "+380 XX XXX XX XX",
    required: lang === "uk" ? "Обов'язкове поле" : "Required field",
    invalidEmail: lang === "uk" ? "Некоректний email" : "Invalid email",
    submit: lang === "uk" ? "ПЕРЕЙТИ ДО ОПЛАТИ" : "PROCEED TO PAYMENT",
    processing: lang === "uk" ? "ОБРОБКА..." : "PROCESSING...",
    consent: lang === "uk"
      ? "Натискаючи кнопку, я погоджуюсь з умовами публічної оферти та політикою конфіденційності."
      : "By clicking the button, I agree to the public offer terms and privacy policy.",
    errorGeneral: lang === "uk"
      ? "Сталася помилка під час створення замовлення. Спробуйте ще раз або зв'яжіться з нами."
      : "An error occurred while creating the order. Please try again or contact us.",
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = t.required;
    if (!lastName.trim()) e.lastName = t.required;
    if (!email.trim()) e.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t.invalidEmail;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketType, firstName, lastName, email, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) {
        setSubmitError(t.errorGeneral);
        setLoading(false);
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      setSubmitError(t.errorGeneral);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-14 flex items-center justify-between">
          <Link href="/event/sbc-summit-ukraine-2026" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-[#00FF88] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">RAVE'ERA GROUP</span>
            <button
              onClick={() => setLang(lang === "uk" ? "en" : "uk")}
              className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest border border-white/10 hover:border-[#00FF88]/30 px-2 py-1 text-white/40 hover:text-[#00FF88] transition-colors"
            >
              <span className={lang === "uk" ? "text-[#00FF88]" : ""}>UA</span>
              <span className="text-white/20">/</span>
              <span className={lang === "en" ? "text-[#00FF88]" : ""}>EN</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUpChild} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
            <Ticket className="w-3 h-3" />
            {t.badge}
          </motion.div>

          <motion.h1 variants={fadeUpChild} className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9] mb-3">
            {t.title}
          </motion.h1>
          <motion.p variants={fadeUpChild} className="text-sm text-white/40 leading-relaxed mb-8 sm:mb-10">
            {t.subtitle}
          </motion.p>

          <motion.form variants={fadeUpChild} onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
            {/* Ticket type */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30 mb-3">
                <Ticket className="w-3 h-3" style={{ color: G }} />
                {t.ticketLabel}
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(Object.keys(TIERS) as TicketType[]).map((key) => {
                  const tier = TIERS[key];
                  const active = ticketType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTicketType(key)}
                      className={`border p-3 sm:p-4 text-left transition-colors ${
                        active
                          ? "border-[#00FF88]/30 bg-[#00FF88]/[0.03]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                      }`}
                    >
                      <div className="text-xs font-mono uppercase tracking-widest text-white/25 mb-1">
                        {lang === "uk" ? tier.nameUk : tier.nameEn}
                      </div>
                      <div className="text-lg sm:text-xl font-black tracking-tighter" style={{ color: active ? G : "white" }}>
                        {tier.price}
                      </div>
                      <div className="text-[10px] font-mono text-white/25">грн</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* First name */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">
                {t.firstNameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-[#00FF88]/40 text-sm text-white py-3 pl-10 pr-4 outline-none transition-colors placeholder:text-white/15"
                  placeholder=""
                />
              </div>
              {errors.firstName && (
                <p className="flex items-center gap-1 text-[10px] text-red-400 mt-1.5">
                  <AlertCircle className="w-3 h-3" /> {errors.firstName}
                </p>
              )}
            </div>

            {/* Last name */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">
                {t.lastNameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-[#00FF88]/40 text-sm text-white py-3 pl-10 pr-4 outline-none transition-colors placeholder:text-white/15"
                  placeholder=""
                />
              </div>
              {errors.lastName && (
                <p className="flex items-center gap-1 text-[10px] text-red-400 mt-1.5">
                  <AlertCircle className="w-3 h-3" /> {errors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-[#00FF88]/40 text-sm text-white py-3 pl-10 pr-4 outline-none transition-colors placeholder:text-white/15"
                  placeholder=""
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-[10px] text-red-400 mt-1.5">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2">
                {t.phoneLabel}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-[#00FF88]/40 text-sm text-white py-3 pl-10 pr-4 outline-none transition-colors placeholder:text-white/15"
                  placeholder={t.phonePlaceholder}
                />
              </div>
            </div>

            {submitError && (
              <div className="border border-red-500/20 bg-red-500/[0.03] p-3 text-xs text-red-400">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden py-4 sm:py-5 font-bold text-xs sm:text-sm uppercase tracking-widest text-black transition-opacity disabled:opacity-50"
              style={{ background: G }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? t.processing : (
                  <>
                    {t.submit} <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>

            <p className="text-[10px] text-white/20 leading-relaxed text-center">
              {t.consent}
            </p>
          </motion.form>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-white/15 font-mono">
            RAVE'ERA GROUP · <span style={{ color: G }}>SBC Summit Ukraine 2026</span>
          </p>
          <p className="text-[10px] text-white/15 font-mono">
            {lang === "uk" ? "Всі права захищено" : "All rights reserved"}
          </p>
        </div>
      </footer>
    </div>
  );
}
