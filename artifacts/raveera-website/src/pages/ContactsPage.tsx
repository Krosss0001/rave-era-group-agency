import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, Mail, Phone, MessageCircle, Clock, MapPin } from "lucide-react";

const G = "#00FF88";

type Lang = "en" | "uk";

export default function ContactsPage() {
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
    title: "Контакти",
    subtitle: "Зв'яжіться з нами щодо участі, партнерства або технічних питань.",
    email: "Email",
    phone: "Телефон",
    telegram: "Telegram",
    support: "Підтримка",
    supportTime: "Пн-Пт 10:00-19:00",
    address: "Адреса",
    addressVal: "Україна, 03022, м. Київ, вул. Здановської Юлії, буд. 49, корп. 10, кв. 306",
  } : {
    back: "Back",
    title: "Contacts",
    subtitle: "Contact us regarding participation, partnership, or technical questions.",
    email: "Email",
    phone: "Phone",
    telegram: "Telegram",
    support: "Support",
    supportTime: "Mon-Fri 10:00-19:00",
    address: "Address",
    addressVal: "Ukraine, 03022, Kyiv, Zdanovska Yuliia St., 49, bld. 10, apt. 306",
  };

  const contacts = [
    { icon: Mail, label: t.email, value: "clionintrue@gmail.com", href: "mailto:clionintrue@gmail.com" },
    { icon: Phone, label: t.phone, value: "+38 (093) 430-75-51", href: "tel:+380934307551" },
    { icon: MessageCircle, label: t.telegram, value: "@bogdan_chekan", href: "https://t.me/bogdan_chekan" },
    { icon: Clock, label: t.support, value: t.supportTime, href: null },
  ];

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
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] border border-[#00FF88]/20 px-3 py-1.5 mb-6" style={{ color: G, background: `${G}08` }}>
              <MessageCircle className="w-3 h-3" />
              {lang === "uk" ? "Зв'язок" : "Contact"}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
              {t.title}
            </h1>
            <p className="text-sm text-white/40 leading-relaxed max-w-xl mb-8 sm:mb-12">
              {t.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-12">
            {contacts.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
              >
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30 mb-3">
                  <c.icon className="w-3.5 h-3.5" style={{ color: G }} />
                  {c.label}
                </div>
                {c.href ? (
                  <a href={c.href} className="text-sm sm:text-base font-bold text-white/80 hover:text-[#00FF88] transition-colors break-all" target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    {c.value}
                  </a>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-white/80">{c.value}</p>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30 mb-3">
              <MapPin className="w-3.5 h-3.5" style={{ color: G }} />
              {t.address}
            </div>
            <p className="text-sm text-white/50 leading-relaxed">{t.addressVal}</p>
          </motion.div>
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
