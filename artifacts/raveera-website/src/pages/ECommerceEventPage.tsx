import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Globe,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Ticket,
  Users,
} from "lucide-react";

const G = "#00FF88";
const slug = "e-commerce-conference-2026";

type Lang = "uk" | "en";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
} as const;

const fadeUpChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
} as const;

const tickets = [
  { key: "sport", name: { uk: "STANDARD", en: "STANDARD" }, price: "2 500", popular: false },
  { key: "business", name: { uk: "BUSINESS", en: "BUSINESS" }, price: "6 500", popular: true },
  { key: "online", name: { uk: "ONLINE", en: "ONLINE" }, price: "1", popular: false },
];

const content = {
  uk: {
    back: "Назад",
    language: "EN",
    badge: "RAVE'ERA GROUP · EVENT LANDING",
    heroTitle: "E-Commerce Conference 2026",
    heroSub: "Масштабна українська конференція для eCommerce та product business",
    heroDesc:
      "Подія об'єднує онлайн-ритейлерів, маркетплейси, логістичні компанії, fintech, SaaS-платформи, бренди, агенції та фаундерів, які будують комерцію 2026 року.",
    buyTicket: "Купити квиток",
    viewProgram: "Дивитись програму",
    portfolio: "Портфоліо кейс",
    stats: [
      ["2 000+", "учасників"],
      ["70+", "компаній на expo"],
      ["B2B & B2C", "нетворкінг"],
      ["ECC-2026", "QR-префікс"],
    ],
    aboutTitle: "Конференція для команд, які продають, масштабують і керують товарним бізнесом.",
    aboutIntro: [
      "E-Commerce Conference 2026 створена як робочий майданчик для власників, C-level команд, маркетологів, операційних директорів і технологічних партнерів.",
      "Фокус події - практичні кейси, ринкова аналітика, партнерства та інструменти, які впливають на продажі, маржу, повторні покупки і клієнтський досвід.",
    ],
    audienceTitle: "Для кого ця подія",
    audience: [
      ["Онлайн-ритейлери", "Команди інтернет-магазинів, D2C-брендів і товарного бізнесу."],
      ["Маркетплейси", "Категорійні менеджери, seller teams, платформи та інтегратори."],
      ["Fintech & Payments", "Платіжні провайдери, банки, checkout-рішення, antifraud та BNPL."],
      ["Logistics & Fulfillment", "Оператори доставки, склади, last mile, повернення та сервіс."],
      ["Marketing & SaaS", "Performance, CRM/CDP, automation, analytics та AI tools."],
      ["Founders & Partners", "Власники, інвестори, експоненти, медіа та B2B-партнери."],
    ],
    expectationsTitle: "Що очікувати",
    expectations: [
      "ринкові інсайти про eCommerce growth, омніканальні продажі та поведінку покупців",
      "практичні кейси маркетплейсів, D2C-брендів, fintech і логістичних компаній",
      "expo-зону з 70+ компаніями для партнерств, демонстрацій і лідогенерації",
      "блоки про payments, fulfillment, performance marketing, CRM/CDP, automation і AI",
      "B2B & B2C нетворкінг для власників, керівників, сервісних компаній і брендів",
      "прозорий квитковий flow з AlliancePay, PDF-квитком, QR та admin check-in",
    ],
    programTitle: "Теми програми",
    program: [
      "eCommerce growth: unit economics, retention, LTV і повторні покупки",
      "Маркетплейси: seller growth, категорії, комісії, контент і ціноутворення",
      "Payments & fintech: checkout conversion, Apple Pay, Google Pay, antifraud",
      "Logistics & fulfillment: склад, last mile, повернення, SLA і клієнтський сервіс",
      "Performance marketing: paid media, creatives, attribution, SEO і affiliate",
      "CRM/CDP, automation та AI tools для комерційних команд",
    ],
    expoTitle: "Expo та партнерські можливості",
    expoText:
      "Партнерська зона побудована як комерційний простір: експоненти отримують видимість, контакти та сценарії для прямих B2B-розмов з аудиторією, яка приймає рішення.",
    ticketsTitle: "Формати участі",
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
    locationTitle: "Локація та дата",
    locationText:
      "Точна дата, локація та таймінг будуть опубліковані після фінального підтвердження майданчика. Квитковий flow вже працює в production-інфраструктурі.",
    faqTitle: "Питання перед реєстрацією",
    faqs: [
      ["Як проходить оплата?", "Після заповнення форми сайт створює заявку на квиток і відкриває захищену сторінку AlliancePay."],
      ["Коли буде доступний квиток?", "Квиток видається тільки після серверного підтвердження статусу SUCCESS від AlliancePay."],
      ["Який QR-префікс у квитків?", "Квитки цієї події генеруються з префіксом ECC-2026 та працюють у загальній системі check-in."],
      ["Де юридичні умови?", "Публічна оферта, політика конфіденційності та повернення доступні у футері та на формі квитка."],
    ],
    ctaTitle: "Будьте серед команд, які формують український eCommerce 2026 року.",
    footerBrand: "E-Commerce Conference 2026. Production event by RAVE'ERA GROUP.",
    footerDocs: ["Контакти", "Публічна оферта", "Конфіденційність", "Повернення"],
    seoDescription:
      "E-Commerce Conference 2026 - українська конференція для онлайн-ритейлу, маркетплейсів, fintech, логістики, SaaS, performance marketing та product business.",
  },
  en: {
    back: "Back",
    language: "UA",
    badge: "RAVE'ERA GROUP · EVENT LANDING",
    heroTitle: "E-Commerce Conference 2026",
    heroSub: "A large-scale Ukrainian conference for eCommerce and product business",
    heroDesc:
      "The event connects online retailers, marketplaces, logistics companies, fintech, SaaS platforms, brands, agencies and founders building commerce in 2026.",
    buyTicket: "Buy Ticket",
    viewProgram: "View Program",
    portfolio: "Portfolio case",
    stats: [
      ["2,000+", "attendees"],
      ["70+", "expo companies"],
      ["B2B & B2C", "networking"],
      ["ECC-2026", "QR prefix"],
    ],
    aboutTitle: "A conference for teams that sell, scale and operate product businesses.",
    aboutIntro: [
      "E-Commerce Conference 2026 is built as a practical working platform for owners, C-level teams, marketers, operations leaders and technology partners.",
      "The focus is practical cases, market insights, partnerships and tools that affect sales, margin, repeat purchases and customer experience.",
    ],
    audienceTitle: "Who it is for",
    audience: [
      ["Online retailers", "Teams behind online stores, D2C brands and product businesses."],
      ["Marketplaces", "Category managers, seller teams, platforms and integrators."],
      ["Fintech & Payments", "Payment providers, banks, checkout products, antifraud and BNPL."],
      ["Logistics & Fulfillment", "Delivery operators, warehouses, last mile, returns and service."],
      ["Marketing & SaaS", "Performance, CRM/CDP, automation, analytics and AI tools."],
      ["Founders & Partners", "Owners, investors, exhibitors, media and B2B partners."],
    ],
    expectationsTitle: "What to expect",
    expectations: [
      "market insights on eCommerce growth, omnichannel sales and buyer behavior",
      "practical cases from marketplaces, D2C brands, fintech and logistics companies",
      "an expo zone with 70+ companies for partnerships, demos and lead generation",
      "sessions on payments, fulfillment, performance marketing, CRM/CDP, automation and AI",
      "B2B & B2C networking for owners, executives, service companies and brands",
      "a production ticketing flow with AlliancePay, PDF ticket, QR and admin check-in",
    ],
    programTitle: "Program themes",
    program: [
      "eCommerce growth: unit economics, retention, LTV and repeat purchases",
      "Marketplaces: seller growth, categories, commissions, content and pricing",
      "Payments & fintech: checkout conversion, Apple Pay, Google Pay, antifraud",
      "Logistics & fulfillment: warehouse, last mile, returns, SLA and customer service",
      "Performance marketing: paid media, creatives, attribution, SEO and affiliate",
      "CRM/CDP, automation and AI tools for commerce teams",
    ],
    expoTitle: "Expo and partnership opportunities",
    expoText:
      "The partner zone is designed as a commercial space: exhibitors receive visibility, contacts and scenarios for direct B2B conversations with a decision-making audience.",
    ticketsTitle: "Ticket formats",
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
    locationTitle: "Location and date",
    locationText:
      "The exact date, venue and schedule will be published after final venue confirmation. The ticket flow already runs on the production infrastructure.",
    faqTitle: "Questions before registration",
    faqs: [
      ["How does payment work?", "After the form is submitted, the site creates a ticket request and opens the secure AlliancePay payment page."],
      ["When is the ticket available?", "The ticket is issued only after server-side SUCCESS confirmation from AlliancePay."],
      ["What QR prefix is used?", "Tickets for this event are generated with the ECC-2026 prefix and work in the shared check-in system."],
      ["Where are the legal terms?", "The Public Offer, Privacy Policy and Refund Policy are available in the footer and on the ticket form."],
    ],
    ctaTitle: "Join the teams shaping Ukrainian eCommerce in 2026.",
    footerBrand: "E-Commerce Conference 2026. Production event by RAVE'ERA GROUP.",
    footerDocs: ["Contacts", "Public Offer", "Privacy", "Returns"],
    seoDescription:
      "E-Commerce Conference 2026 is a Ukrainian conference for online retail, marketplaces, fintech, logistics, SaaS, performance marketing and product business.",
  },
} as const;

export default function ECommerceEventPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = content[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSeo(t.heroTitle, t.seoDescription, `https://www.rave-era.com.ua/event/${slug}`);
  }, [t.heroTitle, t.seoDescription]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <nav className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${scrolled ? "border-white/[0.08] bg-black/85 backdrop-blur-md" : "border-transparent bg-black/35"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-12">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/45 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.back}
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang((current) => (current === "uk" ? "en" : "uk"))}
              className="inline-flex min-h-10 items-center gap-2 border border-white/10 px-3 text-[10px] font-mono uppercase tracking-widest text-white/45 transition-colors hover:border-[#00FF88]/40 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]"
              aria-label="Switch language"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              {t.language}
            </button>
            <Link href={`/event/${slug}/ticket-form?type=business`} className="inline-flex min-h-10 items-center gap-2 bg-[#00FF88] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
              <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
              {t.buyTicket}
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative min-h-[94vh] overflow-hidden px-4 pb-14 pt-28 sm:px-6 md:px-12">
        <img src="/images/case-2.png" alt="E-Commerce Conference 2026 expo and audience" className="absolute inset-0 h-full w-full object-cover opacity-35 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/86 to-black/42" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050508] to-transparent" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-5xl">
            <motion.div variants={fadeUpChild} className="mb-6 inline-flex items-center gap-2 border border-[#00FF88]/25 bg-[#00FF88]/[0.07] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              {t.badge}
            </motion.div>
            <motion.p variants={fadeUpChild} className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-white/45">{t.heroSub}</motion.p>
            <motion.h1 variants={fadeUpChild} className="max-w-5xl text-4xl font-black uppercase leading-[0.88] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              {t.heroTitle}
            </motion.h1>
            <motion.p variants={fadeUpChild} className="mt-6 max-w-2xl text-base leading-relaxed text-white/62 sm:text-lg">{t.heroDesc}</motion.p>
            <motion.div variants={fadeUpChild} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/event/${slug}/ticket-form?type=business`} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#00FF88] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
                {t.buyTicket}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#program" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-[#00FF88]/50 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                {t.viewProgram}
              </a>
              <Link href="/portfolio/e-commerce-conference-2026" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                {t.portfolio}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-2 gap-3">
            {t.stats.map(([value, label]) => (
              <motion.div key={`${value}-${label}`} variants={fadeUpChild} className="border border-white/[0.08] bg-black/45 p-5 backdrop-blur-sm">
                <p className="text-2xl font-black tracking-tight text-white">{value}</p>
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
              <motion.p variants={fadeUpChild} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">01 / POSITIONING</motion.p>
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.aboutTitle}</motion.h2>
            </div>
            <div className="space-y-5">
              {t.aboutIntro.map((paragraph) => (
                <motion.p key={paragraph} variants={fadeUpChild} className="text-sm leading-relaxed text-white/55 sm:text-base">{paragraph}</motion.p>
              ))}
            </div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}>
            <motion.p variants={fadeUpChild} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">02 / AUDIENCE</motion.p>
            <motion.h2 variants={fadeUpChild} className="mb-10 text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.audienceTitle}</motion.h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {t.audience.map(([heading, copy]) => (
                <motion.div key={heading} variants={fadeUpChild} className="border border-white/[0.08] bg-white/[0.02] p-5">
                  <Users className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                  <h3 className="text-sm font-black uppercase tracking-tight">{heading}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/45">{copy}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        <Section id="program">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="grid gap-10 lg:grid-cols-2">
            <div>
              <motion.p variants={fadeUpChild} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">03 / EXPECTATIONS</motion.p>
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.expectationsTitle}</motion.h2>
              <div className="mt-8 space-y-3">
                {t.expectations.map((item, index) => (
                  <motion.div key={item} variants={fadeUpChild} className="flex items-start gap-3">
                    <span className="mt-0.5 text-xs font-mono font-bold text-[#00FF88]">{String(index + 1).padStart(2, "0")}</span>
                    <p className="text-sm leading-relaxed text-white/52">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <motion.p variants={fadeUpChild} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">04 / PROGRAM</motion.p>
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.programTitle}</motion.h2>
              <div className="mt-8 grid gap-3">
                {t.program.map((item) => (
                  <motion.div key={item} variants={fadeUpChild} className="border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-sm leading-relaxed text-white/56">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div variants={fadeUpChild} className="relative overflow-hidden">
              <img src="/images/case-smart-commerce.jpg" alt="E-Commerce Conference partner expo" className="aspect-video w-full object-cover grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </motion.div>
            <div>
              <motion.p variants={fadeUpChild} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">05 / EXPO</motion.p>
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.expoTitle}</motion.h2>
              <motion.p variants={fadeUpChild} className="mt-6 text-sm leading-relaxed text-white/55 sm:text-base">{t.expoText}</motion.p>
            </div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}>
            <motion.p variants={fadeUpChild} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">06 / TICKETS</motion.p>
            <motion.h2 variants={fadeUpChild} className="mb-10 text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.ticketsTitle}</motion.h2>
            <div className="grid gap-4 md:grid-cols-3">
              {tickets.map((tier) => (
                <motion.div key={tier.key} variants={fadeUpChild} className={`relative flex flex-col border p-6 ${tier.popular ? "border-[#00FF88]/35 bg-[#00FF88]/[0.04]" : "border-white/[0.08] bg-white/[0.02]"}`}>
                  {tier.popular ? <span className="absolute -top-3 left-5 bg-[#00FF88] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-black">{t.popular}</span> : null}
                  <p className="text-xs font-mono uppercase tracking-widest text-white/35">{tier.name[lang]}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <p className="text-5xl font-black tracking-tight" style={{ color: tier.popular ? G : "white" }}>{tier.price}</p>
                    <span className="text-sm font-mono text-white/30">UAH</span>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-white/45">{t.ticketDescriptions[tier.key as keyof typeof t.ticketDescriptions]}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {t.ticketFeatures[tier.key as keyof typeof t.ticketFeatures].map((feature) => (
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
            <motion.div variants={fadeUpChild} className="mt-8 border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <p className="mx-auto mb-4 max-w-3xl text-xs leading-relaxed text-white/40">{t.paymentNote}</p>
              <PaymentLogos />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/25">
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                {t.secureBadges}
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs">
                <Link href="/contacts" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.footerDocs[0]}</Link>
                <Link href="/public-offer" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.footerDocs[1]}</Link>
                <Link href="/privacy" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.footerDocs[2]}</Link>
                <Link href="/returns" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.footerDocs[3]}</Link>
              </div>
            </motion.div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="grid gap-8 lg:grid-cols-2">
            <motion.div variants={fadeUpChild} className="border border-white/[0.08] bg-white/[0.02] p-6">
              <MapPin className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
              <h2 className="text-2xl font-black uppercase tracking-tight">{t.locationTitle}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/50">{t.locationText}</p>
            </motion.div>
            <motion.div variants={fadeUpChild} className="border border-white/[0.08] bg-white/[0.02] p-6">
              <PackageCheck className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
              <h2 className="text-2xl font-black uppercase tracking-tight">QR / PDF / EMAIL</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/50">
                ECC-2026 tickets are issued only after verified payment success and use the shared PDF, email, public ticket page and admin check-in pipeline.
              </p>
            </motion.div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="mx-auto max-w-3xl">
            <motion.p variants={fadeUpChild} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">FAQ</motion.p>
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
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm leading-relaxed text-white/45">{answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        <section className="border-t border-white/[0.05] px-4 py-16 text-center sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.ctaTitle}</h2>
            <Link href={`/event/${slug}/ticket-form?type=business`} className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-[#00FF88] px-8 py-4 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
              {t.buyTicket}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-4 py-10 sm:px-6 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <p className="text-base font-black uppercase tracking-tight">RAVE'ERA <span className="text-[#00FF88]">GROUP</span></p>
            <p className="mt-3 text-xs leading-relaxed text-white/35">{t.footerBrand}</p>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Organizer</p>
            <p className="text-xs leading-relaxed text-white/35">ФОП Чекан Богдан Орестович</p>
            <p className="text-xs leading-relaxed text-white/25">ІПН / РНОКПП: 3411613291</p>
            <p className="text-xs leading-relaxed text-white/25">IBAN: UA303001190000026006744298001</p>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Documents</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["/contacts", t.footerDocs[0]],
                ["/public-offer", t.footerDocs[1]],
                ["/privacy", t.footerDocs[2]],
                ["/returns", t.footerDocs[3]],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="inline-flex min-h-10 items-center text-xs text-white/35 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                  {label}
                </Link>
              ))}
            </div>
          </div>
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
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = canonicalUrl;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
}
