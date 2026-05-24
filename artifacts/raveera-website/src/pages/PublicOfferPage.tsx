import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, Scale } from "lucide-react";

const G = "#00FF88";

type Lang = "en" | "uk";

export default function PublicOfferPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => setLang(l => (l === "uk" ? "en" : "uk"));

  const t = lang === "uk" ? {
    back: "Назад",
    title: "Публічна оферта",
    org: "ФОП Чекан Богдан Орестович",
    orgFull: "RAVE'ERA GROUP",
    ipn: "ІПН / РНОКПП: 3411613291",
    address: "Юридична адреса: [ВКАЖІТЬ АДРЕСУ РЕЄСТРАЦІЇ ФОП]",
    iban: "Р/р IBAN: [ВКАЖІТЬ IBAN ФОП]",
    bank: "Банк: АТ «Альянс Банк» (Alliance Bank)",
    sections: [
      { title: "1. Загальні положення", text: "Ця публічна оферта є офіційною пропозицією ФОП Чекан Богдан Орестович, ІПН 3411613291 (надалі — Організатор), укласти договір надання послуг з організації та проведення конференції SBC Summit Ukraine 2026 з будь-якою фізичною особою віком від 18 років (надалі — Учасник). Прийняття оферти здійснюється шляхом оплати квитка через платіжну систему AlliancePay (АТ «Альянс Банк»)." },
      { title: "2. Предмет договору та склад послуг", text: "Організатор надає Учаснику доступ до події SBC Summit Ukraine 2026 відповідно до обраного типу квитка. SPORT — доступ до всіх сесій та нетворкінгу (2 500 ₴). BUSINESS — доступ до всіх сесій, нетворкінгу та закритої вечірки (6 500 ₴). ONLINE — онлайн-трансляція всіх сесій (1 000 ₴). До вартості входить: вхід на обрані активності, роздаткові матеріали, кава-паузи. До вартості не входять: транспорт, проживання, харчування поза програмою заходу." },
      { title: "3. Порядок оплати та видача квитка", text: "Оплата здійснюється онлайн через захищену платіжну сторінку AlliancePay. Після успішної оплати (статус SUCCESS від банку) Учасник отримує електронне підтвердження покупки на вказаний email протягом 15 хвилин. Квиток у форматі PDF надсилається на email не пізніше ніж за 24 години до заходу. Квиток також доступний для повторного завантаження за запитом на email clionintrue@gmail.com з зазначенням номера замовлення." },
      { title: "4. Права та обов'язки сторін", text: "Учасник зобов'язаний надати достовірні контактні дані, бути старше 18 років, дотримуватися правил поведінки та інструкцій безпеки на заході. Організатор зобов'язується забезпечити доступ до обраних активностей, надати квиток у зазначений термін, повідомляти про суттєві зміни не пізніше ніж за 7 днів." },
      { title: "5. Заміна спікерів та програми", text: "Організатор залишає за собою право змінити склад спікерів або програму заходу без попереднього узгодження з Учасником. Про заміну спікера Учасник буде повідомлений не пізніше ніж за 3 дні до заходу. Заміна спікера не є підставою для повернення коштів, якщо загальний формат події збережено." },
      { title: "6. Форс-мажорні обставини", text: "У разі виникнення форс-мажорних обставин (повітряна тривога, блекаут, стихійне лихо, воєнні дії, карантинні обмеження, рішення органів влади), Організатор має право: перенести захід на резервну дату без зміни формату; перевести очний формат на онлайн з частковим поверненням різниці; скасувати захід з поверненням 100% вартості протягом 30 днів. Учасник буде повідомлений про зміни SMS та email протягом 3 годин." },
      { title: "7. Повернення коштів", text: "Умови повернення коштів визначаються окремим розділом Політики повернення. У разі скасування події Організатором з об'єктивних причин, Учаснику буде запропоновано перенесення на наступний захід або повернення коштів на ту саму платіжну картку протягом 14 банківських днів." },
      { title: "8. Конфіденційність та персональні дані", text: "Усі персональні дані Учасника обробляються відповідно до Політики конфіденційності, Закону України «Про захист персональних даних» та GDPR. Платіжні дані карток не зберігаються на серверах Організатора — опрацювання здійснюється AlliancePay." },
      { title: "9. Вирішення спорів", text: "Усі спори вирішуються шляхом переговорів. У разі недосягнення згоди — відповідно до законодавства України в суді за місцезнаходженням Організатора. Сторони застосовують передсудове врегулювання: претензія розглядається протягом 10 робочих днів." },
    ],
    updated: "Останнє оновлення: травень 2026",
  } : {
    back: "Back",
    title: "Public Offer",
    org: "FOP Chekan Bohdan Orestovych",
    orgFull: "RAVE'ERA GROUP",
    ipn: "IPN: 3411613291",
    address: "Legal Address: [ENTER FOP REGISTRATION ADDRESS]",
    iban: "IBAN: [ENTER FOP IBAN]",
    bank: "Bank: JSC \"Alliance Bank\"",
    sections: [
      { title: "1. General Provisions", text: "This public offer is an official proposal by FOP Chekan Bohdan Orestovych, IPN 3411613291 (hereinafter — the Organizer) to enter into a contract for organizing and conducting the SBC Summit Ukraine 2026 conference with any individual aged 18+ (hereinafter — the Participant). Acceptance is made by paying for the ticket via the AlliancePay payment system (JSC Alliance Bank)." },
      { title: "2. Subject of the Agreement and Services", text: "The Organizer provides the Participant with access to the SBC Summit Ukraine 2026 event according to the selected ticket type. SPORT — access to all sessions and networking (2,500 UAH). BUSINESS — access to all sessions, networking, and closed after-party (6,500 UAH). ONLINE — online broadcast of all sessions (1,000 UAH). Price includes: entry to selected activities, handout materials, coffee breaks. Not included: transport, accommodation, meals outside the event program." },
      { title: "3. Payment Procedure and Ticket Delivery", text: "Payment is made online through the secure AlliancePay payment page. After successful payment (bank status SUCCESS), the Participant receives an electronic purchase confirmation at the specified email within 15 minutes. A PDF ticket is sent to the email no later than 24 hours before the event. The ticket can also be re-downloaded upon request to clionintrue@gmail.com with the order number." },
      { title: "4. Rights and Obligations", text: "The Participant must provide accurate contact details, be over 18 years old, follow the code of conduct and safety instructions. The Organizer undertakes to ensure access to selected activities, deliver the ticket within the stated timeframe, and notify of material changes at least 7 days in advance." },
      { title: "5. Speaker and Program Changes", text: "The Organizer reserves the right to change the speaker lineup or event program without prior agreement. The Participant will be notified of any speaker replacement no later than 3 days before the event. Speaker replacement is not grounds for a refund if the overall event format is preserved." },
      { title: "6. Force Majeure", text: "In the event of force majeure (air raid alerts, blackout, natural disasters, military actions, quarantine restrictions, government decisions), the Organizer may: reschedule the event to a reserve date without changing the format; switch the in-person format to online with a partial refund of the difference; cancel the event with a 100% refund within 30 days. The Participant will be notified via SMS and email within 3 hours." },
      { title: "7. Refund Policy", text: "Refund conditions are defined in a separate Refund Policy section. If the Organizer cancels the event for objective reasons, the Participant will be offered a transfer to the next event or a refund to the same payment card within 14 banking days." },
      { title: "8. Confidentiality and Personal Data", text: "All personal data is processed in accordance with the Privacy Policy, the Law of Ukraine On Personal Data Protection, and GDPR. Card payment data is not stored on the Organizer's servers — processing is handled by AlliancePay." },
      { title: "9. Dispute Resolution", text: "All disputes are resolved through negotiations. If no agreement is reached — in accordance with Ukrainian law in the court at the Organizer's location. Parties apply pre-trial settlement: claims are reviewed within 10 business days." },
    ],
    updated: "Last updated: May 2026",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden selection:bg-[#00FF88] selection:text-black">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/[0.06]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-[#00FF88] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.back}
          </Link>
          <button onClick={toggleLang} className="h-9 px-3 flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase border border-white/10 hover:border-[#00FF88]/50 text-white/40 hover:text-[#00FF88] transition-all">
            <Globe className="w-3 h-3" />{lang === "en" ? "UA" : "EN"}
          </button>
        </div>
      </nav>

      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
              <Scale className="w-3 h-3" />
              {lang === "uk" ? "Правові умови" : "Legal Terms"}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
              {t.title}
            </h1>
            <div className="text-xs text-white/30 font-mono leading-relaxed mb-8 sm:mb-12 space-y-1">
              <p>{t.orgFull} — {t.org}</p>
              <p>{t.ipn}</p>
              <p>{(t as any).address}</p>
              <p>{(t as any).iban}</p>
              <p>{(t as any).bank}</p>
              <p className="text-white/20">{t.updated}</p>
            </div>
          </motion.div>

          <div className="space-y-6 sm:space-y-8">
            {t.sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <h2 className="text-sm sm:text-base font-bold text-white/70 uppercase tracking-wider mb-3">{s.title}</h2>
                <p className="text-sm text-white/40 leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 sm:py-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-white/15 font-mono">RAVE'ERA GROUP · SBC Summit Ukraine 2026</p>
          <p className="text-[10px] text-white/15 font-mono">{lang === "uk" ? "Всі права захищено" : "All rights reserved"}</p>
        </div>
      </footer>
    </div>
  );
}
