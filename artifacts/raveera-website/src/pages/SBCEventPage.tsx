import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Ticket, ChevronDown,
  Users, Mic2, CreditCard, Globe, CheckCircle2, Zap, ExternalLink,
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

const speakers = [
  { name: "Матвій Бідний", role: "Sport Business" },
  { name: "Вадим Гутцайт", role: "Міністр спорту" },
  { name: "Олександр Шовковський", role: "Легенда футболу" },
  { name: "Дар'я Білодід", role: "Олімпійська чемпіонка" },
  { name: "Станіслав Горуна", role: "Олімпійський чемпіон" },
  { name: "Ольга Саладуха", role: "Чемпіонка світу" },
  { name: "Людмила Лузан", role: "Олімпійська призерка" },
  { name: "Ігор Ніконов", role: "Sport Business" },
];

const brands = [
  { name: "Adidas Україна", role: "Технічний партнер" },
  { name: "MEGOGO", role: "Медіа-партнер" },
  { name: "Netpeak", role: "Digital-партнер" },
];

const tickets = [
  {
    key: "sport",
    price: "2 500",
    currency: "грн",
    name: "SPORT",
    desc: "Для спортивних фахівців, клубів, команд і персональної участі.",
    features: [
      "Відвідування конференції та експозони партнерів",
      "Вхід в закриту спільноту Sport&Business Club Україна",
      "Нетворкінг із близько 1500 профільними учасниками",
      "Пакет учасника",
      "Фото/відео звіт з заходу",
    ],
  },
  {
    key: "business",
    price: "6 500",
    currency: "грн",
    name: "BUSINESS",
    desc: "Преміальний формат для керівників, партнерів і бізнес-команд.",
    features: [
      "Доступ у бізнес-lounge та зону спікерів",
      "Ексклюзивний нетворкінг з ключовими представниками",
      "Зона гостинності від партнерів",
      "Пріоритетний вхід на захід",
      "Місця в 1-4 рядах залу",
      "Доступ до презентацій спікерів",
      "Відеозапис заходу",
      "Безкоштовне паркомісце",
    ],
    popular: true,
  },
  {
    key: "online",
    price: "100",
    currency: "грн",
    name: "ONLINE",
    desc: "Дистанційний доступ до трансляції та матеріалів конференції.",
    features: [
      "Доступ до онлайн-трансляції конференції",
      "Відеозапис заходу",
    ],
  },
];

const faqs = [
  {
    q: "Де відбудеться подія?",
    a: "27 травня 2026 року у КВЦ Парковий за адресою м. Київ, Паркова дорога, 16А.",
  },
  {
    q: "Як проходить оплата?",
    a: "Після заповнення форми сайт створює заявку на квиток і відкриває захищену сторінку оплати AlliancePay.",
  },
  {
    q: "Коли буде доступний квиток?",
    a: "Квиток відкривається тільки після підтвердженого серверного статусу SUCCESS від AlliancePay.",
  },
  {
    q: "Які формати квитків доступні?",
    a: "SPORT за 2500 грн, BUSINESS за 6500 грн та ONLINE за 100 грн.",
  },
];

export default function SBCEventPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => setLang(l => (l === "uk" ? "en" : "uk"));

  const t = lang === "uk" ? {
    back: "Назад",
    badge: "RAVE'ERA GROUP · EVENT LANDING",
    heroTitle: "SBC Summit Ukraine 2026",
    heroSub: "Всеукраїнська конференція зі спортивного маркетингу",
    heroDesc: "SportBusiness Club запрошує на наймасштабнішу подію року у сфері спортивного маркетингу в Україні.",
    buyTicket: "Купити квиток",
    viewProgram: "Дивитись програму",
    stats: {
      attendees: "1500+ учасників",
      speakers: "60+ спікерів",
      duration: "09:30-23:00 програма",
      tickets: "3 формати квитків",
    },
    aboutTitle: "Наймасштабніша подія року у сфері спортивного маркетингу в Україні.",
    aboutIntro: [
      "SportBusiness Club запрошує на наймасштабнішу подію року у сфері спортивного маркетингу в Україні!",
      "Пятий, ювілейний SBC Summit Ukraine 2026 стане найбільшим зібранням лідерів галузі:",
    ],
    aboutScale: [
      "1500 учасників з усієї країни",
      "понад 60 топ-спікерів - керівники клубів, федерацій, ліг, маркетологи, медіа, спортсмени та підприємці",
      "нова потужна локація - КВЦ Парковий, один з найбільших конгрес-центрів Києва.",
    ],
    speakersText: "Спікери SBC Summit Ukraine 2026 - це люди з реальним досвідом і реальними кейсами за плечима. Серед них: міністр молоді та спорту Матвій Бідний, президент НОК України Вадим Гутцайт, зіркові воротарі Олександр Шовковський, Андрій Пятов та Денис Бойко, олімпійці Даря Білодід, Анна Різатдінова, Станіслав Горуна, Ольга Саладуха та Людмила Лузан, засновник KAN Development Ігор Ніконов та засновник Sheriff Дмитро Стрижов, топ-менеджери Adidas Україна, SCM, МХП, MEGOGO, Netpeak, Lenovo, KFC та Havas - і ще понад 50 голосів індустрії.",
    valueText: "Це найбільший майданчик спортивного маркетингу, де український спорт говорить мовою бізнесу, а бізнес заряджається спортивним духом і конкретними інструментами для зростання!",
    expectationsTitle: "Чого очікувати від конференції?",
    expectations: [
      "масштаб і енергія ювілею - найбільша аудиторія та найамбітніша програма за всю історію SBC Summit Ukraine",
      "якісний нетворкінг - 1200+ профільних фахівців: від власників клубів і федерацій до директорів з маркетингу великих брендів, медіаменеджерів та спортсменів",
      "Партнерські зони: інтерактивні локації від провідних брендів і компаній",
      "Практичні кейси та інструменти, які можна застосувати вже наступного тижня",
      "натхнення та нові партнерства - саме тут народжуються спонсорські угоди, медійні проєкти, бренд-колаборації та стратегії на 20262027 роки",
      "сучасна локація - КВЦ Парковий забезпечить комфорт, потужний звук, велику сцену та зручну логістику для такого масштабу",
      "спільнота SportBusiness Club - після події ти отримаєш постійний доступ до мережі професіоналів галузі",
    ],
    closingText: "Це захід, де говорять не про як було, а про як буде у 20262027 роках. Якщо ти формуєш майбутнє українського спорту - це твоя подія року.",
    finalInvite: "Чекаємо тебе 27 травня у КВЦ Парковий!",
    speakersTitle: "Лідери спорту, бізнесу та медіа",
    programTitle: "День для рішень, контактів і нової оптики ринку.",
    programPoints: [
      "Практичні кейси клубів, федерацій, ліг та брендів",
      "Діалог бізнесу, медіа і спортивних інституцій",
      "Партнерства, які переходять з нетворкінгу у реальні угоди",
      "Fan engagement, digital, sponsorship та media rights",
    ],
    ticketsTitle: "Три формати участі з прозорою ціною",
    locationTitle: "КВЦ Парковий, Київ",
    address: "м. Київ, Паркова дорога, 16А",
    venue: "КВЦ Парковий",
    duration: "09:30 - 23:00",
    mapOpen: "Відкрити на Google Maps",
    faqTitle: "Питання перед реєстрацією",
    ctaTitle: "Будьте в залі, де формується спортивний бізнес 2026 року.",
    footer: {
      org: "Організатор ФОП Чекан Богдан Орестович",
      ipn: "ІПН / РНОКПП: 3411613291",
      kved: "КВЕД: 90.01 Театральна та концертна діяльність",
      rights: "Всі права захищено. SBC Summit Ukraine 2026",
    },
    paymentNote: "Оплата проходить через захищену платіжну сторінку AlliancePay. Дані платіжної картки не вводяться, не обробляються та не зберігаються на цьому сайті.",
    secureBadges: "SSL Secure · AlliancePay HPP · Visa · Mastercard · Apple Pay · Google Pay",
    footerBrand: "Всеукраїнська конференція зі спортивного маркетингу. КВЦ Парковий, Київ.",
    footerOrgLabel: "ОРГАНІЗАТОР",
    footerOrgName: "ФОП Чекан Богдан Орестович",
    footerOrgFull: "RAVE'ERA GROUP",
    footerIpn: "ІПН / РНОКПП: 3411613291",
    footerKveds: [
      "КВЕД 90.01 Театральна та концертна діяльність",
      "КВЕД 90.03 Індивідуальна мистецька діяльність",
      "КВЕД 90.02 Діяльність із підтримки театральних і концертних заходів",
      "КВЕД 79.90 Надання інших послуг бронювання та повязана з цим діяльність",
    ],
    footerAddress: "Україна, 03022, м. Київ, вул. Здановської Юлії, буд. 49, корп. 10, кв. 306",
    footerBank: "Банк: АТ БАНК АЛЬЯНС",
    footerRecipient: "Отримувач: ФОП Чекан Б.О.",
    footerIban: "IBAN: UA303001190000026006744298001",
    footerCurrency: "Валюта: UAH",
    footerPurpose: "Призначення платежу: Оплата за товар/послугу",
    footerContactsLabel: "КОНТАКТИ",
    footerEmail: "ceo@rave-era.com.ua",
    footerPhone: "+38 (093) 430-75-51",
    footerTelegram: "bogdan_chekan",
    footerSupport: "Пн-Пт 10:00-19:00",
    footerDocsLabel: "ДОКУМЕНТИ",
    footerDocContacts: "Контакти",
    footerDocOffer: "Публічна оферта",
    footerDocPrivacy: "Конфіденційність",
    footerDocReturns: "Повернення",
  } : {
    back: "Back",
    badge: "RAVE'ERA GROUP · EVENT LANDING",
    heroTitle: "SBC Summit Ukraine 2026",
    heroSub: "All-Ukrainian Conference on Sports Marketing",
    heroDesc: "The fifth, anniversary SBC Summit Ukraine 2026 will be the largest gathering of industry leaders: clubs, federations, leagues, marketers, media, athletes and entrepreneurs.",
    buyTicket: "Buy Ticket",
    viewProgram: "View Program",
    stats: {
      attendees: "1500+ attendees",
      speakers: "60+ speakers",
      duration: "09:30-23:00 program",
      tickets: "3 ticket formats",
    },
    aboutTitle: "The biggest sports marketing event of the year in Ukraine.",
    aboutIntro: [
      "SportBusiness Club invites you to the biggest sports marketing event of the year in Ukraine.",
      "The fifth, anniversary SBC Summit Ukraine 2026 will be the largest gathering of industry leaders:",
    ],
    aboutScale: [
      "1500 participants from across the country",
      "over 60 top speakers - club, federation and league executives, marketers, media, athletes and entrepreneurs",
      "a powerful new venue - Parkovy ECC, one of Kyiv's largest congress centers.",
    ],
    speakersText: "SBC Summit Ukraine 2026 speakers are people with real experience and real cases behind them. They include Minister of Youth and Sports Matvii Bidnyi, President of the National Olympic Committee of Ukraine Vadym Huttsait, star goalkeepers Oleksandr Shovkovskyi, Andrii Piatov and Denys Boiko, Olympians Daria Bilodid, Anna Rizatdinova, Stanislav Horuna, Olha Saladukha and Liudmyla Luzan, KAN Development founder Ihor Nikonov and Sheriff founder Dmytro Stryzhov, top managers from Adidas Ukraine, SCM, MHP, MEGOGO, Netpeak, Lenovo, KFC and Havas - plus more than 50 industry voices.",
    valueText: "This is the largest sports marketing platform where Ukrainian sport speaks the language of business, and business gets charged with sporting energy and concrete tools for growth.",
    expectationsTitle: "What to expect from the conference?",
    expectations: [
      "anniversary scale and energy - the largest audience and most ambitious program in SBC Summit Ukraine history",
      "quality networking - 1200+ industry professionals: from club and federation owners to marketing directors of major brands, media managers and athletes",
      "Partner zones: interactive locations from leading brands and companies",
      "Practical cases and tools you can apply next week",
      "inspiration and new partnerships - sponsorship deals, media projects, brand collaborations and strategies for 20262027 are born here",
      "modern venue - Parkovy ECC provides comfort, powerful sound, a large stage and convenient logistics for this scale",
      "SportBusiness Club community - after the event you get permanent access to the industry's professional network",
    ],
    closingText: "This is the event where people discuss not how it used to be, but how it will be in 20262027. If you shape the future of Ukrainian sport, this is your event of the year.",
    finalInvite: "See you on May 27 at Parkovy ECC.",
    speakersTitle: "Leaders of sports, business & media",
    programTitle: "A day for decisions, contacts and a new market perspective.",
    programPoints: [
      "Practical cases from clubs, federations, leagues and brands",
      "Dialogue between business, media and sports institutions",
      "Partnerships that turn from networking into real deals",
      "Fan engagement, digital, sponsorship and media rights",
    ],
    ticketsTitle: "Three participation formats with transparent pricing",
    locationTitle: "Parkovy ECC, Kyiv",
    address: "Kyiv, Parkova Road, 16A",
    venue: "Parkovy ECC",
    duration: "09:30 - 23:00",
    mapOpen: "Open in Google Maps",
    faqTitle: "Questions before registration",
    ctaTitle: "Be in the hall where the sports business of 2026 is being formed.",
    footer: {
      org: "Organizer FOP Chekan Bohdan Orestovych",
      ipn: "IPN: 3411613291",
      kved: "KVED: 90.01 Theater and concert activity",
      rights: "All rights reserved. SBC Summit Ukraine 2026",
    },
    paymentNote: "Payment is processed through the secure AlliancePay payment page. Card data is not entered, processed or stored on this site.",
    secureBadges: "SSL Secure · AlliancePay HPP · Visa · Mastercard · Apple Pay · Google Pay",
    footerBrand: "All-Ukrainian Conference on Sports Marketing. Parkovy ECC, Kyiv.",
    footerOrgLabel: "ORGANIZER",
    footerOrgName: "FOP Chekan Bohdan Orestovych",
    footerOrgFull: "RAVE'ERA GROUP",
    footerIpn: "IPN: 3411613291",
    footerKveds: [
      "KVED 90.01 Театральна та концертна діяльність",
      "KVED 90.03 Індивідуальна мистецька діяльність",
      "KVED 90.02 Діяльність із підтримки театральних і концертних заходів",
      "KVED 79.90 Надання інших послуг бронювання та повязана з цим діяльність",
    ],
    footerAddress: "Ukraine, 03022, Kyiv, Zdanovska Yuliia St., 49, bld. 10, apt. 306",
    footerBank: "Bank: JSC Alliance Bank",
    footerRecipient: "Recipient: FOP Chekan B.O.",
    footerIban: "IBAN: UA303001190000026006744298001",
    footerCurrency: "Currency: UAH",
    footerPurpose: "Payment purpose: Payment for goods/services",
    footerContactsLabel: "CONTACTS",
    footerEmail: "ceo@rave-era.com.ua",
    footerPhone: "+38 (093) 430-75-51",
    footerTelegram: "bogdan_chekan",
    footerSupport: "Mon-Fri 10:00-19:00",
    footerDocsLabel: "DOCUMENTS",
    footerDocContacts: "Contacts",
    footerDocOffer: "Public Offer",
    footerDocPrivacy: "Privacy",
    footerDocReturns: "Refunds",
  };

  const mapUrl = "https://maps.google.com/maps?q=50.4490399,30.5407415&hl=uk&t=m&z=17&output=embed";
  const mapExternal = "https://www.google.com/maps/place/%22%D0%9F%D0%B0%D1%80%D0%BA%D0%BE%D0%B2%D0%B8%D0%B9%22+%D0%9A%D0%BE%D0%BD%D0%B3%D1%80%D0%B5%D1%81%D0%BD%D0%BE-%D0%B2%D0%B8%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D0%BE%D0%B2%D0%B8%D0%B9+%D1%86%D0%B5%D0%BD%D1%82%D1%80/@50.4490399,30.5407415,17z";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden selection:bg-[#00FF88] selection:text-black">
      {/* ── Sticky Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/[0.06]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="uppercase tracking-wider text-xs sm:text-sm">{t.back}</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline text-xs font-bold tracking-widest text-white/20 uppercase">RAVE'ERA GROUP</span>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-white/10 hover:border-[#00FF88]/40 hover:text-[#00FF88] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "uk" ? "UA" : "EN"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-[#00FF88]/8 blur-[140px] sm:blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-[#00FF88]/5 blur-[100px] sm:blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          >
            <div>
              {/* Badge */}
              <motion.div variants={fadeUpChild} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: G }} />
                {t.badge}
              </motion.div>

              {/* Date pills */}
              <motion.div variants={fadeUpChild} className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/50">
                  <Calendar className="w-3.5 h-3.5" style={{ color: G }} />
                  27.05.2026
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/50">
                  <Clock className="w-3.5 h-3.5" style={{ color: G }} />
                  09:30 — 23:00
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/50">
                  <MapPin className="w-3.5 h-3.5" style={{ color: G }} />
                  {t.venue}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1 variants={fadeUpChild} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-6">
                <span className="text-white">SBC Summit</span>
                <br />
                <span style={{ color: G }}>Ukraine 2026</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeUpChild} className="text-base sm:text-lg md:text-xl text-white/50 font-medium mb-4 max-w-xl">
                {t.heroSub}
              </motion.p>
              <motion.p variants={fadeUpChild} className="text-sm text-white/30 leading-relaxed max-w-lg mb-8 sm:mb-10">
                {t.heroDesc}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUpChild} className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 sm:mb-14">
                <a href="/event/sbc-summit-ukraine-2026/ticket-form?type=business" className="group relative overflow-hidden px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-xs sm:text-sm uppercase tracking-widest text-black" style={{ background: G }}>
                  <span className="relative z-10 flex items-center gap-2">
                    {t.buyTicket} <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <motion.div className="absolute inset-0 bg-white" initial={{ x: "-100%" }} whileHover={{ x: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} />
                </a>
                <a href="#program" className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/30 hover:text-white transition-colors border-b border-white/10 hover:border-white pb-0.5">
                  {t.viewProgram}
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeUpChild} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {Object.entries(t.stats).map(([key, label]) => (
                  <div key={key} className="border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4 md:p-5">
                    <div className="text-[10px] sm:text-xs font-mono text-white/25 uppercase tracking-widest mb-1">{label.split(" ")[0]}</div>
                    <div className="text-xs sm:text-sm font-bold text-white/70">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Event image */}
            <div className="order-first lg:order-last w-full">
              <img
                src="/images/case-sbc-summit.jpg"
                alt="SBC Summit Ukraine 2026"
                className="w-full rounded-sm border border-white/[0.06]"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start"
          >
            <div>
              <motion.div variants={fadeUpChild} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
                <Zap className="w-3 h-3" />
                01 {lang === "uk" ? "Подія" : "Event"}
              </motion.div>
              <motion.h2 variants={fadeUpChild} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                {t.aboutTitle}
              </motion.h2>
              <motion.div variants={fadeUpChild} className="mb-8 space-y-5 text-sm sm:text-base text-white/50 leading-relaxed">
                {t.aboutIntro.map((item) => (
                  <p key={item} className="max-w-prose">{item}</p>
                ))}
                <ul className="space-y-3 border-l border-[#00FF88]/25 pl-4 sm:pl-5">
                  {t.aboutScale.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: G }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="max-w-prose text-white/45">{t.speakersText}</p>
                <p className="max-w-prose font-semibold text-white/70">{t.valueText}</p>
              </motion.div>

              {/* Expectations */}
              <motion.div variants={fadeUpChild}>
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">{t.expectationsTitle}</h3>
                <ul className="space-y-3">
                  {t.expectations.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/40 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: G }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-y-3 border-t border-white/[0.06] pt-6">
                  <p className="max-w-prose text-sm sm:text-base text-white/50 leading-relaxed">{t.closingText}</p>
                  <p className="max-w-prose text-base sm:text-lg font-bold text-white/80 leading-relaxed">{t.finalInvite}</p>
                </div>
              </motion.div>
            </div>
            <div className="space-y-4">
              <motion.div variants={fadeUpChild} className="border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/30 mb-4">
                  <Ticket className="w-3.5 h-3.5" style={{ color: G }} />
                  RAVEERA Tickets Service
                </div>
                <p className="text-sm text-white/40 leading-relaxed mb-4">
                  {t.paymentNote}
                </p>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  {t.secureBadges}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Speakers ── */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpChild} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
              <Mic2 className="w-3 h-3" />
              02 {lang === "uk" ? "Спікери" : "Speakers"}
            </motion.div>
            <motion.h2 variants={fadeUpChild} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-8 sm:mb-12">
              {t.speakersTitle}
            </motion.h2>

            {/* Person speakers */}
            <motion.div variants={fadeUpChild} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {speakers.map((s, i) => (
                <div key={i} className="group border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 hover:border-[#00FF88]/20 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-3 sm:mb-4 flex items-center justify-center text-xs sm:text-sm font-black uppercase tracking-tighter border" style={{ borderColor: `${G}30`, background: `${G}08`, color: G }}>
                    {s.name.split(" ").map(p => p[0]).join("")}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white/80 mb-1 leading-tight">{s.name}</div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{s.role}</div>
                </div>
              ))}
            </motion.div>

            {/* Brand speakers */}
            <motion.div variants={fadeUpChild} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {brands.map((b, i) => (
                <div key={i} className="group border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 hover:border-[#00FF88]/20 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded mb-3 sm:mb-4 flex items-center justify-center text-xs font-black uppercase tracking-tighter border" style={{ borderColor: `${G}30`, background: `${G}08`, color: G }}>
                    {b.name.slice(0, 3)}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white/80 mb-1">{b.name}</div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{b.role}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Program ── */}
      <section id="program" className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20"
          >
            <div>
              <motion.div variants={fadeUpChild} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
                <Calendar className="w-3 h-3" />
                03 {lang === "uk" ? "Програма" : "Program"}
              </motion.div>
              <motion.h2 variants={fadeUpChild} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-6 sm:mb-8">
                {t.programTitle}
              </motion.h2>
            </div>
            <div className="space-y-4 sm:space-y-5">
              {t.programPoints.map((p, i) => (
                <motion.div key={i} variants={fadeUpChild} className="flex items-start gap-4">
                  <span className="text-xs font-mono font-bold mt-0.5 shrink-0" style={{ color: G }}>{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm text-white/50 leading-relaxed">{p}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Tickets ── */}
      <section id="tickets" className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpChild} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
              <Ticket className="w-3 h-3" />
              04 {lang === "uk" ? "Квитки" : "Tickets"}
            </motion.div>
            <motion.h2 variants={fadeUpChild} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-8 sm:mb-12">
              {t.ticketsTitle}
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {tickets.map((tier) => (
                <motion.div
                  key={tier.key}
                  variants={fadeUpChild}
                  className={`relative border p-5 sm:p-6 md:p-8 flex flex-col ${tier.popular ? "border-[#00FF88]/30 bg-[#00FF88]/[0.03]" : "border-white/[0.06] bg-white/[0.02]"}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-5 sm:left-6 px-3 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-black" style={{ background: G }}>
                      {lang === "uk" ? "Популярний" : "Popular"}
                    </div>
                  )}
                  <div className="mb-5 sm:mb-6">
                    <div className="text-xs font-mono uppercase tracking-widest text-white/25 mb-2">{tier.name}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter" style={{ color: tier.popular ? G : "white" }}>
                        {tier.price}
                      </span>
                      <span className="text-sm font-mono text-white/30">{tier.currency}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed mb-5 sm:mb-6">{tier.desc}</p>
                  <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-white/45">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: G }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`/event/sbc-summit-ukraine-2026/ticket-form?type=${tier.key}`}
                    className={`w-full text-center py-3 sm:py-3.5 font-bold text-xs sm:text-sm uppercase tracking-widest transition-colors ${
                      tier.popular
                        ? "text-black hover:bg-white"
                        : "text-white/70 hover:text-white border border-white/10 hover:border-[#00FF88]/30"
                    }`}
                    style={tier.popular ? { background: G } : {}}
                  >
                    {t.buyTicket}
                  </a>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUpChild} className="mt-8 sm:mt-10 border border-white/[0.04] bg-white/[0.01] p-4 sm:p-6 text-center">
              <p className="text-xs text-white/30 leading-relaxed max-w-2xl mx-auto mb-4">{t.paymentNote}</p>
              {/* Payment logos */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center">
                  <img src="/images/payment-visa.png" alt="Visa" className="h-4 w-auto object-contain" />
                </div>
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center">
                  <img src="/images/payment-mastercard.png" alt="Mastercard" className="h-5 w-auto object-contain" />
                </div>
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center">
                  <img src="/images/payment-applepay.png" alt="Apple Pay" className="h-4 w-auto object-contain" />
                </div>
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center">
                  <img src="/images/payment-googlepay.png" alt="Google Pay" className="h-4 w-auto object-contain" />
                </div>
                <div className="h-8 px-2.5 bg-white rounded-md flex items-center justify-center">
                  <img src="/images/payment-alliancepay.png" alt="AlliancePay" className="h-5 w-auto object-contain" />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <CreditCard className="w-3 h-3" />
                {t.secureBadges}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20"
          >
            <div>
              <motion.div variants={fadeUpChild} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
                <MapPin className="w-3 h-3" />
                05 {lang === "uk" ? "Локація" : "Location"}
              </motion.div>
              <motion.h2 variants={fadeUpChild} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4 sm:mb-6">
                {t.locationTitle}
              </motion.h2>
              <motion.p variants={fadeUpChild} className="text-sm text-white/45 leading-relaxed mb-5 sm:mb-6">
                {t.address}
              </motion.p>
              <motion.div variants={fadeUpChild} className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/50">
                  <MapPin className="w-3.5 h-3.5" style={{ color: G }} />
                  {t.venue}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/50">
                  <Clock className="w-3.5 h-3.5" style={{ color: G }} />
                  {t.duration}
                </span>
              </motion.div>
              <motion.a
                variants={fadeUpChild}
                href={mapExternal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00FF88] hover:text-white transition-colors border border-[#00FF88]/30 hover:border-white/30 px-4 py-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t.mapOpen}
              </motion.a>
            </div>
            <motion.div variants={fadeUpChild} className="border border-white/[0.06] bg-white/[0.02] overflow-hidden aspect-[4/3] sm:aspect-video">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(100%) invert(92%)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t.venue}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpChild} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
              <Users className="w-3 h-3" />
              06 FAQ
            </motion.div>
            <motion.h2 variants={fadeUpChild} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-8 sm:mb-12">
              {t.faqTitle}
            </motion.h2>

            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUpChild} className="border border-white/[0.06] bg-white/[0.02]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white/70 pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} style={{ color: G }} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-white/40 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 sm:py-24 md:py-36 px-4 sm:px-6 md:px-12 border-t border-white/[0.04] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[#00FF88]/5 blur-[150px] sm:blur-[200px] rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUpChild} className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8 sm:mb-10">
              {t.ctaTitle}
            </motion.h2>
            <motion.div variants={fadeUpChild}>
              <a href="/event/sbc-summit-ukraine-2026/ticket-form?type=business" className="group relative overflow-hidden inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 font-bold text-xs sm:text-sm uppercase tracking-widest text-black" style={{ background: G }}>
                <span className="relative z-10">{t.buyTicket}</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                <motion.div className="absolute inset-0 bg-white" initial={{ x: "-100%" }} whileHover={{ x: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-10 sm:py-14 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            {/* Brand */}
            <div>
              <div className="text-base sm:text-lg font-black uppercase tracking-tighter mb-1">
                RAVE'ERA <span style={{ color: G }}>GROUP</span>
              </div>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">SBC SUMMIT UKRAINE 2026</p>
              <p className="text-xs text-white/30 leading-relaxed">{t.footerBrand}</p>
            </div>

            {/* Organizer */}
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">
                <span className="w-1 h-1 rounded-full" style={{ background: G }} />
                {t.footerOrgLabel}
              </div>
              <div className="space-y-2 text-xs text-white/35 leading-relaxed">
                <p className="font-bold text-white/50">{t.footerOrgName}</p>
                <p>{t.footerOrgFull}</p>
                <p className="font-mono text-white/30">{t.footerIpn}</p>
                {t.footerKveds.map((item) => (
                  <p key={item} className="font-mono text-white/30">{item}</p>
                ))}
                <p className="font-mono text-white/30 leading-relaxed">{t.footerAddress}</p>
                <p className="font-mono text-white/25">{t.footerBank}</p>
                <p className="font-mono text-white/25">{t.footerRecipient}</p>
                <p className="font-mono text-white/25">{t.footerIban}</p>
                <p className="font-mono text-white/25">{t.footerCurrency}</p>
                <p className="font-mono text-white/25">{t.footerPurpose}</p>
              </div>
            </div>

            {/* Contacts */}
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">
                <span className="w-1 h-1 rounded-full" style={{ background: G }} />
                {t.footerContactsLabel}
              </div>
              <div className="space-y-2 text-xs text-white/35 leading-relaxed">
                <p><span className="text-white/25 font-mono">Email:</span> <a href={`mailto:${t.footerEmail}`} className="hover:text-[#00FF88] transition-colors">{t.footerEmail}</a></p>
                <p><span className="text-white/25 font-mono">{lang === "uk" ? "Телефон:" : "Phone:"}</span> <a href={`tel:+${t.footerPhone.replace(/\D/g, "")}`} className="hover:text-[#00FF88] transition-colors">{t.footerPhone}</a></p>
                <p><span className="text-white/25 font-mono">Telegram:</span> <a href={`https://t.me/${t.footerTelegram}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF88] transition-colors">{t.footerTelegram}</a></p>
                <p><span className="text-white/25 font-mono">{lang === "uk" ? "Підтримка:" : "Support:"}</span> {t.footerSupport}</p>
              </div>
            </div>

            {/* Documents */}
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">
                <span className="w-1 h-1 rounded-full" style={{ background: G }} />
                {t.footerDocsLabel}
              </div>
              <div className="space-y-2">
                <Link href="/contacts" className="block text-xs text-white/35 hover:text-[#00FF88] transition-colors border border-white/[0.06] bg-white/[0.02] px-3 py-2">{t.footerDocContacts}</Link>
                <Link href="/public-offer" className="block text-xs text-white/35 hover:text-[#00FF88] transition-colors border border-white/[0.06] bg-white/[0.02] px-3 py-2">{t.footerDocOffer}</Link>
                <Link href="/privacy" className="block text-xs text-white/35 hover:text-[#00FF88] transition-colors border border-white/[0.06] bg-white/[0.02] px-3 py-2">{t.footerDocPrivacy}</Link>
                <Link href="/returns" className="block text-xs text-white/35 hover:text-[#00FF88] transition-colors border border-white/[0.06] bg-white/[0.02] px-3 py-2">{t.footerDocReturns}</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-5 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[10px] text-white/15 font-mono">{t.footer.rights}</p>
            <p className="text-[10px] text-white/15 font-mono uppercase tracking-widest">
              RAVE'ERA GROUP · <span style={{ color: G }}>SBC Summit Ukraine 2026</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
