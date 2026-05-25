import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, Shield } from "lucide-react";

const G = "#00FF88";
type Lang = "en" | "uk";

const sections = {
  uk: [
    ["1. Контролер даних", "Контролером персональних даних є ФОП Чекан Богдан Орестович (RAVE'ERA GROUP), ІПН / РНОКПП 3411613291, адреса: Україна, 03022, м. Київ, вул. Здановської Юлії, буд. 49, корп. 10, кв. 306."],
    ["2. Законодавча основа", "Обробка даних здійснюється відповідно до Закону України «Про захист персональних даних» № 2297-VI від 01.06.2010, умов цієї Політики та, якщо застосовно, GDPR для резидентів ЄС."],
    ["3. Вікові обмеження", "Сайт і купівля квитків призначені для осіб віком від 18 років. Неповнолітні можуть передавати дані або брати участь лише за згодою законного представника, якщо така участь буде окремо погоджена Організатором."],
    ["4. Категорії даних", "Ми можемо обробляти ім'я, прізвище, email, номер телефону, Telegram username, тип квитка, інформацію про замовлення, статус оплати, службові технічні дані браузера та cookie/аналітичні ідентифікатори."],
    ["5. Платіжні дані", "Дані платіжних карток вводяться тільки на захищеній сторінці банку/платіжного провайдера AlliancePay. Цей сайт не збирає, не обробляє та не зберігає номер картки, CVV, PIN або 3-D Secure коди."],
    ["6. Мета обробки", "Дані використовуються для реєстрації на SBC Summit Ukraine 2026, комунікації з учасником, формування квитка, підтвердження оплати, обробки повернень, юридичного обліку, підтримки та аналітики роботи сайту."],
    ["7. Cookie та аналітика", "Сайт може використовувати cookie, пікселі, лог-файли та інші подібні технології для стабільної роботи, вимірювання відвідуваності, безпеки та покращення сервісу. Користувач може обмежити cookie у налаштуваннях браузера."],
    ["8. Передача третім особам", "Дані можуть передаватися банку/платіжному провайдеру, сервісам email/SMS/Telegram-комунікації, хостингу, аналітиці, державним органам у випадках, передбачених законом, та підрядникам, які допомагають провести подію."],
    ["9. Захист і строки зберігання", "Ми застосовуємо технічні й організаційні заходи захисту: HTTPS, обмеження доступу, мінімізацію даних і контроль доступу. Дані зберігаються лише протягом строку, необхідного для цілей обробки, податкового/бухгалтерського обліку та захисту прав."],
    ["10. Права користувача", "Користувач має право отримати доступ до своїх даних, вимагати виправлення, видалення або обмеження обробки, відкликати згоду, заперечити проти обробки та подати скаргу до уповноваженого органу або суду."],
    ["11. Контакт", "Питання щодо персональних даних надсилайте на ceo@rave-era.com.ua із темою «Персональні дані»."],
  ],
  en: [
    ["1. Data Controller", "The personal data controller is FOP Chekan Bohdan Orestovych (RAVE'ERA GROUP), IPN / RNOKPP 3411613291, address: Ukraine, 03022, Kyiv, Yuliia Zdanovska St., 49, building 10, apt. 306."],
    ["2. Legal Basis", "Data is processed under the Law of Ukraine On Personal Data Protection No. 2297-VI dated 01.06.2010, this Policy and, where applicable, GDPR for EU residents."],
    ["3. Age Restrictions", "The site and ticket purchase are intended for persons aged 18+. Minors may provide data or participate only with guardian consent where such participation is separately approved by the Organizer."],
    ["4. Data Categories", "We may process first name, last name, email, phone number, Telegram username, ticket type, order information, payment status, browser technical data and cookie/analytics identifiers."],
    ["5. Payment Data", "Payment card data is entered only on the secure bank/payment provider page operated through AlliancePay. This site does not collect, process or store card number, CVV, PIN or 3-D Secure codes."],
    ["6. Processing Purposes", "Data is used for SBC Summit Ukraine 2026 registration, participant communication, ticket delivery, payment confirmation, refund processing, legal accounting, support and website analytics."],
    ["7. Cookies and Analytics", "The site may use cookies, pixels, log files and similar technologies for stable operation, traffic measurement, security and service improvement. Users can restrict cookies in browser settings."],
    ["8. Third-Party Sharing", "Data may be shared with the bank/payment provider, email/SMS/Telegram communication services, hosting, analytics, public authorities where required by law, and contractors helping deliver the event."],
    ["9. Security and Retention", "We apply technical and organizational safeguards: HTTPS, access restrictions, data minimization and access control. Data is kept only as long as needed for processing purposes, tax/accounting records and legal protection."],
    ["10. User Rights", "Users may request access, correction, deletion or restriction of processing, withdraw consent, object to processing and file a complaint with the competent authority or court."],
    ["11. Contact", "Personal-data questions should be sent to ceo@rave-era.com.ua with the subject 'Personal Data'."],
  ],
};

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const t = lang === "uk"
    ? { back: "Назад", title: "Політика конфіденційності", badge: "Захист даних", updated: "Останнє оновлення: травень 2026" }
    : { back: "Back", title: "Privacy Policy", badge: "Data Protection", updated: "Last updated: May 2026" };

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
              <Shield className="w-3 h-3" />
              {t.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">{t.title}</h1>
            <p className="text-xs text-white/25 font-mono mb-10">{t.updated}</p>
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
