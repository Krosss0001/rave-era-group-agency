import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  Globe,
  MapPin,
  Mic2,
  PackageCheck,
  ShoppingBag,
  Ticket,
  Users,
  Zap,
} from "lucide-react";

const G = "#00FF88";
const slug = "e-commerce-conference-2026";
const canonical = "https://www.rave-era.com.ua/event/e-commerce-conference-2026";
const mapUrl = "https://www.google.com/maps?q=Kyiv%20Ukraine&output=embed";
const mapExternal = "https://www.google.com/maps/search/?api=1&query=Kyiv%20Ukraine";

type Lang = "uk" | "en";
type TicketKey = "sport" | "business" | "online";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
} as const;

const fadeUpChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
} as const;

const tickets: Array<{ key: TicketKey; name: string; price: string; popular?: boolean }> = [
  { key: "sport", name: "STANDARD", price: "2 500" },
  { key: "business", name: "BUSINESS", price: "6 500", popular: true },
  { key: "online", name: "ONLINE", price: "1" },
];

const leaders = [
  "Online retail",
  "Marketplaces",
  "Logistics",
  "Fintech & payments",
  "Performance marketing",
  "CRM/CDP",
  "AI commerce tools",
  "Brands & founders",
];

const content = {
  uk: {
    back: "Назад",
    buyTicket: "Купити квиток",
    viewProgram: "Програма",
    badge: "RAVE'ERA GROUP · EVENT LANDING",
    heroTitle: "E-Commerce Conference 2026",
    heroSub: "Головна подія року для eCommerce, маркетплейсів, логістики, фінтеху та digital commerce в Україні.",
    heroDesc:
      "Велика українська eCommerce конференція для онлайн-ритейлу, маркетплейсів, логістики, фінтеху, платежів, performance marketing, CRM/CDP, автоматизації, AI commerce tools, фаундерів і брендів.",
    meta: ["2026", "Kyiv, Ukraine", "ECC-2026 tickets", "B2B & B2C sales"],
    stats: [
      ["2 000+", "учасників"],
      ["70+", "expo-компаній"],
      ["B2B & B2C", "продажі"],
      ["Практичні", "кейси та інсайти"],
    ],
    aboutTitle: "Конференція для команд, які продають, масштабують і керують commerce-бізнесом.",
    aboutCopy: [
      "E-Commerce Conference 2026 об'єднує власників, C-level команди, маркетологів, операційних директорів, технологічних партнерів, банки, платіжні сервіси, логістичні компанії та бренди.",
      "Фокус події - практичні кейси, ринкові інсайти, партнерства та інструменти, які впливають на продажі, маржу, повторні покупки і клієнтський досвід.",
    ],
    aboutPoints: [
      "online retail, D2C, marketplaces і товарний бізнес",
      "payments, fintech, checkout conversion та antifraud",
      "fulfillment, last mile, повернення і сервіс",
      "performance, CRM/CDP, автоматизація та AI commerce tools",
    ],
    leadersTitle: "Маркет-лідери та практики, які будують commerce 2026 року.",
    leadersText:
      "Сцена і expo створені для діалогу між тими, хто приймає рішення: ритейлерами, маркетплейсами, логістичними операторами, платіжними компаніями, SaaS-платформами, агенціями та брендами.",
    programTitle: "День для рішень, контактів і нової оптики ринку.",
    program: [
      "eCommerce growth: unit economics, retention, LTV і повторні покупки",
      "Marketplaces: seller growth, категорії, комісії, контент і ціноутворення",
      "Payments & fintech: checkout conversion, Apple Pay, Google Pay, antifraud",
      "Logistics & fulfillment: склад, last mile, повернення, SLA і клієнтський сервіс",
      "Performance marketing: paid media, creatives, attribution, SEO та affiliate",
      "CRM/CDP, автоматизація і AI tools для commerce-команд",
    ],
    ticketsTitle: "Три формати участі з прозорою оплатою",
    ticketDescriptions: {
      sport: "Офлайн-доступ до конференції, expo-зони, нетворкінгу, пакета учасника та фото/відео звіту.",
      business: "STANDARD-доступ плюс business lounge, пріоритетний вхід, матеріали спікерів, преміальний нетворкінг і запис події.",
      online: "Дистанційний доступ до онлайн-трансляції та відеозапису події.",
    },
    ticketFeatures: {
      sport: ["Конференція та expo-зона", "B2B & B2C нетворкінг", "Пакет учасника", "Фото/відео звіт"],
      business: ["Business lounge", "Пріоритетний вхід", "Матеріали спікерів", "Преміальний нетворкінг", "Відеозапис події"],
      online: ["Онлайн-трансляція", "Відеозапис події"],
    },
    popular: "Популярний",
    paymentNote:
      "Оплата проходить через захищену платіжну сторінку AlliancePay. Дані платіжної картки не вводяться, не обробляються та не зберігаються на цьому сайті.",
    secureBadges: "SSL Secure · AlliancePay HPP · Visa · Mastercard · Apple Pay · Google Pay",
    locationTitle: "Kyiv, Ukraine",
    locationText:
      "Фінальна дата, майданчик і таймінг будуть опубліковані після підтвердження локації. Квитковий flow вже працює на production-інфраструктурі RAVE'ERA GROUP.",
    venue: "Kyiv venue TBA",
    duration: "Full day program",
    mapOpen: "Відкрити на Google Maps",
    faqTitle: "Питання перед реєстрацією",
    faqs: [
      ["Як проходить оплата?", "Після заповнення форми сайт створює заявку на квиток і відкриває захищену сторінку оплати AlliancePay."],
      ["Коли буде доступний квиток?", "Квиток видається тільки після серверного підтвердження статусу SUCCESS від AlliancePay."],
      ["Який QR-префікс у квитків?", "Квитки цієї події генеруються з префіксом ECC-2026 та працюють у загальній системі admin check-in."],
      ["Які формати квитків доступні?", "STANDARD за 2 500 грн, BUSINESS за 6 500 грн та ONLINE за 1 грн для тестового онлайн-формату."],
      ["Де юридичні умови?", "Публічна оферта, політика конфіденційності та політика повернення доступні у футері та на формі квитка."],
    ],
    ctaTitle: "Будьте серед команд, які формують український eCommerce 2026 року.",
    footerBrand: "E-Commerce Conference 2026. Production event by RAVE'ERA GROUP.",
    footerOrgLabel: "Організатор",
    footerContactsLabel: "Контакти",
    footerDocsLabel: "Документи",
    footerDocContacts: "Контакти",
    footerDocOffer: "Публічна оферта",
    footerDocPrivacy: "Конфіденційність",
    footerDocReturns: "Повернення",
    footerRights: "Всі права захищено. E-Commerce Conference 2026",
    seoDescription:
      "E-Commerce Conference 2026 - українська конференція для онлайн-ритейлу, маркетплейсів, логістики, фінтеху, payments, performance marketing, CRM/CDP, automation та AI commerce tools.",
  },
  en: {
    back: "Back",
    buyTicket: "Buy Ticket",
    viewProgram: "Program",
    badge: "RAVE'ERA GROUP · EVENT LANDING",
    heroTitle: "E-Commerce Conference 2026",
    heroSub: "The flagship Ukrainian conference for eCommerce, marketplaces, logistics, fintech and digital commerce.",
    heroDesc:
      "A large Ukrainian eCommerce conference for online retail, marketplaces, logistics, fintech, payments, performance marketing, CRM/CDP, automation, AI commerce tools, founders and brands.",
    meta: ["2026", "Kyiv, Ukraine", "ECC-2026 tickets", "B2B & B2C sales"],
    stats: [
      ["2,000+", "attendees"],
      ["70+", "expo companies"],
      ["B2B & B2C", "sales"],
      ["Practical", "cases and insights"],
    ],
    aboutTitle: "A conference for teams that sell, scale and operate commerce businesses.",
    aboutCopy: [
      "E-Commerce Conference 2026 brings together owners, C-level teams, marketers, operations leaders, technology partners, banks, payment providers, logistics companies and brands.",
      "The event focuses on practical cases, market insights, partnerships and tools that affect sales, margin, repeat purchases and customer experience.",
    ],
    aboutPoints: [
      "online retail, D2C, marketplaces and product business",
      "payments, fintech, checkout conversion and antifraud",
      "fulfillment, last mile, returns and service",
      "performance, CRM/CDP, automation and AI commerce tools",
    ],
    leadersTitle: "Market leaders and operators building commerce in 2026.",
    leadersText:
      "The stage and expo are designed for decision-makers: retailers, marketplaces, logistics operators, payment companies, SaaS platforms, agencies and brands.",
    programTitle: "A day for decisions, contacts and a sharper view of the market.",
    program: [
      "eCommerce growth: unit economics, retention, LTV and repeat purchases",
      "Marketplaces: seller growth, categories, commissions, content and pricing",
      "Payments & fintech: checkout conversion, Apple Pay, Google Pay and antifraud",
      "Logistics & fulfillment: warehouse, last mile, returns, SLA and customer service",
      "Performance marketing: paid media, creatives, attribution, SEO and affiliate",
      "CRM/CDP, automation and AI tools for commerce teams",
    ],
    ticketsTitle: "Three participation formats with transparent payment",
    ticketDescriptions: {
      sport: "Offline access to the conference, expo zone, networking, participant package and photo/video report.",
      business: "STANDARD access plus business lounge, priority entry, speaker materials, premium networking and event recording.",
      online: "Remote access to the online broadcast and event recording.",
    },
    ticketFeatures: {
      sport: ["Conference and expo zone", "B2B & B2C networking", "Participant package", "Photo/video report"],
      business: ["Business lounge", "Priority entry", "Speaker materials", "Premium networking", "Event recording"],
      online: ["Online stream", "Event recording"],
    },
    popular: "Popular",
    paymentNote:
      "Payment is processed through the secure AlliancePay hosted payment page. Card data is not entered, processed or stored on this site.",
    secureBadges: "SSL Secure · AlliancePay HPP · Visa · Mastercard · Apple Pay · Google Pay",
    locationTitle: "Kyiv, Ukraine",
    locationText:
      "The final date, venue and schedule will be published after venue confirmation. The ticket flow already runs on RAVE'ERA GROUP production infrastructure.",
    venue: "Kyiv venue TBA",
    duration: "Full day program",
    mapOpen: "Open in Google Maps",
    faqTitle: "Questions before registration",
    faqs: [
      ["How does payment work?", "After the form is submitted, the site creates a ticket request and opens the secure AlliancePay payment page."],
      ["When is the ticket available?", "The ticket is issued only after server-side SUCCESS confirmation from AlliancePay."],
      ["What QR prefix is used?", "Tickets for this event are generated with the ECC-2026 prefix and work in the shared admin check-in system."],
      ["What ticket formats are available?", "STANDARD for 2,500 UAH, BUSINESS for 6,500 UAH and ONLINE for 1 UAH for the test online format."],
      ["Where are the legal terms?", "The Public Offer, Privacy Policy and Refund Policy are available in the footer and on the ticket form."],
    ],
    ctaTitle: "Join the teams shaping Ukrainian eCommerce in 2026.",
    footerBrand: "E-Commerce Conference 2026. Production event by RAVE'ERA GROUP.",
    footerOrgLabel: "Organizer",
    footerContactsLabel: "Contacts",
    footerDocsLabel: "Documents",
    footerDocContacts: "Contacts",
    footerDocOffer: "Public Offer",
    footerDocPrivacy: "Privacy",
    footerDocReturns: "Returns",
    footerRights: "All rights reserved. E-Commerce Conference 2026",
    seoDescription:
      "E-Commerce Conference 2026 is a Ukrainian conference for online retail, marketplaces, logistics, fintech, payments, performance marketing, CRM/CDP, automation and AI commerce tools.",
  },
} as const;

export default function ECommerceEventPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setSeo("E-Commerce Conference 2026", content[lang].seoDescription, canonical);
  }, [lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = content[lang];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050508] text-white selection:bg-[#00FF88] selection:text-black">
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/[0.08] bg-black/86 backdrop-blur-md" : "bg-black/25"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-12">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/50 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.back}
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/event/${slug}/ticket-form?type=business`} className="hidden min-h-10 items-center bg-[#00FF88] px-4 text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88] sm:inline-flex">
              {t.buyTicket}
            </Link>
            <button
              type="button"
              onClick={() => setLang(lang === "uk" ? "en" : "uk")}
              className="inline-flex min-h-10 items-center gap-1 border border-white/10 px-3 text-[10px] font-mono uppercase tracking-widest text-white/45 transition-colors hover:border-[#00FF88]/40 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]"
              aria-label="Switch language"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span className={lang === "uk" ? "text-[#00FF88]" : ""}>UA</span>
              <span className="text-white/20">/</span>
              <span className={lang === "en" ? "text-[#00FF88]" : ""}>EN</span>
            </button>
          </div>
        </div>
      </nav>

      <header className="relative flex min-h-screen items-end overflow-hidden px-4 pb-14 pt-28 sm:px-6 md:px-12 md:pb-20">
        <div className="absolute inset-0">
          <img src="/images/case-smart-commerce.jpg" alt="E-Commerce Conference expo and stage atmosphere" className="h-full w-full object-cover opacity-52 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/45" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#050508] to-transparent" />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-5xl">
            <motion.div variants={fadeUpChild} className="mb-6 inline-flex items-center gap-2 border border-[#00FF88]/25 bg-[#00FF88]/[0.07] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-[#00FF88]">
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              {t.badge}
            </motion.div>
            <motion.h1 variants={fadeUpChild} className="max-w-5xl break-words text-4xl font-black uppercase leading-[0.88] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              {t.heroTitle}
            </motion.h1>
            <motion.p variants={fadeUpChild} className="mt-6 max-w-3xl text-base font-semibold leading-relaxed text-white/76 sm:text-xl">
              {t.heroSub}
            </motion.p>
            <motion.p variants={fadeUpChild} className="mt-4 max-w-2xl text-sm leading-relaxed text-white/52 sm:text-base">
              {t.heroDesc}
            </motion.p>
            <motion.div variants={fadeUpChild} className="mt-7 flex flex-wrap gap-2">
              {t.meta.map((item) => (
                <span key={item} className="inline-flex min-h-10 items-center gap-2 border border-white/[0.1] bg-black/35 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-white/48 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 bg-[#00FF88]" />
                  {item}
                </span>
              ))}
            </motion.div>
            <motion.div variants={fadeUpChild} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/event/${slug}/ticket-form?type=business`} className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden bg-[#00FF88] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
                <span className="relative z-10">{t.buyTicket}</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                <motion.span className="absolute inset-0 bg-white" initial={{ x: "-100%" }} whileHover={{ x: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} />
              </Link>
              <a href="#program" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-[#00FF88]/50 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                {t.viewProgram}
              </a>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-2 gap-3">
            {t.stats.map(([value, label]) => (
              <motion.div key={`${value}-${label}`} variants={fadeUpChild} className="border border-white/[0.08] bg-black/50 p-5 backdrop-blur-sm">
                <p className="break-words text-2xl font-black tracking-tight text-white sm:text-3xl">{value}</p>
                <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/35">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </header>

      <main>
        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionBadge icon={<Zap className="h-3.5 w-3.5" />} label="01 / Event" />
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.aboutTitle}</motion.h2>
            </div>
            <div>
              <div className="space-y-5">
                {t.aboutCopy.map((paragraph) => (
                  <motion.p key={paragraph} variants={fadeUpChild} className="text-sm leading-relaxed text-white/56 sm:text-base">{paragraph}</motion.p>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {t.aboutPoints.map((point) => (
                  <motion.div key={point} variants={fadeUpChild} className="border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-white/50">
                    <CheckCircle2 className="mb-3 h-4 w-4 text-[#00FF88]" aria-hidden="true" />
                    {point}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}>
            <SectionBadge icon={<Mic2 className="h-3.5 w-3.5" />} label="02 / Market Leaders" />
            <motion.div variants={fadeUpChild} className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.leadersTitle}</h2>
              <p className="text-sm leading-relaxed text-white/50 sm:text-base">{t.leadersText}</p>
            </motion.div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {leaders.map((leader) => (
                <motion.div key={leader} variants={fadeUpChild} className="group border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-[#00FF88]/35">
                  <Users className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                  <p className="text-sm font-black uppercase tracking-tight text-white/76">{leader}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        <Section id="program">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <SectionBadge icon={<Calendar className="h-3.5 w-3.5" />} label="03 / Program" />
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.programTitle}</motion.h2>
            </div>
            <div className="space-y-4">
              {t.program.map((item, index) => (
                <motion.div key={item} variants={fadeUpChild} className="flex items-start gap-4 border-b border-white/[0.06] pb-4">
                  <span className="mt-0.5 shrink-0 text-xs font-mono font-bold text-[#00FF88]">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-sm leading-relaxed text-white/56 sm:text-base">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}>
            <SectionBadge icon={<Ticket className="h-3.5 w-3.5" />} label="04 / Tickets" />
            <motion.h2 variants={fadeUpChild} className="mb-10 text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.ticketsTitle}</motion.h2>
            <div className="grid gap-4 md:grid-cols-3">
              {tickets.map((tier) => (
                <motion.div key={tier.key} variants={fadeUpChild} className={`relative flex flex-col border p-6 ${tier.popular ? "border-[#00FF88]/35 bg-[#00FF88]/[0.04]" : "border-white/[0.08] bg-white/[0.02]"}`}>
                  {tier.popular ? <span className="absolute -top-3 left-5 bg-[#00FF88] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-black">{t.popular}</span> : null}
                  <p className="text-xs font-mono uppercase tracking-widest text-white/35">{tier.name}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <p className="text-5xl font-black tracking-tight" style={{ color: tier.popular ? G : "white" }}>{tier.price}</p>
                    <span className="text-sm font-mono text-white/30">UAH</span>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-white/45">{t.ticketDescriptions[tier.key]}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {t.ticketFeatures[tier.key].map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-white/50">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FF88]" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/event/${slug}/ticket-form?type=${tier.key}`} className={`mt-7 inline-flex min-h-11 items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88] ${tier.popular ? "bg-[#00FF88] text-black hover:bg-white" : "border border-white/15 text-white/70 hover:border-[#00FF88]/45 hover:text-[#00FF88]"}`}>
                    {t.buyTicket}
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUpChild} className="mt-8 border border-white/[0.06] bg-white/[0.02] p-5 text-center sm:p-6">
              <p className="mx-auto mb-4 max-w-3xl text-xs leading-relaxed text-white/40">{t.paymentNote}</p>
              <PaymentLogos />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/25">
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                {t.secureBadges}
              </div>
            </motion.div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionBadge icon={<MapPin className="h-3.5 w-3.5" />} label="05 / Location" />
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.locationTitle}</motion.h2>
              <motion.p variants={fadeUpChild} className="mt-5 text-sm leading-relaxed text-white/50 sm:text-base">{t.locationText}</motion.p>
              <motion.div variants={fadeUpChild} className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex min-h-10 items-center gap-2 border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-mono text-white/52">
                  <MapPin className="h-3.5 w-3.5 text-[#00FF88]" aria-hidden="true" />
                  {t.venue}
                </span>
                <span className="inline-flex min-h-10 items-center gap-2 border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-mono text-white/52">
                  <Clock className="h-3.5 w-3.5 text-[#00FF88]" aria-hidden="true" />
                  {t.duration}
                </span>
              </motion.div>
              <motion.a variants={fadeUpChild} href={mapExternal} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-10 items-center gap-2 border border-[#00FF88]/30 px-4 py-2 text-xs font-mono uppercase tracking-widest text-[#00FF88] transition-colors hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                {t.mapOpen}
              </motion.a>
            </div>
            <motion.div variants={fadeUpChild} className="overflow-hidden border border-white/[0.06] bg-white/[0.02]">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                className="aspect-[4/3] w-full sm:aspect-video"
                style={{ border: 0, filter: "grayscale(100%) invert(92%)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t.locationTitle}
              />
            </motion.div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="mx-auto max-w-3xl">
            <SectionBadge icon={<PackageCheck className="h-3.5 w-3.5" />} label="06 / FAQ" />
            <motion.h2 variants={fadeUpChild} className="mb-8 text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.faqTitle}</motion.h2>
            <div className="space-y-3">
              {t.faqs.map(([question, answer], index) => (
                <motion.div key={question} variants={fadeUpChild} className="border border-white/[0.08] bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex min-h-12 w-full items-center justify-between gap-4 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]"
                  >
                    <span className="text-sm font-bold text-white/72">{question}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#00FF88] transition-transform ${openFaq === index ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                  <AnimatePresence>
                    {openFaq === index ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm leading-relaxed text-white/45">{answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        <section className="relative overflow-hidden border-t border-white/[0.05] px-4 py-20 text-center sm:px-6 md:px-12 md:py-32">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.09),transparent_48%)]" />
          <div className="relative mx-auto max-w-4xl">
            <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl md:text-6xl">{t.ctaTitle}</h2>
            <Link href={`/event/${slug}/ticket-form?type=business`} className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-[#00FF88] px-8 py-4 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
              {t.buyTicket}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-4 py-10 sm:px-6 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-black uppercase tracking-tight">RAVE'ERA <span className="text-[#00FF88]">GROUP</span></p>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/25">E-COMMERCE CONFERENCE 2026</p>
            <p className="mt-4 text-xs leading-relaxed text-white/35">{t.footerBrand}</p>
          </div>
          <div>
            <FooterLabel>{t.footerOrgLabel}</FooterLabel>
            <div className="space-y-2 text-xs leading-relaxed text-white/35">
              <p className="font-bold text-white/52">ФОП Чекан Богдан Орестович</p>
              <p className="font-mono text-white/30">ІПН / РНОКПП: 3411613291</p>
              <p className="font-mono text-white/30">КВЕД 90.01 Театральна та концертна діяльність</p>
              <p className="font-mono text-white/30">КВЕД 90.03 Індивідуальна мистецька діяльність</p>
              <p className="font-mono text-white/25">Bank: JSC Alliance Bank</p>
              <p className="break-words font-mono text-white/25">IBAN: UA303001190000026006744298001</p>
              <p className="font-mono text-white/25">Currency: UAH</p>
            </div>
          </div>
          <div>
            <FooterLabel>{t.footerContactsLabel}</FooterLabel>
            <div className="space-y-2 text-xs leading-relaxed text-white/35">
              <p><span className="font-mono text-white/25">Email:</span> <a href="mailto:ceo@rave-era.com.ua" className="inline-flex min-h-10 items-center transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">ceo@rave-era.com.ua</a></p>
              <p><span className="font-mono text-white/25">Phone:</span> <a href="tel:+380934307551" className="inline-flex min-h-10 items-center transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">+38 (093) 430-75-51</a></p>
              <p><span className="font-mono text-white/25">Telegram:</span> <a href="https://t.me/bogdan_chekan" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">@bogdan_chekan</a></p>
            </div>
          </div>
          <div>
            <FooterLabel>{t.footerDocsLabel}</FooterLabel>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["/contacts", t.footerDocContacts],
                ["/public-offer", t.footerDocOffer],
                ["/privacy", t.footerDocPrivacy],
                ["/returns", t.footerDocReturns],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="inline-flex min-h-10 items-center border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white/35 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/[0.05] pt-6 sm:flex-row">
          <p className="text-[10px] font-mono text-white/18">{t.footerRights}</p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/15">RAVE'ERA GROUP · <span className="text-[#00FF88]">ECC-2026</span></p>
        </div>
      </footer>
    </div>
  );
}

function Section({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <section id={id} className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <motion.div variants={fadeUpChild} className="mb-6 inline-flex items-center gap-2 border border-[#00FF88]/20 bg-[#00FF88]/[0.05] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-[#00FF88]">
      {icon}
      {label}
    </motion.div>
  );
}

function FooterLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
      <span className="h-1 w-1 bg-[#00FF88]" />
      {children}
    </p>
  );
}

function PaymentLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {[
        ["/images/payment-visa.png", "Visa"],
        ["/images/payment-mastercard.png", "Mastercard"],
        ["/images/payment-applepay.png", "Apple Pay"],
        ["/images/payment-googlepay.png", "Google Pay"],
        ["/images/payment-alliancepay.png", "AlliancePay"],
      ].map(([src, alt]) => (
        <div key={alt} className="flex h-8 items-center justify-center rounded-md bg-white px-2.5">
          <img src={src} alt={alt} className="h-4 w-auto object-contain" />
        </div>
      ))}
    </div>
  );
}

function setSeo(pageTitle: string, pageDescription: string, canonicalUrl: string) {
  document.title = `${pageTitle} | RAVE'ERA GROUP`;
  setMeta("description", pageDescription);
  setMeta("og:title", pageTitle, "property");
  setMeta("og:description", pageDescription, "property");
  setMeta("og:url", canonicalUrl, "property");
  setMeta("twitter:title", pageTitle);
  setMeta("twitter:description", pageDescription);
  const canonicalElement = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonicalElement) canonicalElement.href = canonicalUrl;
}

function setMeta(name: string, metaContent: string, attr: "name" | "property" = "name") {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = metaContent;
}
