import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  MapPin,
  Mic2,
  ShoppingBag,
  Ticket,
  Users,
} from "lucide-react";

const G = "#00FF88";
const slug = "e-commerce-conference-2026";
const title = "E-Commerce Conference 2026";
const description =
  "Production event page for E-Commerce Conference 2026 by RAVE'ERA GROUP: expo, retail, marketplaces, payments, logistics and performance commerce.";

const tickets = [
  {
    key: "sport",
    name: "STANDARD",
    apiType: "sport",
    price: "2 500",
    desc: "Offline access for founders, marketers, marketplace teams and product business operators.",
    features: ["Conference and expo access", "Networking with 2,000+ attendees", "Participant package", "Photo/video report"],
  },
  {
    key: "business",
    name: "BUSINESS",
    apiType: "business",
    price: "6 500",
    desc: "Premium access for owners, C-level teams, partners and expo decision makers.",
    features: ["Business lounge", "Priority entry", "Speaker materials", "Premium networking", "Event recording"],
    popular: true,
  },
  {
    key: "online",
    name: "ONLINE",
    apiType: "online",
    price: "1",
    desc: "Remote access to the broadcast and post-event recording.",
    features: ["Online stream", "Event recording"],
  },
];

const agenda = [
  "Marketplace growth, D2C funnels and retention economics",
  "Payment conversion, Apple Pay, Google Pay and checkout trust",
  "Fulfillment, returns, customer service and operational margin",
  "AI tooling for product teams, analytics and media buying",
];

const heroMetrics = [
  { value: "2,000+", label: "attendees", Icon: Users },
  { value: "70+", label: "expo companies", Icon: Building2 },
  { value: "2026", label: "conference", Icon: Calendar },
  { value: "ECC-2026", label: "QR prefix", Icon: BadgeCheck },
];

const productionCards = [
  { Icon: Mic2, heading: "Speakers", copy: "Founders, C-level operators, marketplace leaders, payment and logistics experts." },
  { Icon: MapPin, heading: "Location", copy: "Kyiv production format with expo, stage program and networking zones." },
  { Icon: CreditCard, heading: "Payment", copy: "AlliancePay hosted payment page with card, Apple Pay and Google Pay requested." },
];

export default function ECommerceEventPage() {
  useEffect(() => {
    setSeo(title, description, `https://www.rave-era.com.ua/event/${slug}`);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-black/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-12">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/45 transition-colors hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            RAVE'ERA GROUP
          </Link>
          <Link href={`/event/${slug}/ticket-form?type=business`} className="inline-flex min-h-10 items-center gap-2 bg-[#00FF88] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
            <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
            Tickets
          </Link>
        </div>
      </nav>

      <header className="relative min-h-[92vh] overflow-hidden px-4 pb-16 pt-28 sm:px-6 md:px-12">
        <img src="/images/case-2.png" alt="E-Commerce Conference audience and expo" className="absolute inset-0 h-full w-full object-cover opacity-35 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050508] to-transparent" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-[#00FF88]/25 bg-[#00FF88]/[0.07] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              Production Event
            </div>
            <h1 className="max-w-5xl text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              E-Commerce Conference 2026
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              A business conference for Ukrainian eCommerce, retail, marketplaces, payments, logistics and performance teams.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/event/${slug}/ticket-form?type=business`} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#00FF88] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FF88]">
                Buy ticket
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/portfolio/e-commerce-conference-2026" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-[#00FF88]/50 hover:text-[#00FF88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88]">
                Portfolio case
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }} className="grid grid-cols-2 gap-3">
            {heroMetrics.map(({ value, label, Icon }) => (
              <div key={label} className="border border-white/[0.08] bg-black/45 p-5 backdrop-blur-sm">
                <Icon className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                <p className="text-2xl font-black tracking-tight text-white">{value}</p>
                <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-white/35">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      <main>
        <section className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">Program focus</p>
              <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">
                Practical commerce, not abstract inspiration.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {agenda.map((item, index) => (
                <div key={item} className="border border-white/[0.08] bg-white/[0.02] p-5">
                  <p className="mb-4 text-xs font-mono font-bold text-[#00FF88]">{String(index + 1).padStart(2, "0")}</p>
                  <p className="text-sm leading-relaxed text-white/55">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#00FF88]">Tickets</p>
                <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">Production ticketing flow</h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-white/45">
                Payments use the same AlliancePay, Neon, PDF, email, QR and admin check-in infrastructure as SBC Summit.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {tickets.map((tier) => (
                <div key={tier.key} className={`relative flex flex-col border p-6 ${tier.popular ? "border-[#00FF88]/35 bg-[#00FF88]/[0.04]" : "border-white/[0.08] bg-white/[0.02]"}`}>
                  {tier.popular ? <span className="absolute -top-3 left-5 bg-[#00FF88] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-black">Popular</span> : null}
                  <p className="text-xs font-mono uppercase tracking-widest text-white/35">{tier.name}</p>
                  <p className="mt-3 text-5xl font-black tracking-tight" style={{ color: tier.popular ? G : "white" }}>{tier.price}</p>
                  <p className="mt-1 text-sm font-mono text-white/30">UAH</p>
                  <p className="mt-5 text-sm leading-relaxed text-white/45">{tier.desc}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-white/50">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00FF88]" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/event/${slug}/ticket-form?type=${tier.apiType}`} className={`mt-7 inline-flex min-h-11 items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FF88] ${tier.popular ? "bg-[#00FF88] text-black hover:bg-white" : "border border-white/15 text-white/70 hover:border-[#00FF88]/45 hover:text-[#00FF88]"}`}>
                    Buy ticket
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.05] px-4 py-16 sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
            {productionCards.map(({ Icon, heading, copy }) => (
              <div key={heading} className="border border-white/[0.08] bg-white/[0.02] p-6">
                <Icon className="mb-5 h-5 w-5 text-[#00FF88]" aria-hidden="true" />
                <h3 className="text-lg font-black uppercase tracking-tight">{heading}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function setSeo(pageTitle: string, pageDescription: string, canonicalUrl: string) {
  document.title = `${pageTitle} | RAVE'ERA GROUP`;
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
