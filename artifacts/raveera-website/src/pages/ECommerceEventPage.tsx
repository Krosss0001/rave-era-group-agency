import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
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
const socialImage = "https://www.rave-era.com.ua/images/ecommerce-conference-2026-poster.webp";
const mapUrl = "https://www.google.com/maps?q=Parkovyi%20ECC%20Kyiv%20Parkova%20Road%2016A&output=embed";
const mapExternal = "https://maps.app.goo.gl/bih3ZUsmSrxpcbjW6";

type Lang = "uk" | "en";
type TicketKey = "online" | "standard" | "vip" | "corporate";
type LocalizedText = Partial<Record<Lang | "ua", string>>;
type TopicChip = { id: string; label: string };

type Widen<T> =
  T extends string ? string :
  T extends number ? number :
  T extends boolean ? boolean :
  T extends readonly (infer Item)[] ? readonly Widen<Item>[] :
  T extends object ? { readonly [Key in keyof T]: Widen<T[Key]> } :
  T;

function getText(value: LocalizedText | string | null | undefined, lang: Lang): string {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.ua || value?.uk || value?.en || "";
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
} as const;

const fadeUpChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
} as const;

const tickets: Array<{ key: TicketKey; name: LocalizedText; price: string; popular?: boolean; premium?: boolean; corporate?: boolean }> = [
  { key: "online", name: { uk: "ONLINE", en: "ONLINE" }, price: "1 500" },
  { key: "standard", name: { uk: "STANDARD", en: "STANDARD" }, price: "1 800", popular: true },
  { key: "vip", name: { uk: "VIP + AFTERPARTY", en: "VIP + AFTERPARTY" }, price: "4 000", premium: true },
  { key: "corporate", name: { uk: "КОРПОРАТИВНІ КВИТКИ", en: "CORPORATE" }, price: "INVOICE", corporate: true },
];

const sectionLabels = {
  event: { uk: "01 / Подія", en: "01 / Event" },
  topics: { uk: "02 / Фокус події", en: "02 / Event Focus" },
  leaders: { uk: "03 / Лідери ринку", en: "03 / Market Leaders" },
  program: { uk: "04 / Програма", en: "04 / Program" },
  tickets: { uk: "05 / Квитки", en: "05 / Tickets" },
  location: { uk: "06 / Локація", en: "06 / Location" },
  faq: { uk: "07 / FAQ", en: "07 / FAQ" },
  phone: { uk: "Телефон:", en: "Phone:" },
  support: { uk: "Підтримка:", en: "Support:" },
} satisfies Record<string, Record<Lang, string>>;

const topicChips = {
  uk: [
    { id: "ai", label: "AI" },
    { id: "automation", label: "Автоматизація" },
    { id: "google-ads", label: "Google Ads" },
    { id: "google-shopping", label: "Google Shopping" },
    { id: "facebook-ads", label: "Facebook Ads" },
    { id: "meta", label: "Meta" },
    { id: "tiktok", label: "TikTok" },
    { id: "product-business", label: "Товарний бізнес" },
    { id: "arbitrage", label: "Арбітраж" },
    { id: "marketplaces", label: "Маркетплейси" },
    { id: "amazon", label: "Amazon" },
    { id: "dropshipping", label: "Дропшипінг" },
    { id: "prom", label: "Prom" },
    { id: "shopify", label: "Shopify" },
    { id: "online-stores", label: "Інтернет-магазини" },
    { id: "woocommerce", label: "WooCommerce" },
    { id: "cross-border-sales", label: "Продажі за кордон" },
    { id: "dollar-revenue", label: "Заробіток у доларах" },
    { id: "export", label: "Експорт" },
    { id: "ugc-content", label: "UGC-контент" },
    { id: "influencers", label: "Інфлюенсери" },
    { id: "creatives", label: "Креативи" },
    { id: "reels", label: "Reels" },
    { id: "sales-funnels", label: "Воронки продажів" },
    { id: "lead-generation", label: "Лідогенерація" },
    { id: "crm", label: "CRM" },
    { id: "legal", label: "Юристи" },
    { id: "accounting", label: "Бухгалтерія" },
    { id: "systematization", label: "Систематизація" },
    { id: "ltv", label: "LTV" },
    { id: "experts", label: "Експерти" },
    { id: "networking", label: "Нетворкінг" },
    { id: "scaling", label: "Масштабування" },
    { id: "retention", label: "Retention" },
    { id: "call-center", label: "Call-центр" },
    { id: "logistics", label: "Логістика" },
    { id: "china-sourcing", label: "Замовлення з Китаю" },
    { id: "warehouse", label: "Склад" },
    { id: "margin", label: "Маржинальність" },
  ],
  en: [
    { id: "ai", label: "AI" },
    { id: "automation", label: "Automation" },
    { id: "google-ads", label: "Google Ads" },
    { id: "google-shopping", label: "Google Shopping" },
    { id: "facebook-ads", label: "Facebook Ads" },
    { id: "meta", label: "Meta" },
    { id: "tiktok", label: "TikTok" },
    { id: "product-business", label: "Product Business" },
    { id: "arbitrage", label: "Arbitrage" },
    { id: "marketplaces", label: "Marketplaces" },
    { id: "amazon", label: "Amazon" },
    { id: "dropshipping", label: "Dropshipping" },
    { id: "prom", label: "Prom" },
    { id: "shopify", label: "Shopify" },
    { id: "online-stores", label: "Online Stores" },
    { id: "woocommerce", label: "WooCommerce" },
    { id: "cross-border-sales", label: "Cross-border Sales" },
    { id: "dollar-revenue", label: "Dollar Revenue" },
    { id: "export", label: "Export" },
    { id: "ugc-content", label: "UGC Content" },
    { id: "influencers", label: "Influencers" },
    { id: "creatives", label: "Creatives" },
    { id: "reels", label: "Reels" },
    { id: "sales-funnels", label: "Sales Funnels" },
    { id: "lead-generation", label: "Lead Generation" },
    { id: "crm", label: "CRM" },
    { id: "legal", label: "Legal" },
    { id: "accounting", label: "Accounting" },
    { id: "systematization", label: "Systematization" },
    { id: "ltv", label: "LTV" },
    { id: "experts", label: "Experts" },
    { id: "networking", label: "Networking" },
    { id: "scaling", label: "Scaling" },
    { id: "retention", label: "Retention" },
    { id: "call-center", label: "Call Center" },
    { id: "logistics", label: "Logistics" },
    { id: "china-sourcing", label: "China Sourcing" },
    { id: "warehouse", label: "Warehouse" },
    { id: "margin", label: "Margin" },
  ],
} satisfies Record<Lang, readonly TopicChip[]>;

const featuredTopicIds = new Set(["ai", "google-shopping", "product-business"]);
const topicCategoryIds = {
  growth: new Set(["ai", "automation", "google-ads", "google-shopping", "facebook-ads", "meta", "tiktok"]),
  commerce: new Set(["product-business", "arbitrage", "marketplaces", "amazon", "dropshipping", "prom", "shopify", "online-stores", "woocommerce"]),
  revenue: new Set(["cross-border-sales", "dollar-revenue", "export", "sales-funnels", "lead-generation", "ltv", "scaling", "margin"]),
  audience: new Set(["ugc-content", "influencers", "creatives", "reels", "crm", "retention", "experts", "networking"]),
} as const;

function getTopicCategory(topicId: string) {
  if (topicCategoryIds.growth.has(topicId)) return "growth";
  if (topicCategoryIds.commerce.has(topicId)) return "commerce";
  if (topicCategoryIds.revenue.has(topicId)) return "revenue";
  if (topicCategoryIds.audience.has(topicId)) return "audience";
  return "operations";
}

const topicCategoryClasses = {
  growth: "border-[#00FF88]/22 bg-[#00FF88]/[0.055]",
  commerce: "border-white/[0.14] bg-white/[0.045]",
  revenue: "border-[#00FF88]/16 bg-gradient-to-r from-[#00FF88]/[0.035] to-white/[0.035]",
  audience: "border-white/[0.12] bg-white/[0.03]",
  operations: "border-white/[0.1] bg-black/45",
} as const;

const contentData = {
  uk: {
    back: "Назад",
    buyTicket: "Купити квиток",
    viewProgram: "Програма",
    badge: "RAVE'ERA GROUP · EVENT LANDING",
    heroTitle: "E-COMMERCE CONFERENCE 2026",
    heroSub: "Головна подія року для eCommerce, маркетплейсів, логістики, фінтеху та digital commerce в Україні.",
    heroDesc:
      "Велика українська eCommerce конференція для онлайн-ритейлу, маркетплейсів, логістики, фінтеху, платежів, performance marketing, CRM/CDP, автоматизації, AI commerce tools, фаундерів і брендів.",
    heroVisualLine: "Digital commerce для команд, які масштабуються",
    meta: ["6 жовтня 2026", "КВЦ Парковий, Київ", "ECC-2026 tickets", "B2B & B2C sales"],
    stats: [
      ["2 000+", "учасників"],
      ["70+", "expo-компаній"],
      ["B2B & B2C", "продажі"],
      ["Практичні", "кейси та інсайти"],
    ],
    aboutTitle: "КОНФЕРЕНЦІЯ ДЛЯ КОМАНД, ЯКІ ПРОДАЮТЬ, МАСШТАБУЮТЬ І БУДУЮТЬ COMMERCE-БІЗНЕС.",
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
    topicsTitle: "Теми, що визначають наступний цикл eCommerce.",
    topicsText:
      "Практичний фокус на каналах, технологіях і бізнес-моделях, які вже змінюють залучення клієнтів, операції та масштабування.",
    topicsMarquee: ["Аудиторія проекту", "Теми події", "Що очікувати?", "Про що поговоримо"],
    partnerTitle: "Як стати партнером конференції?",
    partnerDescription:
      "Зв’яжіться з нашим менеджером та дізнайтесь умови участі для партнерів, експонентів, брендів, SaaS-платформ, логістичних і фінтех-компаній.",
    partnerButton: "Написати менеджеру",
    partnerExpoBadge: "70+ EXPO КОМПАНІЙ",
    partnerZoneBadge: "ПАРТНЕРСЬКА ЗОНА",
    partnerBenefits: [
      { id: "expo-zone", label: "Експо-зона" },
      { id: "branding", label: "Брендинг" },
      { id: "lead-generation", label: "Лідогенерація" },
      { id: "networking", label: "Нетворкінг" },
    ],
    leadersTitle: "Екосистема ринку, яка рухає український commerce вперед.",
    leadersText:
      "Ми не анонсуємо непідтверджених партнерів. Секція показує ролі та категорії бізнесу, для яких створюється конференція: від ритейлу і маркетплейсів до AI-інструментів та брендів.",
    leaderCards: [
      ["Online Retail", "Власники інтернет-магазинів, D2C-команди та операційні керівники товарного бізнесу."],
      ["Marketplaces", "Платформи, seller teams, категорійні менеджери, інтегратори та команди growth."],
      ["Logistics & Fulfillment", "Склади, last mile, повернення, SLA, сервіс і операційна надійність."],
      ["Fintech & Payments", "Банки, PSP, checkout, Apple Pay, Google Pay, antifraud та BNPL-рішення."],
      ["Performance Marketing", "Paid media, креативи, SEO, affiliate, attribution і команди зростання."],
      ["CRM / CDP", "Retention, сегментація, lifecycle-комунікації, дані клієнтів і повторні покупки."],
      ["AI Commerce Tools", "Автоматизація контенту, підтримки, аналітики, продажів і операційних процесів."],
      ["Brands & Founders", "Фаундери, product-команди, бренди, інвестори, медіа та B2B-партнери."],
    ],
    programTitle: "День для рішень, контактів і нової оптики ринку.",
    program: [
      "eCommerce growth: unit economics, retention, LTV, repeat purchases",
      "Marketplaces: seller growth, commissions, content and pricing",
      "Payments & fintech: checkout conversion, Apple Pay, Google Pay, antifraud",
      "Logistics & fulfillment: warehouse, last mile, returns, SLA and client service",
      "Performance marketing: paid media, creatives, attribution, SEO and affiliate",
      "CRM/CDP automation and AI commerce tools",
    ],
    ticketsTitle: "Формати участі для команд і гостей eCommerce ринку",
    ticketDescriptions: {
      online: "Для дистанційної участі, перегляду контенту та доступу до матеріалів після події.",
      standard: "Базовий офлайн-формат для відвідування конференції, expo-зони та нетворкінгу.",
      vip: "Преміальний формат для гостей, яким потрібен швидкий вхід, перші ряди, VIP Lounge та afterparty.",
      corporate: "Для компаній, які оплачують участь команди від юридичної особи за рахунком і договором.",
    },
    ticketFeatures: {
      online: ["доступ до онлайн трансляції", "фото та відео звіт після події", "закритий нетворкінг-чат у Telegram", "доступ до відеозаписів спікерів"],
      standard: ["доступ до нетворкінг зони", "фото та відео звіт після події", "закритий нетворкінг-чат у Telegram", "відвідування конференції та доступ до експозони"],
      vip: ["окрема VIP-стійка реєстрації для швидкого проходу", "зарезервовані місця в перших рядах біля сцени", "відвідування конференції та доступ до експозони", "доступ до VIP Lounge", "AFTERPARTY з преміум кейтерингом та баром", "особисте паркомісце"],
      corporate: ["для компаній, які оплачують участь своїх співробітників", "оплата від юридичної особи", "договір, рахунок, акти та супровідні документи", "спеціальні корпоративні знижки при груповому замовленні", "доступ до нетворкінг-зони та експозони", "закритий Telegram-чат учасників", "фото та відеозвіт після конференції"],
    },
    popular: "Популярний",
    premium: "Преміум",
    contactOrganizer: "Запитати корпоративний рахунок",
    paymentNote:
      "Оплата проходить через захищену платіжну сторінку AlliancePay. Дані платіжної картки не вводяться, не обробляються та не зберігаються на цьому сайті.",
    secureBadges: "SSL Secure · AlliancePay HPP · Visa · Mastercard · Apple Pay · Google Pay",
    locationTitle: "КВЦ ПАРКОВИЙ, КИЇВ",
    locationText:
      "E-Commerce Conference 2026 відбудеться у КВЦ «Парковий» за адресою: м. Київ, Паркова дорога, 16А.",
    venue: "м. Київ, Паркова дорога, 16А",
    duration: "6 жовтня 2026",
    mapOpen: "Відкрити на Google Maps",
    faqTitle: "Питання перед реєстрацією",
    faqs: [
      ["Як проходить оплата?", "Після заповнення форми сайт створює заявку на квиток і відкриває захищену сторінку оплати AlliancePay."],
      ["Коли буде доступний квиток?", "Квиток видається тільки після серверного підтвердження статусу SUCCESS від AlliancePay."],
      ["Який QR-префікс у квитків?", "Квитки цієї події генеруються з префіксом ECC-2026 та працюють у загальній системі admin check-in."],
      ["Чи буде запис виступів?", "Так, доступ до відеозаписів спікерів входить до ONLINE та VIP + AFTERPARTY. Для STANDARD доступ залежить від фінального пакета матеріалів."],
      ["Чи можна передати квиток?", "Передача квитка можлива тільки через звернення до організатора до моменту використання QR-коду на вході."],
      ["Де юридичні умови?", "Публічна оферта, політика конфіденційності та політика повернення доступні у футері та на формі квитка."],
    ],
    ctaLines: ["БУДЬТЕ В ЗАЛІ,", "ДЕ ФОРМУЮТЬСЯ", "НАСТУПНІ ЛІДЕРИ", "УКРАЇНСЬКОГО ECOMMERCE."],
    footerBrand: "Найбільша конференція для eCommerce, маркетплейсів, логістики та digital commerce в Україні.",
    footerOrgLabel: "Організатор",
    footerOrgName: "ФОП Чекан Богдан Орестович",
    footerOrgFull: "RAVE'ERA GROUP",
    footerIpn: "ІПН / РНОКПП: 3411613291",
    footerKveds: [
      "КВЕД 90.01 Театральна та концертна діяльність",
      "КВЕД 90.03 Індивідуальна мистецька діяльність",
      "КВЕД 90.02 Діяльність із підтримки театральних і концертних заходів",
      "КВЕД 79.90 Надання інших послуг бронювання та пов'язана з цим діяльність",
    ],
    footerAddress: "Україна, 03022, м. Київ, вул. Здановської Юлії, буд. 49, корп. 10, кв. 306",
    footerBank: "Банк: АТ БАНК АЛЬЯНС",
    footerRecipient: "Отримувач: ФОП Чекан Б.О.",
    footerIban: "IBAN: UA303001190000026006744298001",
    footerCurrency: "Валюта: UAH",
    footerPurpose: "Призначення платежу: Оплата за товар/послугу",
    footerContactsLabel: "Контакти",
    footerEmail: "ceo@rave-era.com.ua",
    footerPhone: "+38 (093) 430-75-51",
    footerTelegram: "bogdan_chekan",
    footerSupport: "Пн-Пт 10:00-19:00",
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
    heroTitle: "E-COMMERCE CONFERENCE 2026",
    heroSub: "The flagship Ukrainian conference for eCommerce, marketplaces, logistics, fintech and digital commerce.",
    heroDesc:
      "A large Ukrainian eCommerce conference for online retail, marketplaces, logistics, fintech, payments, performance marketing, CRM/CDP, automation, AI commerce tools, founders and brands.",
    heroVisualLine: "Digital commerce for teams that scale",
    meta: ["October 6, 2026", "Parkovyi ECC, Kyiv", "ECC-2026 tickets", "B2B & B2C sales"],
    stats: [
      ["2,000+", "attendees"],
      ["70+", "expo companies"],
      ["B2B & B2C", "sales"],
      ["Practical", "cases and insights"],
    ],
    aboutTitle: "A CONFERENCE FOR TEAMS THAT SELL, SCALE AND BUILD COMMERCE BUSINESSES.",
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
    topicsTitle: "Topics shaping the next cycle of eCommerce.",
    topicsText:
      "A practical focus on the channels, technologies and business models already changing customer acquisition, operations and scale.",
    topicsMarquee: ["Project audience", "Event topics", "What to expect", "What well discuss"],
    partnerTitle: "How to become a conference partner?",
    partnerDescription:
      "Contact our manager to learn the participation terms for partners, exhibitors, brands, SaaS platforms, logistics providers and fintech companies.",
    partnerButton: "Contact manager",
    partnerExpoBadge: "70+ EXPO COMPANIES",
    partnerZoneBadge: "PARTNER ZONE",
    partnerBenefits: [
      { id: "expo-zone", label: "Expo zone" },
      { id: "branding", label: "Branding" },
      { id: "lead-generation", label: "Lead generation" },
      { id: "networking", label: "Networking" },
    ],
    leadersTitle: "The business ecosystem moving Ukrainian commerce forward.",
    leadersText:
      "This section does not imply unconfirmed partnerships. It frames the roles and business categories the conference is built for: from retail and marketplaces to AI tools and brands.",
    leaderCards: [
      ["Online Retail", "Online store owners, D2C teams and operations leaders in product businesses."],
      ["Marketplaces", "Platforms, seller teams, category managers, integrators and growth teams."],
      ["Logistics & Fulfillment", "Warehouses, last mile, returns, SLA, service and operational reliability."],
      ["Fintech & Payments", "Banks, PSPs, checkout, Apple Pay, Google Pay, antifraud and BNPL products."],
      ["Performance Marketing", "Paid media, creatives, SEO, affiliate, attribution and growth teams."],
      ["CRM / CDP", "Retention, segmentation, lifecycle communications, customer data and repeat purchases."],
      ["AI Commerce Tools", "Automation for content, support, analytics, sales and operations."],
      ["Brands & Founders", "Founders, product teams, brands, investors, media and B2B partners."],
    ],
    programTitle: "A day for decisions, contacts and a sharper view of the market.",
    program: [
      "eCommerce growth: unit economics, retention, LTV and repeat purchases",
      "Marketplaces: seller growth, categories, commissions, content and pricing",
      "Payments & fintech: checkout conversion, Apple Pay, Google Pay and antifraud",
      "Logistics & fulfillment: warehouse, last mile, returns, SLA and customer service",
      "Performance marketing: paid media, creatives, attribution, SEO and affiliate",
      "CRM/CDP, automation and AI tools for commerce teams",
    ],
    ticketsTitle: "Participation formats for commerce teams and guests",
    ticketDescriptions: {
      online: "Remote participation for watching the content and receiving post-event materials.",
      standard: "Core offline access for the conference, expo zone and networking.",
      vip: "Premium access for guests who need fast entry, front-row seats, VIP Lounge and afterparty.",
      corporate: "For companies paying for team participation as a legal entity by invoice and contract.",
    },
    ticketFeatures: {
      online: ["access to the online stream", "photo and video report after the event", "private Telegram networking chat", "access to speaker recordings"],
      standard: ["access to the networking zone", "photo and video report after the event", "private Telegram networking chat", "conference attendance and expo zone access"],
      vip: ["separate VIP registration desk for fast entry", "reserved front-row seats near the stage", "conference attendance and expo zone access", "access to VIP Lounge", "AFTERPARTY with premium catering and bar", "personal parking space"],
      corporate: ["for companies paying for employee participation", "legal entity payment", "contract, invoice, acts and supporting documents", "special corporate discounts for group orders", "networking zone and expo zone access", "private Telegram participant chat", "photo and video report after the conference"],
    },
    popular: "Popular",
    premium: "Premium",
    contactOrganizer: "Request corporate invoice",
    paymentNote:
      "Payment is processed through the secure AlliancePay hosted payment page. Card data is not entered, processed or stored on this site.",
    secureBadges: "SSL Secure · AlliancePay HPP · Visa · Mastercard · Apple Pay · Google Pay",
    locationTitle: "PARKOVYI ECC, KYIV",
    locationText:
      "E-Commerce Conference 2026 takes place at Parkovyi ECC, 16A Parkova Road, Kyiv.",
    venue: "16A Parkova Road, Kyiv",
    duration: "October 6, 2026",
    mapOpen: "Open in Google Maps",
    faqTitle: "Questions before registration",
    faqs: [
      ["How does payment work?", "After the form is submitted, the site creates a ticket request and opens the secure AlliancePay payment page."],
      ["When is the ticket available?", "The ticket is issued only after server-side SUCCESS confirmation from AlliancePay."],
      ["What QR prefix is used?", "Tickets for this event are generated with the ECC-2026 prefix and work in the shared admin check-in system."],
      ["Will session recordings be available?", "Yes, access to speaker recordings is included in ONLINE and VIP + AFTERPARTY. STANDARD access depends on the final materials package."],
      ["Can I transfer my ticket?", "A ticket can be transferred only through the organizer before the QR code is used at entry."],
      ["Where are the legal terms?", "The Public Offer, Privacy Policy and Refund Policy are available in the footer and on the ticket form."],
    ],
    ctaLines: ["BE IN THE ROOM", "WHERE THE NEXT LEADERS", "OF UKRAINIAN ECOMMERCE", "ARE FORMED."],
    footerBrand: "A flagship conference for eCommerce, marketplaces, logistics and digital commerce in Ukraine.",
    footerOrgLabel: "Organizer",
    footerOrgName: "FOP Chekan Bohdan Orestovych",
    footerOrgFull: "RAVE'ERA GROUP",
    footerIpn: "IPN / Tax ID: 3411613291",
    footerKveds: [
      "KVED 90.01 Performing arts",
      "KVED 90.03 Artistic creation",
      "KVED 90.02 Support activities to performing arts",
      "KVED 79.90 Other reservation service and related activities",
    ],
    footerAddress: "Ukraine, 03022, Kyiv, Zdanovska Yuliia St., 49, bld. 10, apt. 306",
    footerBank: "Bank: JSC Alliance Bank",
    footerRecipient: "Recipient: FOP Chekan B.O.",
    footerIban: "IBAN: UA303001190000026006744298001",
    footerCurrency: "Currency: UAH",
    footerPurpose: "Payment purpose: Payment for goods/services",
    footerContactsLabel: "Contacts",
    footerEmail: "ceo@rave-era.com.ua",
    footerPhone: "+38 (093) 430-75-51",
    footerTelegram: "bogdan_chekan",
    footerSupport: "Mon-Fri 10:00-19:00",
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

type EventContent = Widen<(typeof contentData)["uk"]>;
const content: Record<Lang, EventContent> = contentData;

export default function ECommerceEventPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setSeo("E-Commerce Conference 2026", content[lang].seoDescription, canonical, socialImage);
    setEventJsonLd(content[lang].seoDescription);
    return () => document.querySelector("#ecc-event-jsonld")?.remove();
  }, [lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = content[lang];

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen overflow-x-hidden bg-[#0A0A0F] font-sans text-white selection:bg-[#00FF88] selection:text-black">
      <nav className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-200 ${scrolled ? "border-b border-white/[0.06] bg-[#0A0A0F]/95 backdrop-blur-sm" : "bg-transparent"}`}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 md:px-12">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/50 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.back}
          </Link>
          <div className="hidden text-[10px] font-mono uppercase tracking-[0.28em] text-white/25 md:block">
            RAVE'ERA GROUP
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/event/${slug}/ticket-form?type=standard`} className="hidden min-h-10 items-center bg-[#00FF88] px-4 text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88] sm:inline-flex">
              {t.buyTicket}
            </Link>
            <button
              type="button"
              onClick={() => setLang(lang === "uk" ? "en" : "uk")}
              className="inline-flex min-h-10 items-center gap-1 border border-white/10 px-3 text-[10px] font-mono uppercase tracking-widest text-white/45 transition-colors hover:border-[#00FF88]/40 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]"
              aria-label="Switch language"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              {lang === "uk" ? "EN" : "UA"}
            </button>
          </div>
        </div>
      </nav>

      <header className="relative flex min-h-[85vh] items-center overflow-hidden px-4 pb-12 pt-16 sm:min-h-screen sm:px-6 sm:pb-16 sm:pt-20 md:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-12%] top-[12%] h-[360px] w-[360px] rounded-full bg-[#00FF88]/[0.055] blur-[140px]" />
          <div className="absolute bottom-[10%] right-[-12%] h-[420px] w-[420px] rounded-full bg-[#00FF88]/[0.045] blur-[170px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.05),transparent_34%),linear-gradient(180deg,rgba(10,10,15,0.12),#0A0A0F_95%)]" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <motion.div variants={fadeUpChild} className="mb-6 inline-flex items-center gap-2 border border-[#00FF88]/20 bg-[#00FF88]/[0.05] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-[#00FF88]">
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                {t.badge}
              </motion.div>
              <motion.div variants={fadeUpChild} className="mb-6 flex flex-wrap gap-2">
                {t.meta.map((item, index) => {
                  const Icon = index === 0 ? Calendar : index === 1 ? MapPin : index === 2 ? Ticket : Clock;
                  return (
                    <span key={`meta-${index}`} className="inline-flex min-h-10 items-center gap-2 border border-white/[0.1] bg-white/[0.025] px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-white/45 backdrop-blur-sm">
                      <Icon className="h-3.5 w-3.5 text-[#00FF88]" aria-hidden="true" />
                      {item}
                    </span>
                  );
                })}
              </motion.div>
              <motion.h1 variants={fadeUpChild} className="max-w-4xl break-words text-4xl font-black uppercase leading-[0.85] tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                {t.heroTitle}
              </motion.h1>
              <motion.p variants={fadeUpChild} className="mt-6 max-w-xl text-base font-semibold leading-relaxed text-white/68 sm:text-lg md:text-xl">
                {t.heroSub}
              </motion.p>
              <motion.p variants={fadeUpChild} className="mt-4 max-w-lg text-sm leading-relaxed text-white/42">
                {t.heroDesc}
              </motion.p>
              <motion.div variants={fadeUpChild} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={`/event/${slug}/ticket-form?type=standard`} className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden bg-[#00FF88] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
                  <span className="relative z-10">{t.buyTicket}</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  <motion.span className="absolute inset-0 bg-white" initial={{ x: "-100%" }} whileHover={{ x: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} />
                </Link>
                <a href="#program" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-[#00FF88]/50 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                  {t.viewProgram}
                </a>
              </motion.div>
              <motion.div variants={fadeUpChild} className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
                {t.stats.map(([value, label], index) => (
                  <div key={`stat-${index}`} className="border border-white/[0.08] bg-white/[0.025] p-4 backdrop-blur-sm sm:p-5">
                    <p className="break-words text-2xl font-black tracking-tight text-white sm:text-3xl">{value}</p>
                    <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/32">{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
            <motion.div variants={fadeUpChild} className="order-first w-full lg:order-last">
              <div className="overflow-hidden rounded-sm border border-white/[0.08] bg-white/[0.02] shadow-[0_0_60px_rgba(0,255,136,0.12)]">
                <picture>
                  <source srcSet="/images/ecommerce-conference-2026-poster.webp" type="image/webp" />
                  <img
                    data-qa="ecc-hero-image"
                    src="/images/ecommerce-conference-2026-poster.png"
                    alt="E-Commerce Conference 2026 event poster"
                    width="1672"
                    height="941"
                    className="aspect-video w-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      <main>
        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="grid gap-10 lg:grid-cols-2 lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionBadge icon={<Zap className="h-3.5 w-3.5" />} label={getText(sectionLabels.event, lang)} />
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl">{t.aboutTitle}</motion.h2>
            </div>
            <div className="space-y-8">
              <div className="space-y-5 border-l border-white/[0.08] pl-5 sm:pl-7">
                {t.aboutCopy.map((paragraph, index) => (
                  <motion.p key={`about-copy-${index}`} variants={fadeUpChild} className="text-sm leading-relaxed text-white/56 sm:text-base">{paragraph}</motion.p>
                ))}
              </div>
              <div className="mt-8 space-y-3">
                {t.aboutPoints.map((point, index) => (
                  <motion.div key={`about-point-${index}`} variants={fadeUpChild} className="flex items-start gap-3 text-sm leading-relaxed text-white/52">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#00FF88]" />
                    <span>{point}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div variants={fadeUpChild} className="grid gap-4 sm:grid-cols-2">
                <div className="border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
                  <CreditCard className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                  <p className="text-xs font-mono uppercase tracking-widest text-white/30">RAVEERA Tickets Service</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/48">{t.paymentNote}</p>
                </div>
                <div className="border border-[#00FF88]/18 bg-[#00FF88]/[0.035] p-5 sm:p-6">
                  <PackageCheck className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                  <p className="text-xs font-mono uppercase tracking-widest text-white/30">Production infrastructure</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/48">{t.locationText}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Section>

        <section className="relative overflow-hidden border-t border-white/[0.04] py-16 sm:py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-[#00FF88]/[0.055] blur-[110px] sm:h-96 sm:w-96 sm:blur-[150px]" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-[#00FF88]/10 to-transparent" />
          </div>

          <div
            data-qa="ecc-topics-marquee"
            data-reduced-motion={prefersReducedMotion ? "true" : "false"}
            className="relative mb-12 overflow-hidden border-y border-white/[0.07] bg-white/[0.018] py-4 shadow-[0_0_50px_rgba(0,255,136,0.025)] sm:mb-16 sm:py-5"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#050706] to-transparent sm:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#050706] to-transparent sm:w-24" />

            {prefersReducedMotion ? (
              <div data-qa="ecc-topics-marquee-static" className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-3 px-4 sm:grid-cols-4 sm:px-6 md:px-12">
                {t.topicsMarquee.map((label, index) => (
                  <div key={`${lang}-static-${index}`} className="flex min-w-0 items-center justify-center gap-2 text-center">
                    <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#00FF88] shadow-[0_0_10px_rgba(0,255,136,0.7)]" aria-hidden="true" />
                    <span className="text-[11px] font-mono font-bold uppercase leading-relaxed tracking-[0.14em] text-white/72 sm:text-xs">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {[false, true].map((reverse, rowIndex) => (
                  <div key={`topics-marquee-${rowIndex}`} className="overflow-hidden whitespace-nowrap">
                    <motion.div
                      data-qa="ecc-topics-marquee-track"
                      data-row={rowIndex}
                      className="flex w-max transform-gpu will-change-transform [backface-visibility:hidden] [contain:layout_paint]"
                      animate={{ x: reverse ? ["-25%", "0%"] : ["0%", "-25%"] }}
                      transition={{ duration: rowIndex === 0 ? 32 : 36, ease: "linear", repeat: Infinity }}
                    >
                      {Array.from({ length: 4 }, (_, segmentIndex) => (
                        <div
                          key={`${rowIndex}-segment-${segmentIndex}`}
                          data-qa="ecc-topics-marquee-segment"
                          className="flex shrink-0 items-center"
                          aria-hidden={segmentIndex > 0}
                        >
                          {t.topicsMarquee.map((label, labelIndex) => (
                            <div key={`${lang}-${segmentIndex}-${labelIndex}`} className="flex shrink-0 items-center">
                              <span
                                className={`px-5 text-xs font-mono font-bold uppercase tracking-[0.2em] sm:px-8 sm:text-sm ${
                                  rowIndex === 0 ? "text-white/68" : "text-[#00FF88]/78"
                                }`}
                              >
                                {label}
                              </span>
                              <span className="h-1.5 w-1.5 rotate-45 bg-[#00FF88] shadow-[0_0_10px_rgba(0,255,136,0.7)]" aria-hidden="true" />
                            </div>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12"
          >
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
              <div>
                <SectionBadge icon={<ShoppingBag className="h-3.5 w-3.5" />} label={getText(sectionLabels.topics, lang)} />
                <motion.h2 variants={fadeUpChild} className="max-w-2xl text-3xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl">
                  {t.topicsTitle}
                </motion.h2>
                <motion.p variants={fadeUpChild} className="mt-5 max-w-xl text-sm leading-relaxed text-white/52 sm:text-base">
                  {t.topicsText}
                </motion.p>
              </div>

              <motion.div variants={fadeUpChild} className="flex content-start flex-wrap gap-2 sm:gap-2.5 lg:pt-1">
                {topicChips[lang].map((topic) => {
                  const category = getTopicCategory(topic.id);
                  const featured = featuredTopicIds.has(topic.id);

                  return (
                    <span
                      key={topic.id}
                      data-qa="ecc-topic-chip"
                      data-topic-id={topic.id}
                      data-topic-category={category}
                      className={`group relative inline-flex min-h-11 max-w-full items-center gap-2 overflow-hidden rounded-full border px-3.5 py-2.5 font-mono text-xs font-bold uppercase leading-tight tracking-[0.07em] text-white/78 transition-colors duration-100 ease-out sm:min-h-12 sm:px-4 sm:text-sm ${
                        featured
                          ? "border-[#00FF88]/50 bg-[#00FF88]/[0.105] text-[#B8FFD8] shadow-[0_0_16px_rgba(0,255,136,0.045)]"
                          : `${topicCategoryClasses[category]} hover:border-[#00FF88]/34 hover:bg-[#00FF88]/[0.07] hover:text-white`
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          featured ? "bg-[#00FF88] shadow-[0_0_9px_rgba(0,255,136,0.9)]" : "bg-[#00FF88]/55"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 break-words">{topic.label}</span>
                    </span>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </section>

        <Section>
          <motion.div
            data-qa="ecc-partner-cta"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch"
          >
            <motion.div
              variants={fadeUpChild}
              className="relative min-h-[220px] overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.02] shadow-[0_0_50px_rgba(0,255,136,0.045)] sm:min-h-[340px] lg:min-h-[420px]"
            >
              <picture>
                <source srcSet="/images/ecommerce-partnership-expo-2026.webp" type="image/webp" />
                <img
                  data-qa="ecc-partner-image"
                  src="/images/ecommerce-partnership-expo-2026.png"
                  alt="E-Commerce Conference 2026 partner and expo presentation"
                  width="1536"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full rounded-2xl object-cover object-center"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/5" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/[0.08] via-transparent to-transparent" />
              <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap gap-2 sm:left-6 sm:top-6">
                <span
                  data-qa="ecc-partner-expo-badge"
                  className="rounded-full border border-[#00FF88]/55 bg-black/65 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#B8FFD8] shadow-[0_0_18px_rgba(0,255,136,0.12)] backdrop-blur-md sm:text-[10px]"
                >
                  {t.partnerExpoBadge}
                </span>
                <span
                  data-qa="ecc-partner-zone-badge"
                  className="rounded-full border border-[#00FF88]/35 bg-black/65 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/78 shadow-[0_0_18px_rgba(0,255,136,0.08)] backdrop-blur-md sm:text-[10px]"
                >
                  {t.partnerZoneBadge}
                </span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#00FF88] sm:text-xs">RAVE'ERA PARTNERSHIP</p>
                  <p className="mt-2 max-w-md text-lg font-black uppercase leading-tight text-white sm:text-2xl">E-COMMERCE CONFERENCE 2026</p>
                </div>
                <span className="hidden h-10 w-10 shrink-0 rotate-45 border border-[#00FF88]/45 bg-[#00FF88]/10 shadow-[0_0_24px_rgba(0,255,136,0.18)] sm:block" aria-hidden="true" />
              </div>
            </motion.div>

            <motion.div
              variants={fadeUpChild}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-[#00FF88]/15 bg-[#101412]/95 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_40px_rgba(0,255,136,0.03)] sm:p-8 lg:p-10"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#00FF88]/[0.07] blur-[90px]" />
              <div className="relative">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#00FF88] sm:text-xs">PARTNER / EXHIBITOR</p>
                <h2 className="mt-5 text-3xl font-black uppercase leading-[0.92] tracking-tighter text-white sm:text-4xl lg:text-5xl">
                  {t.partnerTitle}
                </h2>
                <p className="mt-6 text-sm leading-relaxed text-white/60 sm:text-base">{t.partnerDescription}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {t.partnerBenefits.map((benefit) => (
                    <span
                      key={benefit.id}
                      data-qa="ecc-partner-benefit"
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/[0.11] bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 sm:text-xs"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.8)]" aria-hidden="true" />
                      {benefit.label}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href="https://t.me/bogdan_chekan"
                target="_blank"
                rel="noreferrer"
                data-qa="ecc-partner-link"
                className="group relative mt-9 inline-flex min-h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-[#00FF88] px-5 py-3.5 text-center text-xs font-black uppercase tracking-[0.14em] text-black shadow-[0_0_28px_rgba(0,255,136,0.16)] transition-[background-color,box-shadow] duration-150 ease-out hover:bg-white hover:shadow-[0_0_36px_rgba(0,255,136,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF88] lg:mt-auto"
              >
                <span>{t.partnerButton}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}>
            <SectionBadge icon={<Mic2 className="h-3.5 w-3.5" />} label={getText(sectionLabels.leaders, lang)} />
            <motion.div variants={fadeUpChild} className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.leadersTitle}</h2>
              <p className="text-sm leading-relaxed text-white/50 sm:text-base">{t.leadersText}</p>
            </motion.div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {t.leaderCards.map(([heading, copy], index) => (
                <motion.div key={`leader-${index}`} data-qa="ecc-leader-card" variants={fadeUpChild} className="group flex min-h-[190px] flex-col border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-[#00FF88]/35 hover:bg-[#00FF88]/[0.025]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <Users className="h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                    <span className="text-[10px] font-mono text-white/20">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="text-sm font-black uppercase tracking-tight text-white/82">{heading}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/42">{copy}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        <Section id="program">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer} className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <SectionBadge icon={<Calendar className="h-3.5 w-3.5" />} label={getText(sectionLabels.program, lang)} />
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.programTitle}</motion.h2>
            </div>
            <div className="space-y-4">
              {t.program.map((item, index) => (
                <motion.div key={`program-${index}`} data-qa="ecc-program-item" variants={fadeUpChild} className="flex items-start gap-5 border-b border-white/[0.06] pb-4 sm:pb-5">
                  <span className="mt-0.5 shrink-0 text-base font-mono font-black text-[#00FF88] sm:text-lg">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-sm leading-relaxed text-white/58 sm:text-base">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        <Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}>
            <SectionBadge icon={<Ticket className="h-3.5 w-3.5" />} label={getText(sectionLabels.tickets, lang)} />
            <motion.h2 variants={fadeUpChild} className="mb-10 text-3xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl">{t.ticketsTitle}</motion.h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
              {tickets.map((tier) => (
                <motion.div key={tier.key} data-qa="ecc-ticket-card" variants={fadeUpChild} className={`relative flex flex-col border p-5 sm:p-6 xl:min-h-[520px] ${tier.premium ? "border-white/30 bg-white/[0.045] shadow-[0_0_60px_rgba(255,255,255,0.06)]" : tier.popular ? "border-[#00FF88]/35 bg-[#00FF88]/[0.04]" : "border-white/[0.08] bg-white/[0.02]"}`}>
                  {tier.popular ? <span className="absolute -top-3 left-5 bg-[#00FF88] px-3 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-black sm:left-6">{t.popular}</span> : null}
                  {tier.premium ? <span className="absolute -top-3 left-5 bg-white px-3 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-black sm:left-6">{t.premium}</span> : null}
                  <p className="min-h-8 text-xs font-mono uppercase tracking-widest text-white/40">{getText(tier.name, lang)}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <p className="break-words text-4xl font-black tracking-tighter sm:text-5xl" style={{ color: tier.popular ? G : "white" }}>{tier.price}</p>
                    {!tier.corporate && <span className="text-sm font-mono text-white/40">UAH</span>}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-white/55">{t.ticketDescriptions[tier.key]}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {t.ticketFeatures[tier.key].map((feature, index) => (
                      <li key={`${tier.key}-feature-${index}`} data-qa="ecc-ticket-feature" className="flex items-start gap-2 text-sm text-white/60">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FF88]" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {tier.corporate ? (
                    <a href={`/event/${slug}/ticket-form?type=corporate`} className="mt-7 inline-flex min-h-11 items-center justify-center border border-[#00FF88]/35 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#00FF88] transition-colors hover:border-white/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                      {t.contactOrganizer}
                    </a>
                  ) : (
                    <Link href={`/event/${slug}/ticket-form?type=${tier.key}`} className={`mt-7 inline-flex min-h-11 items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88] ${tier.popular ? "bg-[#00FF88] text-black hover:bg-white" : tier.premium ? "bg-white text-black hover:bg-[#00FF88]" : "border border-white/15 text-white/70 hover:border-[#00FF88]/45 hover:text-[#00FF88]"}`}>
                      {t.buyTicket}
                    </Link>
                  )}
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
              <SectionBadge icon={<MapPin className="h-3.5 w-3.5" />} label={getText(sectionLabels.location, lang)} />
              <motion.h2 variants={fadeUpChild} className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.locationTitle}</motion.h2>
              <motion.p variants={fadeUpChild} className="mt-5 text-sm leading-relaxed text-white/50 sm:text-base">{t.locationText}</motion.p>
              <motion.div variants={fadeUpChild} className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex min-h-10 items-center gap-2 border border-[#00FF88]/18 bg-[#00FF88]/[0.035] px-3 text-xs font-mono text-white/52">
                  <MapPin className="h-3.5 w-3.5 text-[#00FF88]" aria-hidden="true" />
                  {t.venue}
                </span>
                <span className="inline-flex min-h-10 items-center gap-2 border border-white/[0.08] bg-white/[0.035] px-3 text-xs font-mono text-white/52">
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
            <SectionBadge icon={<PackageCheck className="h-3.5 w-3.5" />} label={getText(sectionLabels.faq, lang)} />
            <motion.h2 variants={fadeUpChild} className="mb-8 text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">{t.faqTitle}</motion.h2>
            <div className="space-y-3">
              {t.faqs.map(([question, answer], index) => (
                <motion.div key={`faq-${index}`} variants={fadeUpChild} className="border border-white/[0.08] bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                    aria-controls={`ecc-faq-answer-${index}`}
                    className="flex min-h-12 w-full items-center justify-between gap-4 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]"
                  >
                    <span className="text-sm font-bold text-white/72">{question}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#00FF88] transition-transform ${openFaq === index ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                  <AnimatePresence>
                    {openFaq === index ? (
                      <motion.div id={`ecc-faq-answer-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm leading-relaxed text-white/45">{answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        <section className="relative overflow-hidden border-t border-white/[0.04] px-4 py-20 text-center sm:px-6 sm:py-24 md:px-12 md:py-36">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00FF88]/5 blur-[150px] sm:h-[600px] sm:w-[600px] sm:blur-[200px]" />
          </div>
          <div className="relative mx-auto max-w-4xl">
            <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl md:text-6xl">
              {t.ctaLines.map((line, index) => (
                <span key={`cta-line-${index}`} className="block break-words">{line}</span>
              ))}
            </h2>
            <Link href={`/event/${slug}/ticket-form?type=vip`} className="group relative mt-8 inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden bg-[#00FF88] px-8 py-4 text-xs font-bold uppercase tracking-widest text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88] sm:px-10 sm:py-5">
              <span className="relative z-10">{t.buyTicket}</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              <motion.span className="absolute inset-0 bg-white" initial={{ x: "-100%" }} whileHover={{ x: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-4 py-10 sm:px-6 sm:py-14 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-8 sm:mb-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
            <div>
              <p className="text-base font-black uppercase tracking-tighter sm:text-lg">RAVE'ERA <span className="text-[#00FF88]">GROUP</span></p>
              <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-white/30">E-COMMERCE CONFERENCE 2026</p>
              <p className="mt-3 text-xs leading-relaxed text-white/30">{t.footerBrand}</p>
            </div>

            <div>
              <FooterLabel>{t.footerOrgLabel}</FooterLabel>
              <div className="space-y-2 text-xs leading-relaxed text-white/35">
                <p className="font-bold text-white/50">{t.footerOrgName}</p>
                <p>{t.footerOrgFull}</p>
                <p className="font-mono text-white/30">{t.footerIpn}</p>
                {t.footerKveds.map((item, index) => (
                  <p key={`footer-kved-${index}`} className="font-mono text-white/30">{item}</p>
                ))}
                <p className="font-mono leading-relaxed text-white/30">{t.footerAddress}</p>
                <p className="font-mono text-white/25">{t.footerBank}</p>
                <p className="font-mono text-white/25">{t.footerRecipient}</p>
                <p className="break-words font-mono text-white/25">{t.footerIban}</p>
                <p className="font-mono text-white/25">{t.footerCurrency}</p>
                <p className="font-mono text-white/25">{t.footerPurpose}</p>
              </div>
            </div>

            <div>
              <FooterLabel>{t.footerContactsLabel}</FooterLabel>
              <div className="space-y-2 text-xs leading-relaxed text-white/35">
                <p><span className="font-mono text-white/25">Email:</span> <a href={`mailto:${t.footerEmail}`} className="inline-flex min-h-10 items-center transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.footerEmail}</a></p>
                <p><span className="font-mono text-white/25">{getText(sectionLabels.phone, lang)}</span> <a href={`tel:+${t.footerPhone.replace(/\D/g, "")}`} className="inline-flex min-h-10 items-center transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">{t.footerPhone}</a></p>
                <p><span className="font-mono text-white/25">Telegram:</span> <a href={`https://t.me/${t.footerTelegram}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">@{t.footerTelegram}</a></p>
                <p><span className="font-mono text-white/25">{getText(sectionLabels.support, lang)}</span> {t.footerSupport}</p>
              </div>
            </div>

            <div>
              <FooterLabel>{t.footerDocsLabel}</FooterLabel>
              <div className="space-y-2">
                {[
                  ["/contacts", t.footerDocContacts],
                  ["/public-offer", t.footerDocOffer],
                  ["/privacy", t.footerDocPrivacy],
                  ["/returns", t.footerDocReturns],
                ].map(([href, label]) => (
                  <Link key={href} href={href} className="flex min-h-10 items-center border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white/35 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] pt-5 sm:flex-row sm:pt-6">
            <p className="text-[10px] font-mono text-white/15">{t.footerRights}</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/15">
              RAVE'ERA GROUP · <span className="text-[#00FF88]">ECC-2026</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}

function Section({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <section id={id} className="border-t border-white/[0.04] px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28">
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

function setSeo(pageTitle: string, pageDescription: string, canonicalUrl: string, imageUrl: string) {
  document.title = `${pageTitle} | RAVE'ERA GROUP`;
  setMeta("description", pageDescription);
  setMeta("og:title", pageTitle, "property");
  setMeta("og:description", pageDescription, "property");
  setMeta("og:type", "event", "property");
  setMeta("og:url", canonicalUrl, "property");
  setMeta("og:image", imageUrl, "property");
  setMeta("og:image:type", "image/webp", "property");
  setMeta("og:image:width", "1672", "property");
  setMeta("og:image:height", "941", "property");
  setMeta("twitter:title", pageTitle);
  setMeta("twitter:description", pageDescription);
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:image", imageUrl);
  const canonicalElement = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonicalElement) canonicalElement.href = canonicalUrl;
}

function setEventJsonLd(description: string) {
  const id = "ecc-event-jsonld";
  let element = document.querySelector<HTMLScriptElement>(`#${id}`);
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    name: "E-Commerce Conference 2026",
    description,
    startDate: "2026-10-06",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    url: canonical,
    image: [socialImage],
    location: {
      "@type": "Place",
      name: "КВЦ Парковий / Parkovyi ECC",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Паркова дорога, 16А",
        addressLocality: "Київ",
        addressCountry: "UA",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "RAVE'ERA GROUP",
      url: "https://www.rave-era.com.ua/",
    },
    offers: [
      {
        "@type": "Offer",
        name: "ONLINE",
        price: "1500",
        priceCurrency: "UAH",
        availability: "https://schema.org/InStock",
        url: `${canonical}/ticket-form?type=online`,
      },
      {
        "@type": "Offer",
        name: "STANDARD",
        price: "1800",
        priceCurrency: "UAH",
        availability: "https://schema.org/InStock",
        url: `${canonical}/ticket-form?type=standard`,
      },
      {
        "@type": "Offer",
        name: "VIP + AFTERPARTY",
        price: "4000",
        priceCurrency: "UAH",
        availability: "https://schema.org/InStock",
        url: `${canonical}/ticket-form?type=vip`,
      },
    ],
  });
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
