import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, RefreshCcw } from "lucide-react";

const G = "#00FF88";
type Lang = "en" | "uk";

const paymentDetails = {
  uk: [
    "Банк: АТ БАНК АЛЬЯНС",
    "Отримувач: ФОП Чекан Б.О.",
    "IBAN: UA303001190000026006744298001",
    "Валюта: UAH",
    "РНОКПП: 3411613291",
    "Призначення платежу: Оплата за товар/послугу",
  ],
  en: [
    "Bank: JSC Alliance Bank",
    "Recipient: FOP Chekan B.O.",
    "IBAN: UA303001190000026006744298001",
    "Currency: UAH",
    "RNOKPP: 3411613291",
    "Payment purpose: Payment for goods/services",
  ],
};

const sections = {
  uk: [
    ["1. Загальні умови", "Ця Політика визначає порядок повернення коштів за квитки на SBC Summit Ukraine 2026, що продаються ФОП Чекан Богдан Орестович (RAVE'ERA GROUP), ІПН / РНОКПП 3411613291."],
    ["2. Канал звернення", "Запит на повернення надсилається на ceo@rave-era.com.ua із темою «Повернення коштів». Для безпеки не надсилайте повний номер картки, CVV, PIN, 3-D Secure коди або фото картки."],
    ["3. Обов'язкові дані запиту", "У запиті вкажіть: ПІБ платника/учасника, email і телефон, номер замовлення або квитка, тип квитка, дату оплати, причину повернення та останні 4 цифри картки лише для ідентифікації платежу."],
    ["4. Повернення за ініціативою учасника", "Повернення можливе, якщо запит подано не пізніше ніж за 14 календарних днів до події, квиток не був використаний і не переданий іншій особі. Після початку події повернення за ініціативою учасника не здійснюється."],
    ["5. Строки та спосіб повернення", "Після погодження запиту кошти повертаються на ту саму платіжну картку, з якої була здійснена оплата. Строк обробки запиту - до 5 робочих днів; строк зарахування банком - до 14 банківських днів, якщо інше не встановлено банком."],
    ["6. Скасування події", "Якщо Організатор скасовує подію без перенесення, учаснику пропонується 100% повернення вартості квитка або перенесення на іншу подію за згодою учасника."],
    ["7. Перенесення, зміна формату та форс-мажор", "У разі перенесення події, повітряної тривоги, блекауту, воєнних ризиків, рішень влади, обмежень майданчика або технічних збоїв Організатор може запропонувати нову дату, онлайн/гібридний формат або повернення згідно з фактичною зміною послуги."],
    ["8. Неповернення", "Кошти не повертаються, якщо учасник не з'явився, порушив правила події, подав запит після встановленого строку, квиток був використаний, або доступ/матеріали ONLINE-квитка вже були надані, крім випадків, прямо передбачених законом чи рішенням Організатора."],
    ["9. Спори", "Якщо учасник не погоджується з рішенням щодо повернення, він може подати повторну претензію з додатковими доказами. Строк розгляду претензії - до 10 робочих днів."],
  ],
  en: [
    ["1. General Terms", "This Policy defines the refund procedure for SBC Summit Ukraine 2026 tickets sold by FOP Chekan Bohdan Orestovych (RAVE'ERA GROUP), IPN / RNOKPP 3411613291."],
    ["2. Request Channel", "Refund requests are sent to ceo@rave-era.com.ua with the subject 'Refund'. For security, do not send full card number, CVV, PIN, 3-D Secure codes or card photos."],
    ["3. Required Request Fields", "Include: payer/participant full name, email and phone, order or ticket number, ticket type, payment date, refund reason and only the last 4 card digits for payment identification."],
    ["4. Participant-Initiated Refund", "A refund may be requested no later than 14 calendar days before the event if the ticket has not been used or transferred. Participant-initiated refunds are not available after the event starts."],
    ["5. Refund Timeline and Method", "After approval, funds are returned to the same payment card used for payment. Request review takes up to 5 business days; bank crediting takes up to 14 banking days unless the bank applies another period."],
    ["6. Event Cancellation", "If the Organizer cancels the event without postponement, the participant is offered a 100% ticket refund or transfer to another event by agreement."],
    ["7. Postponement, Format Change and Force Majeure", "In case of postponement, air raid alert, blackout, war risks, government decisions, venue restrictions or technical failures, the Organizer may offer a new date, online/hybrid format or refund according to the actual service change."],
    ["8. Non-Refundable Cases", "Refunds are not provided if the participant does not attend, violates event rules, submits a late request, the ticket was used, or ONLINE-ticket access/materials were already provided, except where required by law or Organizer decision."],
    ["9. Disputes", "If the participant disagrees with a refund decision, they may submit a repeated claim with additional evidence. Claim review period is up to 10 business days."],
  ],
};

export default function ReturnsPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const t = lang === "uk"
    ? { back: "Назад", title: "Політика повернення", badge: "Повернення коштів", updated: "Останнє оновлення: травень 2026" }
    : { back: "Back", title: "Refund Policy", badge: "Refunds", updated: "Last updated: May 2026" };

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
              <RefreshCcw className="w-3 h-3" />
              {t.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">{t.title}</h1>
            <div className="text-xs text-white/35 font-mono leading-relaxed mb-10 space-y-1">
              {paymentDetails[lang].map((item) => <p key={item}>{item}</p>)}
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
