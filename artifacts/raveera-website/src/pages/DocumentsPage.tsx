import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, FileText } from "lucide-react";

const G = "#00FF88";

type Lang = "en" | "uk";

const docs = {
  uk: [
    { title: "Публічна оферта", desc: "Умови надання послуг та придбання квитків на події RAVE'ERA GROUP.", path: "/public-offer" },
    { title: "Політика конфіденційності", desc: "Як ми збираємо, використовуємо та захищаємо ваші персональні дані.", path: "/privacy" },
    { title: "Повернення коштів", desc: "Правила та умови повернення коштів за придбані квитки.", path: "/returns" },
    { title: "Угода користувача", desc: "Загальні умови використання сайту та сервісів.", path: "/public-offer" },
  ],
  en: [
    { title: "Public Offer", desc: "Terms of service and ticket purchase for RAVE'ERA GROUP events.", path: "/public-offer" },
    { title: "Privacy Policy", desc: "How we collect, use, and protect your personal data.", path: "/privacy" },
    { title: "Refund Policy", desc: "Rules and conditions for refunding purchased tickets.", path: "/returns" },
    { title: "User Agreement", desc: "General terms of use for the website and services.", path: "/public-offer" },
  ],
};

export default function DocumentsPage() {
  const [lang, setLang] = useState<Lang>("uk");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => setLang(l => (l === "uk" ? "en" : "uk"));
  const t = lang === "uk" ? { title: "Документи", back: "Назад" } : { title: "Documents", back: "Back" };
  const items = docs[lang];

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
              <FileText className="w-3 h-3" />
              {lang === "uk" ? "Юридичні документи" : "Legal Documents"}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-8 sm:mb-12">
              {t.title}
            </h1>
          </motion.div>

          <div className="space-y-4">
            {items.map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={doc.path} className="group flex items-start gap-4 border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6 hover:border-[#00FF88]/20 transition-colors">
                  <div className="w-10 h-10 rounded flex items-center justify-center text-sm font-black uppercase tracking-tighter border shrink-0" style={{ borderColor: `${G}30`, background: `${G}08`, color: G }}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white/80 mb-1 group-hover:text-[#00FF88] transition-colors">{doc.title}</h3>
                    <p className="text-xs text-white/35 leading-relaxed">{doc.desc}</p>
                  </div>
                </Link>
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
