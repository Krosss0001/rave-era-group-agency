import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, Scale } from "lucide-react";

const G = "#00FF88";
type Lang = "en" | "uk";

const legalDetails = {
  uk: [
    "Продавець послуги: ФОП Чекан Богдан Орестович (RAVE'ERA GROUP)",
    "ІПН / РНОКПП: 3411613291",
    "КВЕД 90.01 Театральна та концертна діяльність",
    "КВЕД 90.03 Індивідуальна мистецька діяльність",
    "КВЕД 90.02 Діяльність із підтримки театральних і концертних заходів",
    "КВЕД 79.90 Надання інших послуг бронювання та повязана з цим діяльність",
    "Юридична адреса: Україна, 03022, м. Київ, вул. Здановської Юлії, буд. 49, корп. 10, кв. 306",
    "Банк: АТ БАНК АЛЬЯНС",
    "Отримувач: ФОП Чекан Б.О.",
    "IBAN: UA303001190000026006744298001",
    "Валюта: UAH",
    "Призначення платежу: Оплата за товар/послугу",
    "Платіжна сторінка: AlliancePay HPP.",
  ],
  en: [
    "Service seller: FOP Chekan Bohdan Orestovych (RAVE'ERA GROUP)",
    "IPN / RNOKPP: 3411613291",
    "KVED 90.01 Театральна та концертна діяльність",
    "KVED 90.03 Індивідуальна мистецька діяльність",
    "KVED 90.02 Діяльність із підтримки театральних і концертних заходів",
    "KVED 79.90 Надання інших послуг бронювання та повязана з цим діяльність",
    "Legal address: Ukraine, 03022, Kyiv, Yuliia Zdanovska St., 49, building 10, apt. 306",
    "Bank: JSC Alliance Bank",
    "Recipient: FOP Chekan B.O.",
    "IBAN: UA303001190000026006744298001",
    "Currency: UAH",
    "Payment purpose: Payment for goods/services",
    "Hosted payment page: AlliancePay HPP.",
  ],
};

const sections = {
  uk: [
    ["1. Загальні положення", "Ця Публічна оферта є пропозицією ФОП Чекан Богдан Орестович укласти договір про надання послуг з організації участі у події SBC Summit Ukraine 2026. Подія відбудеться 27 травня 2026 року, 09:30-23:00, у КВЦ «Парковий», м. Київ, Паркова дорога, 16А. Акцепт оферти відбувається після оплати квитка через AlliancePay та отримання статусу SUCCESS."],
    ["2. Склад послуги та квитки", "SPORT - 2 500 грн: офлайн-доступ до конференції, експозони, нетворкінгу, спільноти Sport&Business Club, пакета учасника та фото/відео звіту. BUSINESS - 6 500 грн: SPORT-доступ плюс бізнес-lounge, зона спікерів, пріоритетний вхід, місця 1-4 рядів, матеріали спікерів, відеозапис і паркомісце. ONLINE - 100 грн: онлайн-трансляція та відеозапис події."],
    ["3. Порядок оплати", "Оплата здійснюється на захищеній платіжній сторінці AlliancePay HPP. Сайт не приймає, не обробляє та не зберігає дані платіжних карток. Можливі статуси банку: SUCCESS - оплату підтверджено; FAIL - оплату відхилено або скасовано; PENDING - очікується остаточний статус; REQUIRED_3DS - потрібне підтвердження 3-D Secure. Перевірка callback/status виконується тільки на backend/server-side. Квиток видається тільки після SUCCESS."],
    ["4. Видача квитка та фіскальний документ", "Після SUCCESS учасник отримує підтвердження покупки на email протягом 15 хвилин. PDF-квиток або інструкція доступу надсилається на email не пізніше ніж за 24 години до події. Розрахунковий документ/чек формується відповідно до вимог законодавства України та процедур банку/платіжного провайдера."],
    ["5. Зміни програми та спікерів", "Організатор може замінити спікера, змінити таймінг, порядок виступів або окремі активності без зміни загального формату події. Заміна спікера не є підставою для повернення коштів, якщо подія відбувається у заявленому форматі."],
    ["6. Форс-мажор, безпека та технічні обставини", "У разі повітряної тривоги, блекауту, воєнних ризиків, рішень органів влади, обмежень майданчика, технічних збоїв, карантинних або інших форс-мажорних обставин Організатор може призупинити, перенести, змінити формат на онлайн/гібридний або скасувати подію. Учасники отримують повідомлення email/SMS/Telegram за наявними контактами."],
    ["7. Повернення коштів", "Повернення регулюється Політикою повернення. Якщо повернення погоджено, кошти повертаються на ту саму платіжну картку, з якої була проведена оплата. Організатор не запитує повні дані картки, CVV або PIN."],
    ["8. Персональні дані", "Персональні дані обробляються згідно з Політикою конфіденційності та Законом України «Про захист персональних даних». Платіжні карткові дані обробляє банк/платіжний провайдер, а не цей сайт."],
    ["9. Претензії та спори", "Претензії надсилаються на ceo@rave-era.com.ua із номером замовлення, ПІБ, контактами та описом питання. Строк розгляду - до 10 робочих днів. Якщо спір не врегульовано шляхом переговорів, він вирішується за законодавством України."],
  ],
  en: [
    ["1. General Provisions", "This Public Offer is an offer by FOP Chekan Bohdan Orestovych to provide services for participation in SBC Summit Ukraine 2026. The event takes place on May 27, 2026, 09:30-23:00, at Parkovy ECC, Kyiv, Parkova Road, 16A. The offer is accepted after ticket payment through AlliancePay and bank status SUCCESS."],
    ["2. Service Scope and Tickets", "SPORT - 2,500 UAH: in-person conference access, partner expo, networking, Sport&Business Club community, participant package and photo/video report. BUSINESS - 6,500 UAH: SPORT access plus business lounge, speaker zone, priority entry, rows 1-4 seating, speaker materials, event recording and parking. ONLINE - 1,000 UAH: online broadcast and event recording."],
    ["3. Payment Procedure", "Payment is made on the secure AlliancePay hosted payment page. This site does not accept, process or store payment card data. Possible bank statuses: SUCCESS - payment confirmed; FAIL - payment declined or cancelled; PENDING - final status is pending; REQUIRED_3DS - 3-D Secure confirmation is required. Callback/status checks are performed only on the backend server side. A ticket is issued only after SUCCESS."],
    ["4. Ticket Delivery and Receipt", "After SUCCESS, the participant receives purchase confirmation by email within 15 minutes. The PDF ticket or access instructions are sent by email no later than 24 hours before the event. A fiscal receipt/check is issued according to Ukrainian law and bank/payment-provider procedures."],
    ["5. Speaker and Program Changes", "The Organizer may replace speakers, adjust timing, change the order of sessions or individual activities without changing the overall event format. Speaker replacement is not a refund ground if the event is held in the announced format."],
    ["6. Force Majeure, Safety and Technical Events", "In case of air raid alerts, blackout, war risks, government restrictions, venue restrictions, technical failures, quarantine or other force majeure, the Organizer may pause, postpone, switch to online/hybrid format or cancel the event. Participants are notified by email/SMS/Telegram using available contacts."],
    ["7. Refunds", "Refunds are governed by the Refund Policy. If a refund is approved, money is returned to the same payment card used for payment. The Organizer never asks for full card number, CVV or PIN."],
    ["8. Personal Data", "Personal data is processed under the Privacy Policy and the Law of Ukraine On Personal Data Protection. Payment card data is processed by the bank/payment provider, not by this site."],
    ["9. Claims and Disputes", "Claims are sent to ceo@rave-era.com.ua with order number, full name, contacts and issue description. Review period is up to 10 business days. If the dispute is not settled by negotiation, it is resolved under Ukrainian law."],
  ],
};

export default function PublicOfferPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const t = lang === "uk"
    ? { back: "Назад", title: "Публічна оферта", badge: "Правові умови", updated: "Останнє оновлення: травень 2026" }
    : { back: "Back", title: "Public Offer", badge: "Legal Terms", updated: "Last updated: May 2026" };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden selection:bg-[#00FF88] selection:text-black">
      <nav className="sticky top-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex min-h-10 items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
          <button type="button" onClick={() => setLang(lang === "uk" ? "en" : "uk")} className="min-h-10 px-3 flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase border border-white/10 hover:border-[#00FF88]/50 text-white/40 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <Globe className="w-3 h-3" />{lang === "en" ? "UA" : "EN"}
          </button>
        </div>
      </nav>

      <main className="py-12 sm:py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
              <Scale className="w-3 h-3" />
              {t.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-5">{t.title}</h1>
            <div className="text-xs text-white/35 font-mono leading-relaxed mb-10 space-y-1">
              {legalDetails[lang].map((item) => <p key={item}>{item}</p>)}
              <p className="text-white/20">{t.updated}</p>
            </div>
          </motion.div>

          <div className="space-y-7">
            {sections[lang].map(([title, body], index) => (
              <motion.section key={title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.04 }}>
                <h2 className="text-sm sm:text-base font-bold text-white/75 uppercase tracking-wider mb-3">{title}</h2>
                <p className="text-sm text-white/48 leading-relaxed">{body}</p>
              </motion.section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
