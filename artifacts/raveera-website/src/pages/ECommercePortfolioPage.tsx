import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Globe,
  LineChart,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Users,
} from "lucide-react";

const G = "#00FF88";
type Lang = "uk" | "en";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
} as const;

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;

const copy = {
  uk: {
    language: "EN",
    back: "Портфоліо",
    eventPage: "Сторінка події",
    ticketForm: "Квитки",
    badge: "Portfolio case · Production event",
    title: "E-Commerce Conference 2026",
    intro:
      "Преміальний production-кейс бізнес-конференції для eCommerce, маркетплейсів, fintech, логістики, SaaS, performance marketing та власників товарного бізнесу.",
    metrics: [
      ["2 000+", "учасників"],
      ["70+", "компаній на expo"],
      ["B2B & B2C", "нетворкінг"],
      ["ECC-2026", "ticket prefix"],
    ],
    roleTitle: "Наша роль",
    roleText:
      "RAVE'ERA GROUP формує подію як комерційний продукт: позиціонування, промо, B2B/B2C продажі, партнерські пакети, ticketing, payment, PDF, email, QR та check-in.",
    challengeTitle: "Виклик",
    challengeText:
      "Ринок eCommerce перенасичений точковими подіями та вебінарами. Завдання - створити офлайн-платформу, де власники, бренди, сервіси та технологічні партнери отримують не натхнення, а контакти, угоди, практичні кейси та вимірювану користь.",
    solutionTitle: "Рішення",
    solutionText:
      "Конференція збудована навколо чітких комерційних сценаріїв: expo-зона для партнерів, B2B-нетворкінг, програма за ключовими блоками growth/payments/logistics/CRM/AI та production-ready квиткова система.",
    servicesTitle: "Кампанія та сервіси",
    services: [
      "Позиціонування і комунікаційна рамка для product business аудиторії",
      "Побудова квиткової воронки з AlliancePay та прозорими форматами участі",
      "Партнерські пропозиції для expo, fintech, logistics, SaaS і marketing-компаній",
      "Контентні блоки навколо growth, marketplaces, payments, fulfillment, AI та retention",
      "PDF-квиток, email-доставка, QR payload і admin check-in для контролю входу",
    ],
    impactTitle: "Очікуваний бізнес-ефект",
    impact: [
      ["Lead generation", "Партнери отримують прямий доступ до аудиторії, що приймає рішення."],
      ["Ticket revenue", "Подія монетизується через STANDARD, BUSINESS та ONLINE формати."],
      ["Market authority", "Конференція закріплює RAVE'ERA як production-партнера для B2B подій."],
      ["Operational control", "Уся інфраструктура квитків, QR і check-in працює в одній системі."],
    ],
    ctaTitle: "Відкрити production event і квитковий flow.",
    legal: "Оплата, публічна оферта, політика конфіденційності та повернення використовують чинні юридичні сторінки RAVE'ERA GROUP.",
    legalLinks: ["Контакти", "Публічна оферта", "Конфіденційність", "Повернення"],
    seo:
      "Портфоліо кейс E-Commerce Conference 2026: 2 000+ учасників, 70+ expo-компаній, production, ticketing, AlliancePay, PDF, email, QR і check-in від RAVE'ERA GROUP.",
  },
  en: {
    language: "UA",
    back: "Portfolio",
    eventPage: "Event page",
    ticketForm: "Tickets",
    badge: "Portfolio case · Production event",
    title: "E-Commerce Conference 2026",
    intro:
      "A premium production case for a business conference serving eCommerce, marketplaces, fintech, logistics, SaaS, performance marketing and product business owners.",
    metrics: [
      ["2,000+", "attendees"],
      ["70+", "expo companies"],
      ["B2B & B2C", "networking"],
      ["ECC-2026", "ticket prefix"],
    ],
    roleTitle: "Our role",
    roleText:
      "RAVE'ERA GROUP shapes the event as a commercial product: positioning, promotion, B2B/B2C sales, partner packages, ticketing, payment, PDF, email, QR and check-in.",
    challengeTitle: "Challenge",
    challengeText:
      "The eCommerce market is overloaded with fragmented meetups and webinars. The task is to create an offline platform where owners, brands, services and technology partners gain contacts, deals, practical cases and measurable business value.",
    solutionTitle: "Solution",
    solutionText:
      "The conference is built around clear commercial scenarios: partner expo, B2B networking, program blocks for growth/payments/logistics/CRM/AI and a production-ready ticketing system.",
    servicesTitle: "Campaign and services",
    services: [
      "Positioning and communication frame for product business audiences",
      "Ticket funnel with AlliancePay and clear participation formats",
      "Partner packages for expo, fintech, logistics, SaaS and marketing companies",
      "Content blocks around growth, marketplaces, payments, fulfillment, AI and retention",
      "PDF ticket, email delivery, QR payload and admin check-in for access control",
    ],
    impactTitle: "Expected business impact",
    impact: [
      ["Lead generation", "Partners receive direct access to a decision-making audience."],
      ["Ticket revenue", "The event monetizes through STANDARD, BUSINESS and ONLINE formats."],
      ["Market authority", "The conference strengthens RAVE'ERA as a production partner for B2B events."],
      ["Operational control", "Ticketing, QR and check-in infrastructure work in one system."],
    ],
    ctaTitle: "Open the production event and ticket flow.",
    legal: "Payment, Public Offer, Privacy Policy and Refund Policy use the live legal pages of RAVE'ERA GROUP.",
    legalLinks: ["Contacts", "Public Offer", "Privacy", "Returns"],
    seo:
      "Portfolio case for E-Commerce Conference 2026: 2,000+ attendees, 70+ expo companies, production, ticketing, AlliancePay, PDF, email, QR and check-in by RAVE'ERA GROUP.",
  },
} as const;

const capabilityCards = [
  { Icon: Users, key: "Audience" },
  { Icon: Building2, key: "Expo" },
  { Icon: Megaphone, key: "Campaign" },
  { Icon: ShieldCheck, key: "Access" },
];

export default function ECommercePortfolioPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const t = copy[lang];

  useEffect(() => {
    setSeo(t.title, t.seo, "https://www.rave-era.com.ua/portfolio/e-commerce-conference-2026");
  }, [t.title, t.seo]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-black/78 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-12">
          <Link href="/#cases" className="inline-flex min-h-10 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/45 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
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
            <Link href="/event/e-commerce-conference-2026" className="inline-flex min-h-10 items-center gap-2 border border-[#00FF88]/35 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#00FF88] transition-colors hover:border-white/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
              {t.eventPage}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative px-4 pb-16 pt-28 sm:px-6 md:px-12 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,255,136,0.12),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="mb-5 inline-flex border border-[#00FF88]/25 bg-[#00FF88]/[0.07] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">
              {t.badge}
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl md:text-7xl">
              {t.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-white/58">{t.intro}</motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/event/e-commerce-conference-2026" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#00FF88] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
                {t.eventPage}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/event/e-commerce-conference-2026/ticket-form?type=business" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-[#00FF88]/50 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                {t.ticketForm}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative overflow-hidden">
            <img src="/images/case-2.png" alt="E-Commerce Conference 2026 portfolio case" className="aspect-video w-full object-cover grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/72 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
              {t.metrics.slice(0, 2).map(([value, label]) => (
                <Metric key={label} value={value} label={label} />
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="border-y border-white/[0.05] px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.metrics.map(([value, label], index) => {
              const Icon = capabilityCards[index]?.Icon || BarChart3;
              return (
                <div key={label} className="border border-white/[0.08] bg-white/[0.02] p-5">
                  <Icon className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                  <p className="text-2xl font-black tracking-tight">{value}</p>
                  <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/35">{label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <CaseSection eyebrow="01 / ROLE" title={t.roleTitle} body={t.roleText} icon={<ShoppingBag className="h-5 w-5" />} />
        <CaseSection eyebrow="02 / CHALLENGE" title={t.challengeTitle} body={t.challengeText} icon={<LineChart className="h-5 w-5" />} flip />
        <CaseSection eyebrow="03 / SOLUTION" title={t.solutionTitle} body={t.solutionText} icon={<CheckCircle2 className="h-5 w-5" />} />

        <section className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <motion.p variants={fadeUp} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">04 / SERVICES</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.servicesTitle}</motion.h2>
            </div>
            <div className="space-y-3">
              {t.services.map((item, index) => (
                <motion.div key={item} variants={fadeUp} className="flex items-start gap-4 border border-white/[0.08] bg-white/[0.02] p-5">
                  <span className="text-xs font-mono font-bold text-[#00FF88]">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-sm leading-relaxed text-white/56">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="mx-auto max-w-7xl">
            <motion.p variants={fadeUp} className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">05 / IMPACT</motion.p>
            <motion.h2 variants={fadeUp} className="mb-10 text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.impactTitle}</motion.h2>
            <div className="grid gap-4 md:grid-cols-4">
              {t.impact.map(([heading, text]) => (
                <motion.div key={heading} variants={fadeUp} className="border border-white/[0.08] bg-white/[0.02] p-5">
                  <BarChart3 className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                  <h3 className="text-sm font-black uppercase tracking-tight">{heading}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-white/45">{text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">CTA</p>
              <h2 className="text-2xl font-black uppercase tracking-tight sm:text-4xl">{t.ctaTitle}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/42">{t.legal}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <Link href="/contacts" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.legalLinks[0]}</Link>
                <Link href="/public-offer" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.legalLinks[1]}</Link>
                <Link href="/privacy" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.legalLinks[2]}</Link>
                <Link href="/returns" className="text-[#00FF88] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.legalLinks[3]}</Link>
              </div>
            </div>
            <Link href="/event/e-commerce-conference-2026/ticket-form?type=business" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#00FF88] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
              <Ticket className="h-4 w-4" aria-hidden="true" />
              {t.ticketForm}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-white/[0.08] bg-black/75 p-4 backdrop-blur-sm">
      <p className="text-2xl font-black tracking-tight text-[#00FF88]">{value}</p>
      <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-white/45">{label}</p>
    </div>
  );
}

function CaseSection({ eyebrow, title, body, icon, flip = false }: { eyebrow: string; title: string; body: string; icon: ReactNode; flip?: boolean }) {
  return (
    <section className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className={`mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <motion.div variants={fadeUp} className="border border-white/[0.08] bg-white/[0.02] p-8">
          <div className="mb-8 inline-flex h-12 w-12 items-center justify-center border border-[#00FF88]/25 text-[#00FF88]">{icon}</div>
          <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">{eyebrow}</p>
          <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{title}</h2>
        </motion.div>
        <motion.p variants={fadeUp} className="text-base leading-relaxed text-white/55">{body}</motion.p>
      </motion.div>
    </section>
  );
}

function setSeo(pageTitle: string, pageDescription: string, canonicalUrl: string) {
  document.title = `${pageTitle} | Portfolio | RAVE'ERA GROUP`;
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
