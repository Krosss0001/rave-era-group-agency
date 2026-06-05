import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, LineChart, ShieldCheck, Ticket, Users } from "lucide-react";

const G = "#00FF88";
const title = "E-Commerce Conference 2026";
const description =
  "Portfolio case for E-Commerce Conference 2026: 2,000+ attendees, 70+ expo companies, full-cycle event production and ticketing by RAVE'ERA GROUP.";

const deliverables = [
  "Event positioning for product business and eCommerce operators",
  "B2B and B2C ticket sales architecture",
  "Expo partner packaging and sponsor communication",
  "AlliancePay ticketing, PDF delivery, QR access control and check-in",
];

const capabilityCards = [
  { Icon: Users, heading: "Audience", copy: "Founders, CMOs, marketplace teams and product business operators." },
  { Icon: Building2, heading: "Expo", copy: "Partner booths, sponsor zones and lead-generation mechanics." },
  { Icon: LineChart, heading: "Sales", copy: "B2B/B2C promotion with ticket funnel and reporting discipline." },
  { Icon: ShieldCheck, heading: "Access", copy: "PDF ticket, QR payload and admin check-in under one system." },
];

export default function ECommercePortfolioPage() {
  useEffect(() => {
    setSeo(title, description, "https://www.rave-era.com.ua/portfolio/e-commerce-conference-2026");
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-black/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-12">
          <Link href="/#cases" className="inline-flex min-h-10 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/45 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Portfolio
          </Link>
          <Link href="/event/e-commerce-conference-2026" className="inline-flex min-h-10 items-center gap-2 border border-[#00FF88]/35 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#00FF88] transition-colors hover:border-white/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            Event page
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </nav>

      <header className="relative px-4 pb-16 pt-28 sm:px-6 md:px-12 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,255,136,0.1),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="mb-5 inline-flex border border-[#00FF88]/25 bg-[#00FF88]/[0.07] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">
              Portfolio case
            </p>
            <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl md:text-7xl">
              E-Commerce Conference 2026
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/58">
              A production case for a business conference built around eCommerce, retail, marketplaces, payments, logistics and expo partnerships.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative overflow-hidden">
            <img src="/images/case-2.png" alt="E-Commerce Conference 2026 portfolio case" className="aspect-video w-full object-cover grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
              <Metric value="2,000+" label="attendees" />
              <Metric value="70+" label="expo companies" />
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="border-y border-white/[0.05] px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
            {capabilityCards.map(({ Icon, heading, copy }) => (
              <div key={heading} className="border border-white/[0.08] bg-white/[0.02] p-5">
                <Icon className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                <h2 className="text-sm font-black uppercase tracking-tight">{heading}</h2>
                <p className="mt-3 text-xs leading-relaxed text-white/45">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">Scope</p>
              <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">
                From event product to paid entry.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/45">
                The case extends RAVE'ERA GROUP's existing production stack into a dedicated eCommerce conference with live payment, ticketing and access-control readiness.
              </p>
            </div>
            <div className="space-y-3">
              {deliverables.map((item, index) => (
                <div key={item} className="flex items-start gap-4 border border-white/[0.08] bg-white/[0.02] p-5">
                  <span className="text-xs font-mono font-bold text-[#00FF88]">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-sm leading-relaxed text-white/56">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">Production event</p>
              <h2 className="text-2xl font-black uppercase tracking-tight sm:text-4xl">Open the live event page and ticket flow.</h2>
            </div>
            <Link href="/event/e-commerce-conference-2026/ticket-form?type=business" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#00FF88] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
              <Ticket className="h-4 w-4" aria-hidden="true" />
              Ticket form
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-white/[0.08] bg-black/70 p-4 backdrop-blur-sm">
      <p className="text-2xl font-black tracking-tight text-[#00FF88]">{value}</p>
      <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-white/45">{label}</p>
    </div>
  );
}

function setSeo(pageTitle: string, pageDescription: string, canonicalUrl: string) {
  document.title = `${pageTitle} | Portfolio | RAVE'ERA GROUP`;
  setMeta("description", pageDescription);
  setMeta("og:title", pageTitle, "property");
  setMeta("og:description", pageDescription, "property");
  setMeta("og:url", canonicalUrl, "property");
  setMeta("twitter:title", pageTitle);
  setMeta("twitter:description", pageDescription);
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = canonicalUrl;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
}
