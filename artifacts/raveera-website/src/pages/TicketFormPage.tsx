import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  User,
} from "lucide-react";

const G = "#00FF88";

type Lang = "en" | "uk";
type TicketType = "sport" | "business" | "online";

const tiers: Record<TicketType, { name: string; price: string; scope: string }> = {
  sport: {
    name: "SPORT",
    price: "2 500 UAH",
    scope: "In-person event access, partner expo, Sport&Business Club community, networking, participant package, photo/video report.",
  },
  business: {
    name: "BUSINESS",
    price: "6 500 UAH",
    scope: "SPORT access plus business lounge, speaker zone, priority entry, front-row seating, speaker materials, event recording and parking.",
  },
  online: {
    name: "ONLINE",
    price: "100 UAH",
    scope: "Remote access to the online broadcast and event recording.",
  },
};

const text = {
  uk: {
    back: "Назад",
    badge: "Заявка на квиток",
    title: "Оформлення заявки",
    subtitle: "Оплата проходить через захищену сторінку AlliancePay. Карткові дані на цьому сайті не вводяться і не зберігаються.",
    ticketLabel: "Тип квитка",
    firstName: "Ім'я",
    lastName: "Прізвище",
    email: "Email",
    phone: "Телефон",
    required: "Обов'язкове поле",
    invalidEmail: "Некоректний email",
    consentRequired: "Потрібна згода з умовами",
    submit: "Перейти до оплати",
    submitting: "Створюємо платіж...",
    submitted: "Платіж створено",
    submitNote: "Перенаправляємо вас на захищену сторінку AlliancePay.",
    paymentError: "Не вдалося створити платіж. Спробуйте ще раз або зверніться до організатора.",
    paymentStatus: "Статус оплати",
    paymentCopy: "Квиток видається тільки після серверного підтвердження статусу SUCCESS від банку.",
    issueCopy: "Після статусу SUCCESS підтвердження покупки надсилається на email протягом 15 хвилин, PDF-квиток - не пізніше ніж за 24 години до події.",
    legalCopy: "Надсилаючи заявку, я підтверджую, що мені є 18 років, і погоджуюся з Публічною офертою, Політикою конфіденційності та Політикою повернення.",
    offer: "Публічна оферта",
    privacy: "Політика конфіденційності",
    returns: "Політика повернення",
  },
  en: {
    back: "Back",
    badge: "Ticket request",
    title: "Ticket request",
    subtitle: "Payment is processed through the secure AlliancePay page. Card data is not entered or stored on this site.",
    ticketLabel: "Ticket type",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    required: "Required field",
    invalidEmail: "Invalid email",
    consentRequired: "Consent is required",
    submit: "Continue to payment",
    submitting: "Creating payment...",
    submitted: "Payment created",
    submitNote: "Redirecting you to the secure AlliancePay page.",
    paymentError: "Could not create the payment. Try again or contact the organizer.",
    paymentStatus: "Payment status",
    paymentCopy: "A ticket is issued only after server-side SUCCESS confirmation from the bank.",
    issueCopy: "After SUCCESS, purchase confirmation is sent by email within 15 minutes and the PDF ticket no later than 24 hours before the event.",
    legalCopy: "By sending this request, I confirm that I am 18+ and agree to the Public Offer, Privacy Policy and Refund Policy.",
    offer: "Public Offer",
    privacy: "Privacy Policy",
    returns: "Refund Policy",
  },
};

type CreateOrderResponse = {
  success?: boolean;
  redirectUrl?: string;
  error?: string;
};

function getInitialTicketType(): TicketType {
  const type = new URLSearchParams(window.location.search).get("type");
  return type === "business" || type === "online" || type === "sport" ? type : "sport";
}

export default function TicketFormPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [location] = useLocation();
  const [ticketType, setTicketType] = useState<TicketType>(getInitialTicketType);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    setTicketType(getInitialTicketType());
  }, [location]);

  const t = text[lang];
  const tier = tiers[ticketType];

  function selectTicketType(next: TicketType) {
    setTicketType(next);
    setSubmitted(false);
    setPaymentError("");
    window.history.replaceState(null, "", `/event/sbc-summit-ukraine-2026/ticket-form?type=${next}`);
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = t.required;
    if (!lastName.trim()) nextErrors.lastName = t.required;
    if (!email.trim()) nextErrors.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = t.invalidEmail;
    if (!phone.trim()) nextErrors.phone = t.required;
    if (!consent) nextErrors.consent = t.consentRequired;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitted(false);
    setPaymentError("");

    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ticketType,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as CreateOrderResponse;
      if (!response.ok || !data.success || !data.redirectUrl) {
        throw new Error(data.error || "Payment provider error");
      }

      setSubmitted(true);
      window.location.assign(data.redirectUrl);
    } catch (err) {
      console.error(err);
      setPaymentError(t.paymentError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-14 flex items-center justify-between">
          <Link href="/event/sbc-summit-ukraine-2026" className="flex min-h-10 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
          <button
            type="button"
            onClick={() => setLang(lang === "uk" ? "en" : "uk")}
            className="min-h-10 px-3 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest border border-white/10 hover:border-[#00FF88]/30 text-white/40 hover:text-[#00FF88] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]"
          >
            <span className={lang === "uk" ? "text-[#00FF88]" : ""}>UA</span>
            <span className="text-white/20">/</span>
            <span className={lang === "en" ? "text-[#00FF88]" : ""}>EN</span>
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
            <Ticket className="w-3 h-3" />
            {t.badge}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9] mb-3">{t.title}</h1>
          <p className="text-sm text-white/45 leading-relaxed mb-8">{t.subtitle}</p>

          <div className="mb-8 border border-[#00FF88]/20 bg-[#00FF88]/[0.03] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: G }} />
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-white/55 mb-2">{t.paymentStatus}</p>
                <p className="text-sm text-white/50 leading-relaxed">{t.paymentCopy}</p>
                <p className="text-xs text-white/35 leading-relaxed mt-2">{t.issueCopy}</p>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div>
              <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/35 mb-3">
                <Ticket className="w-3 h-3" style={{ color: G }} />
                {t.ticketLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(tiers) as TicketType[]).map((key) => {
                  const option = tiers[key];
                  const active = ticketType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectTicketType(key)}
                      className={`min-h-24 border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88] ${
                        active ? "border-[#00FF88]/40 bg-[#00FF88]/[0.04]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <span className="block text-xs font-mono uppercase tracking-widest text-white/35 mb-1">{option.name}</span>
                      <span className="block text-lg font-black tracking-tight" style={{ color: active ? G : "white" }}>{option.price}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-white/35 leading-relaxed">{tier.scope}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t.firstName} error={errors.firstName} icon={<User className="w-4 h-4" />}>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" className="form-input" />
              </Field>
              <Field label={t.lastName} error={errors.lastName} icon={<User className="w-4 h-4" />}>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" className="form-input" />
              </Field>
              <Field label={t.email} error={errors.email} icon={<Mail className="w-4 h-4" />}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" className="form-input" />
              </Field>
              <Field label={t.phone} error={errors.phone} icon={<Phone className="w-4 h-4" />}>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="+380 XX XXX XX XX" className="form-input" />
              </Field>
            </div>

            <label className="flex items-start gap-3 text-xs text-white/40 leading-relaxed border border-white/[0.08] bg-white/[0.02] p-4">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#00FF88]" />
              <span>
                {t.legalCopy}{" "}
                <Link href="/public-offer" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.offer}</Link>,{" "}
                <Link href="/privacy" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.privacy}</Link>,{" "}
                <Link href="/returns" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.returns}</Link>.
                {errors.consent && <span className="mt-2 block text-red-400">{errors.consent}</span>}
              </span>
            </label>

            <button type="submit" disabled={isSubmitting} className="w-full min-h-12 py-4 font-bold text-xs sm:text-sm uppercase tracking-widest text-black transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]" style={{ background: G }}>
              {isSubmitting ? t.submitting : t.submit}
            </button>

            {paymentError && (
              <div className="border border-red-400/25 bg-red-400/[0.06] p-4 text-xs leading-relaxed text-red-200">
                {paymentError}
              </div>
            )}

            {submitted && (
              <div className="border border-[#00FF88]/25 bg-[#00FF88]/[0.04] p-4 text-sm text-white/55">
                <div className="flex items-center gap-2 font-bold text-white/75 mb-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: G }} />
                  {t.submitted}
                </div>
                <p className="text-xs leading-relaxed mb-4">{t.submitNote}</p>
              </div>
            )}
          </form>
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-widest text-white/35 mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">{icon}</span>
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[10px] text-red-400 mt-1.5">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
