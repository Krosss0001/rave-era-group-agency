import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, Shield } from "lucide-react";

const G = "#00FF88";

type Lang = "en" | "uk";

export default function PrivacyPage() {
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
    title: "Політика конфіденційності",
    org: "ФОП Чекан Богдан Орестович (RAVE'ERA GROUP)",
    updated: "Останнє оновлення: травень 2026",
    sections: [
      { title: "1. Загальні положення та законодавча основа", text: "Ця Політика конфіденційності визначає порядок обробки та захисту персональних даних користувачів сайту SBC Summit Ukraine 2026. Обробка персональних даних здійснюється відповідно до Закону України «Про захист персональних даних» (№ 2297-VI від 01.06.2010), GDPR (для резидентів ЄС), а також цієї Політики. Використовуючи сайт, ви погоджуєтесь із умовами цієї Політики." },
      { title: "2. Вікові обмеження", text: "Послуги на сайті доступні лише для фізичних осіб віком від 18 років. Реєстрація та оплата квитків особами, які не досягли 18 років, заборонена. Якщо нам стане відомо про реєстрацію неповнолітньої особи, такий квиток буде анульовано з поверненням коштів." },
      { title: "3. Які дані ми збираємо", text: "Ми збираємо наступні дані: ім'я, прізвище, контактний email, номер телефону. Ці дані необхідні для реєстрації на подію, створення квитка та комунікації з Учасником. Дані платіжних карток не зберігаються — оплата проходить через AlliancePay." },
      { title: "4. Мета обробки даних", text: "Персональні дані обробляються виключно для цілей: організації участі в події, комунікації щодо програми та змін, надсилання квитка та підтвердження покупки, статистичного аналізу аудиторії." },
      { title: "5. Передача даних третім особам", text: "Ми не передаємо персональні дані третім особам без вашої згоди, за винятком випадків, передбачених законодавством України, або коли це необхідно для надання послуг (наприклад, платіжним системам — AlliancePay)." },
      { title: "6. Захист даних", text: "Ми вживаємо технічних та організаційних заходів для захисту персональних даних від несанкціонованого доступу, зміни, розголошення або знищення (SSL-шифрування, обмеження доступу, регулярні аудити). Дані платіжних карт не зберігаються на нашому сайті — оплата проходить через AlliancePay." },
      { title: "7. Права користувача", text: "Ви маєте право: отримати доступ до своїх даних, вимагати їх виправлення або видалення, відкликати згоду на обробку даних, подати скаргу до Уповноваженої особи Верховної Ради України з прав людини або до суду." },
      { title: "8. Файли cookie", text: "Сайт може використовувати файли cookie для покращення роботи та аналітики. Ви можете вимкнути cookie в налаштуваннях браузера, проте це може обмежити функціональність сайту." },
      { title: "9. Зміни до Політики", text: "Ми залишаємо за собою право оновлювати цю Політику. Усі зміни набувають чинності з моменту їх публікації на сайті. Рекомендуємо періодично переглядати цей розділ." },
    ],
  } : {
    back: "Back",
    title: "Privacy Policy",
    org: "FOP Chekan Bohdan Orestovych (RAVE'ERA GROUP)",
    updated: "Last updated: May 2026",
    sections: [
      { title: "1. General Provisions and Legal Basis", text: "This Privacy Policy defines the procedure for processing and protecting personal data of users of the SBC Summit Ukraine 2026 website. Processing is carried out in accordance with the Law of Ukraine On Personal Data Protection (No. 2297-VI dated 01.06.2010), GDPR (for EU residents), and this Policy. By using the site, you agree to the terms of this Policy." },
      { title: "2. Age Restrictions", text: "Services on the site are available only to individuals aged 18 and over. Registration and payment for tickets by minors is prohibited. If we become aware of a minor's registration, the ticket will be cancelled with a refund." },
      { title: "3. Data We Collect", text: "We collect the following data: name, surname, contact email, phone number. This data is necessary for event registration, ticket creation, and communication with the Participant. Card payment data is not stored — payments are processed through AlliancePay." },
      { title: "4. Purpose of Data Processing", text: "Personal data is processed exclusively for the following purposes: organizing participation in the event, communicating about the program and changes, sending the ticket and purchase confirmation, statistical analysis of the audience." },
      { title: "5. Sharing Data with Third Parties", text: "We do not share personal data with third parties without your consent, except as required by Ukrainian law, or when necessary to provide services (e.g., payment systems — AlliancePay)." },
      { title: "6. Data Protection", text: "We take technical and organizational measures to protect personal data from unauthorized access, alteration, disclosure, or destruction (SSL encryption, access restrictions, regular audits). Card payment data is not stored on our site — payments are processed through AlliancePay." },
      { title: "7. User Rights", text: "You have the right to: access your data, request its correction or deletion, withdraw consent to data processing, file a complaint with the Ukrainian Parliament Commissioner for Human Rights or in court." },
      { title: "8. Cookies", text: "The site may use cookies to improve performance and analytics. You can disable cookies in your browser settings, but this may limit the site's functionality." },
      { title: "9. Policy Changes", text: "We reserve the right to update this Policy. All changes take effect upon publication on the site. We recommend periodically reviewing this section." },
    ],
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
              <Shield className="w-3 h-3" />
              {lang === "uk" ? "Захист даних" : "Data Protection"}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
              {t.title}
            </h1>
            <div className="text-xs text-white/30 font-mono leading-relaxed mb-8 sm:mb-12 space-y-1">
              <p>{t.org}</p>
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
