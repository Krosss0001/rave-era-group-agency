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
    sections: [
      { title: "1. Загальні положення", text: "Ця публічна оферта є офіційною пропозицією ФОП Чекан Богдан Орестович (надалі — Організатор) будь-якій фізичній або юридичній особі (надалі — Учасник) укласти договір надання послуг з організації та проведення події SBC Summit Ukraine 2026." },
      { title: "2. Предмет договору", text: "Організатор зобов'язується надати Учаснику послуги з доступу до конференції у вибраному форматі (SPORT, BUSINESS або ONLINE), а Учасник зобов'язується оплатити ці послуги в розмірі та порядку, визначених на сайті події." },
      { title: "3. Порядок оплати", text: "Оплата здійснюється через захищену платіжну сторінку AlliancePay. Квиток відкривається тільки після підтвердженого серверного статусу SUCCESS. Онлайн-оплата буде активована після завершення верифікації мерчанта." },
      { title: "4. Права та обов'язки сторін", text: "Учасник зобов'язаний надати достовірні контактні дані при реєстрації та дотримуватися правил поведінки на заході. Організатор зобов'язується забезпечити умови участі відповідно до обраного формату квитка." },
      { title: "5. Повернення коштів", text: "Умови повернення коштів визначаються окремим розділом Політики повернення. У разі скасування події Організатором з об'єктивних причин, Учаснику буде запропоновано перенесення на наступний захід або повернення коштів." },
      { title: "6. Зміна та скасування події", text: "Організатор залишає за собою право змінити програму, спікерів або час проведення події. Учасник буде повідомлений про суттєві зміни не пізніше ніж за 7 днів до заходу." },
      { title: "7. Конфіденційність", text: "Усі персональні дані Учасника обробляються відповідно до Політики конфіденційності та законодавства України." },
      { title: "8. Вирішення спорів", text: "Усі спори вирішуються шляхом переговорів. У разі недосягнення згоди — відповідно до законодавства України в суді за місцезнаходженням Організатора." },
    ],
    updated: "Останнє оновлення: травень 2026",
  } : {
    back: "Back",
    title: "Public Offer",
    org: "FOP Chekan Bohdan Orestovych",
    orgFull: "RAVE'ERA GROUP",
    ipn: "IPN: 3411613291",
    sections: [
      { title: "1. General Provisions", text: "This public offer is an official proposal by FOP Chekan Bohdan Orestovych (hereinafter — the Organizer) to any individual or legal entity (hereinafter — the Participant) to enter into a contract for organizing and conducting the SBC Summit Ukraine 2026 event." },
      { title: "2. Subject of the Agreement", text: "The Organizer undertakes to provide the Participant with access to the conference in the selected format (SPORT, BUSINESS, or ONLINE), and the Participant undertakes to pay for these services in the amount and manner specified on the event website." },
      { title: "3. Payment Procedure", text: "Payment is made through the secure AlliancePay payment page. The ticket is only issued after a confirmed server status of SUCCESS. Online payment will be activated after merchant verification is complete." },
      { title: "4. Rights and Obligations", text: "The Participant is obliged to provide accurate contact details during registration and adhere to the event code of conduct. The Organizer undertakes to ensure participation conditions according to the selected ticket format." },
      { title: "5. Refund Policy", text: "Refund conditions are defined in a separate Refund Policy section. If the Organizer cancels the event for objective reasons, the Participant will be offered a transfer to the next event or a refund." },
      { title: "6. Changes and Cancellation", text: "The Organizer reserves the right to change the program, speakers, or event timing. The Participant will be notified of material changes at least 7 days before the event." },
      { title: "7. Confidentiality", text: "All personal data of the Participant is processed in accordance with the Privacy Policy and the legislation of Ukraine." },
      { title: "8. Dispute Resolution", text: "All disputes are resolved through negotiations. If no agreement is reached — in accordance with the legislation of Ukraine in the court at the Organizer's location." },
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
