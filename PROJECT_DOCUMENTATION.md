# Rave'era Group Website — Full Project Documentation

## 1. Project Overview

A bilingual (English/Ukrainian) dark-themed corporate website for **Rave'era Group** — a full-cycle event agency from Kyiv, Ukraine. The site features a main landing page, a dedicated event landing page for SBC Summit Ukraine 2026, and 5 legal pages.

### Tech Stack
- **Framework**: React 18 + TypeScript + Vite 7
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Routing**: wouter (lightweight React router)
- **Animations**: framer-motion
- **Icons**: lucide-react
- **Build output**: `dist/public/`

### Brand Colors
- Primary accent: `#00FF88` (neon green)
- Background: `#0A0A0F` / `#000000`
- Text: white with opacity levels (white/30, white/50, white/70)
- Font: Inter (sans-serif), JetBrains Mono (monospace)

---

## 2. File Structure

```
raveera-website/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── components.json
├── public/
│   ├── favicon.svg
│   ├── opengraph.jpg
│   ├── raveera-style-pack.md
│   └── images/
│       ├── about-1.png
│       ├── about-2.png
│       ├── case-1.png
│       ├── case-2.png
│       ├── case-3.png
│       ├── case-music-box.jpg
│       ├── case-sbc-summit.jpg
│       ├── case-smart-commerce.jpg
│       ├── case-zeekr.jpg
│       ├── payment-alliancepay.png
│       ├── payment-applepay.png
│       ├── payment-googlepay.png
│       ├── payment-mastercard.png
│       ├── payment-visa.png
│       ├── team-1.png
│       ├── team-2.png
│       ├── team-3.png
│       ├── team-bogdan.jpg
│       └── team-yaroslav.jpg
└── src/
    ├── main.tsx
    ├── index.css
    ├── App.tsx
    ├── lib/
    │   └── utils.ts
    ├── hooks/
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    ├── components/
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── button-group.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── empty.tsx
    │       ├── field.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-group.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── item.tsx
    │       ├── kbd.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── spinner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle.tsx
    │       ├── toggle-group.tsx
    │       └── tooltip.tsx
    └── pages/
        ├── home.tsx
        ├── not-found.tsx
        ├── SBCEventPage.tsx
        ├── DocumentsPage.tsx
        ├── ContactsPage.tsx
        ├── PublicOfferPage.tsx
        ├── PrivacyPage.tsx
        └── ReturnsPage.tsx
```

---

## 3. Dependencies (package.json)

```json
{
  "name": "@workspace/raveera-website",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --config vite.config.ts --host 0.0.0.0",
    "build": "vite build --config vite.config.ts",
    "serve": "vite preview --config vite.config.ts --host 0.0.0.0",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@replit/vite-plugin-cartographer": "catalog:",
    "@replit/vite-plugin-dev-banner": "catalog:",
    "@replit/vite-plugin-runtime-error-modal": "catalog:",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "catalog:",
    "@tanstack/react-query": "catalog:",
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "@workspace/api-client-react": "workspace:*",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "catalog:",
    "input-otp": "^1.4.2",
    "lucide-react": "catalog:",
    "next-themes": "^0.4.6",
    "playwright-core": "^1.60.0",
    "react": "catalog:",
    "react-day-picker": "^9.11.1",
    "react-dom": "catalog:",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "catalog:",
    "tailwindcss": "catalog:",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "vite": "catalog:",
    "wouter": "^3.3.5",
    "zod": "catalog:"
  }
}
```

---

## 4. Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;
if (!rawPort) throw new Error("PORT environment variable is required");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

const basePath = process.env.BASE_PATH;
if (!basePath) throw new Error("BASE_PATH environment variable is required");

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({ root: path.resolve(import.meta.dirname, "..") }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true, deny: ["**/.*"] },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
```

### tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "noEmit": true,
    "jsx": "preserve",
    "lib": ["esnext", "dom", "dom.iterable"],
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "types": ["node", "vite/client"],
    "paths": { "@/*": ["./src/*"] }
  },
  "references": [{ "path": "../../lib/api-client-react" }]
}
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Rave'era Group · Concerts & Marketing Agency</title>
    <meta name="description" content="Rave'era Group — full-cycle event agency from Kyiv. Concerts, festivals, conferences, corporate events. 10+ years, 600K+ guests, 100+ events per year." />
    <meta name="theme-color" content="#000000" />
    <meta property="og:title" content="Rave'era Group · Concerts & Marketing Agency" />
    <meta property="og:description" content="Full-cycle event agency from Kyiv. We build events that sell." />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background: #000; }
      body { background: #000; color: #fff; }
      section[id] { scroll-margin-top: 80px; }
      ::selection { background: #00FF88; color: #000; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 5. Source Code

### src/main.tsx
```typescript
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### src/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;600&display=swap');

@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --font-sans: var(--app-font-sans);
  --font-mono: var(--app-font-mono);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --background: 0 0% 0%;
  --foreground: 0 0% 96%;
  --card: 0 0% 3%;
  --card-foreground: 0 0% 96%;
  --popover: 0 0% 4%;
  --popover-foreground: 0 0% 96%;
  --primary: 151 100% 50%;
  --primary-foreground: 0 0% 0%;
  --secondary: 0 0% 8%;
  --secondary-foreground: 0 0% 80%;
  --muted: 0 0% 8%;
  --muted-foreground: 0 0% 40%;
  --accent: 151 100% 50%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 96%;
  --border: 0 0% 8%;
  --input: 0 0% 12%;
  --ring: 151 100% 50%;
  --app-font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --app-font-mono: 'JetBrains Mono', 'Fira Mono', monospace;
  --radius: 0px;
}

@layer base {
  * { @apply border-border; box-sizing: border-box; }
  html { scroll-behavior: smooth; text-rendering: optimizeLegibility; -webkit-text-size-adjust: 100%; }
  body { @apply bg-background text-foreground antialiased; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; font-feature-settings: "kern" 1, "liga" 1, "calt" 1; overflow-x: hidden; }
  img { max-width: 100%; height: auto; display: block; }
  button { cursor: pointer; }
  ::selection { background: #00FF88; color: #000; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #050505; }
  ::-webkit-scrollbar-thumb { background: #00FF8855; border-radius: 0; }
  ::-webkit-scrollbar-thumb:hover { background: #00FF88; }
}

@layer utilities {
  .text-balance { text-wrap: balance; }
  .will-change-transform { will-change: transform; }
}
```

---

## 6. App.tsx (Main Router + HomePage)

The App.tsx file is **1235 lines** and contains:
- The main `HomePage` component with all sections (Hero, Cases, About, RavePass, Services, Trusted By marquee, Team, Contact, Footer)
- Full bilingual translation object `T` with `en` and `uk` keys
- Animation variants (`fadeUp`, `fadeIn`, `stagger`)
- `BrandLine` and `SectionLabel` sub-components
- `Counter` animated number component
- Route definitions for all pages

**Routes:**
- `/` — HomePage (main landing)
- `/event/sbc-summit-ukraine-2026` — SBCEventPage
- `/documents` — DocumentsPage
- `/contacts` — ContactsPage
- `/public-offer` — PublicOfferPage
- `/privacy` — PrivacyPage
- `/returns` — ReturnsPage

### Key Translation Data (from T object):

**English translations include:**
- nav: cases, about, services, team, contact
- hero badge: "Rave'era Group · Concerts & Marketing Agency"
- hero lines: "We Build Events" / "That Sell"
- stats: 10+ years, 600K+ guests, 100+ events/year
- trusted brands: VYAVA, CRYPTO.KARATIST, ZEEKR, MAISON CASTEL, JACK DANIEL'S Old №7, HIKE, SENOR CARTEL, TOOSECCO, LAVAZZA, MUSIC BOX, StudFest, NCrypto 2025, NCrypto Awards, E-Commerce Conf, Parkovy
- 7 case studies with titles, categories, dates, images, descriptions, bullets
- about section with company history
- ravepass ticketing service section
- 12 services with titles, descriptions, tags
- team: Bohdan Chekan (CEO) and Yaroslav (CMO/IT Lead)
- contact: Telegram @bogdan_chekan, email citointrues@gmail.com, phone +38 (093) 430-75-51, location Kyiv
- footer tagline and copyright

**Ukrainian translations** mirror all of the above in Ukrainian.

### HomePage Sections (in order):
1. **Navbar** — sticky with scroll progress bar, mobile hamburger menu, language toggle
2. **Hero** — full-screen with animated green glow orbs, grid pattern overlay, large typography, CTA buttons, stats counter
3. **Cases** — 7 case studies in alternating left/right layout with images, descriptions, bullet points. SBC case has green "Learn More" button linking to event page
4. **About** — company story with 2 images, quote block, stats
5. **RavePass** — ticketing technology showcase with animated visual
6. **Services** — 4x3 grid of 12 service cards with icons
7. **Trusted By** — dual-row infinite scrolling marquee of brand names
8. **Team** — 2 team member cards with photos, roles, descriptions
9. **Contact** — 4 contact method cards (Telegram, Email, Phone, Location) + 2 CTA buttons
10. **Footer** — 3-column layout (brand, menu, contacts) + social icons + copyright

---

## 7. SBCEventPage.tsx (Event Landing Page)

A dedicated landing page for SBC Summit Ukraine 2026 at `/event/sbc-summit-ukraine-2026`.

### Data Constants:
```typescript
const speakers = [
  { name: "Матвій Бідний", role: "Sport Business" },
  { name: "Вадим Гутцайт", role: "Міністр спорту" },
  { name: "Олександр Шовковський", role: "Легенда футболу" },
  { name: "Дар'я Білодід", role: "Олімпійська чемпіонка" },
  { name: "Станіслав Горуна", role: "Олімпійський чемпіон" },
  { name: "Ольга Саладуха", role: "Чемпіонка світу" },
  { name: "Людмила Лузан", role: "Олімпійська призерка" },
  { name: "Ігор Ніконов", role: "Sport Business" },
];

const brands = [
  { name: "Adidas Україна", role: "Технічний партнер" },
  { name: "MEGOGO", role: "Медіа-партнер" },
  { name: "Netpeak", role: "Digital-партнер" },
];

const tickets = [
  {
    key: "sport",
    price: "2 500",
    currency: "грн",
    name: "SPORT",
    desc: "Для спортивних фахівців, клубів, команд і персональної участі.",
    features: [
      "Відвідування конференції та експозони партнерів",
      "Вхід в закриту спільноту Sport&Business Club Україна",
      "Нетворкінг із близько 1500 профільними учасниками",
      "Пакет учасника",
      "Фото/відео звіт з заходу",
    ],
  },
  {
    key: "business",
    price: "6 500",
    currency: "грн",
    name: "BUSINESS",
    desc: "Преміальний формат для керівників, партнерів і бізнес-команд.",
    features: [
      "Доступ у бізнес-lounge та зону спікерів",
      "Ексклюзивний нетворкінг з ключовими представниками",
      "Зона гостинності від партнерів",
      "Пріоритетний вхід на захід",
      "Місця в 1-4 рядах залу",
      "Доступ до презентацій спікерів",
      "Відеозапис заходу",
      "Безкоштовне паркомісце",
    ],
    popular: true,
  },
  {
    key: "online",
    price: "1 000",
    currency: "грн",
    name: "ONLINE",
    desc: "Дистанційний доступ до трансляції та матеріалів конференції.",
    features: [
      "Доступ до онлайн-трансляції конференції",
      "Відеозапис заходу",
    ],
  },
];

const faqs = [
  { q: "Де відбудеться подія?", a: "27 травня 2026 року у КВЦ Парковий за адресою м. Київ, Паркова дорога, 16А." },
  { q: "Як проходить оплата?", a: "Після заповнення форми сайт створює заявку на квиток. Онлайн-оплата буде активована після завершення верифікації мерчанта AlliancePay." },
  { q: "Коли буде доступний квиток?", a: "Квиток відкривається тільки після підтвердженого серверного статусу SUCCESS від AlliancePay." },
  { q: "Які формати квитків доступні?", a: "SPORT за 2500 грн, BUSINESS за 6500 грн та ONLINE за 1000 грн." },
];
```

### Maps URLs:
- Embed: `https://maps.google.com/maps?q=50.4490399,30.5407415&hl=uk&t=m&z=17&output=embed`
- External: `https://www.google.com/maps/place/"Парковий"+Конгресно-виставковий+центр/@50.4490399,30.5407415,17z`

### Page Sections (in order):
1. **Sticky Nav** — back button to home, RAVE'ERA GROUP label, language toggle (UA/EN)
2. **Hero** — event badge, date/time/location pills, large title "SBC Summit Ukraine 2026" (green accent), subtitle, description, CTA buttons (Buy Ticket, View Program), 4 stat cards, event image
3. **About** — event description, 7 expectation bullet points, payment info card with AlliancePay logos (Visa, Mastercard, Apple Pay, Google Pay)
4. **Speakers** — 8 speaker cards in 2x4 grid + 3 brand partner cards
5. **Program** — 4 program bullet points
6. **Tickets** — 3 pricing tiers (SPORT 2500, BUSINESS 6500 popular, ONLINE 1000) with feature lists
7. **Location** — venue info + embedded Google Maps iframe with dark styling
8. **FAQ** — 4-item accordion
9. **Final CTA** — large headline + buy ticket button
10. **Footer** — 4-column layout:
    - Brand: RAVE'ERA GROUP + description
    - Organizer: ФОП Чекан Богдан Орестович, IPN 3411613291, KVED 90.01, address, IBAN
    - Contacts: email, phone, Telegram, support hours (all clickable)
    - Documents: links to /contacts, /public-offer, /privacy, /returns

### Organization Details:
- **Full name**: ФОП Чекан Богдан Орестович
- **Brand**: RAVE'ERA GROUP
- **IPN / RNOKPP**: 3411613291
- **KVED**: 90.01 Театральна та концертна діяльність
- **Address**: Україна, 03022, м. Київ, вул. Здановської Юлії, буд. 49, корп. 10, кв. 306
- **IBAN**: "will be added after bank verification" (буде додано після підтвердження банківських реквізитів)
- **Email**: clionintrue@gmail.com
- **Phone**: +38 (093) 430-75-51
- **Telegram**: @bogdan_chekan
- **Support hours**: Mon-Fri 10:00-19:00 (Пн-Пт 10:00-19:00)

---

## 8. Legal Pages

All legal pages share the same structure:
- Sticky navbar with back button (links to `/`) and language toggle
- Green accent badge with icon
- Large uppercase title
- Organization info block
- Numbered sections with title + paragraph text
- Simple footer with copyright

### DocumentsPage (`/documents`)
- Lists 4 legal documents as clickable cards:
  1. Публічна оферта / Public Offer → `/public-offer`
  2. Політика конфіденційності / Privacy Policy → `/privacy`
  3. Повернення коштів / Refund Policy → `/returns`
  4. Угода користувача / User Agreement → `/public-offer`

### ContactsPage (`/contacts`)
- Contact cards: Email, Phone, Telegram, Support hours
- Address block
- All contact data matches event page footer

### PublicOfferPage (`/public-offer`)
- 8 sections in both languages:
  1. General Provisions
  2. Subject of the Agreement
  3. Payment Procedure
  4. Rights and Obligations
  5. Refund Policy
  6. Changes and Cancellation
  7. Confidentiality
  8. Dispute Resolution

### PrivacyPage (`/privacy`)
- 8 sections in both languages:
  1. General Provisions
  2. Data We Collect
  3. Purpose of Data Processing
  4. Sharing Data with Third Parties
  5. Data Protection
  6. User Rights
  7. Cookies
  8. Policy Changes

### ReturnsPage (`/returns`)
- 6 sections in both languages:
  1. General Conditions
  2. Participant-Initiated Refund
  3. Event Cancellation Refund
  4. Format Change Refund
  5. Non-Refundable Cases
  6. Refund Procedure

---

## 9. Build & Run Instructions

### Environment Variables Required:
```
PORT=3000           # or any available port
BASE_PATH=/         # or your deployment base path
```

### Install Dependencies:
```bash
# If using pnpm workspace (recommended):
pnpm install

# If standalone:
npm install
```

### Development:
```bash
npm run dev
# or
pnpm run dev
```

### Production Build:
```bash
npm run build
# Output goes to dist/public/
```

### Type Check:
```bash
npm run typecheck
```

---

## 10. Key Design Patterns

1. **Color system**: All colors use `white/XX` opacity syntax (Tailwind v4) + `#00FF88` green accent
2. **Borders**: `border-white/[0.06]` for subtle dividers, `border-[#00FF88]/30` for accent borders
3. **Backgrounds**: `bg-white/[0.02]` for cards, `bg-[#0A0A0F]` for page background
4. **Typography**: Large uppercase tracking-tighter headings, small font-mono labels with tracking-widest
5. **Animations**: framer-motion `whileInView` with `staggerChildren`, `fadeUp` variants
6. **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
7. **Green accent usage**: `style={{ color: G }}` or `style={{ background: G }}` where G = "#00FF88"

---

## 11. Assets Required

### Images (must be placed in `public/images/`):
- `about-1.png` — About section image 1
- `about-2.png` — About section image 2
- `case-1.png` — NCrypto Conference case
- `case-2.png` — E-Commerce Conference case
- `case-3.png` — NCrypto Awards case
- `case-music-box.jpg` — Music BOX FEST case
- `case-sbc-summit.jpg` — SBC Summit event hero image
- `case-smart-commerce.jpg` — SMART COMMERCE FORUM case
- `case-zeekr.jpg` — Zeekr 9X launch case
- `payment-alliancepay.png` — AlliancePay logo
- `payment-applepay.png` — Apple Pay logo
- `payment-googlepay.png` — Google Pay logo
- `payment-mastercard.png` — Mastercard logo
- `payment-visa.png` — Visa logo
- `team-1.png`, `team-2.png`, `team-3.png` — Team section decorative images
- `team-bogdan.jpg` — Bohdan Chekan photo
- `team-yaroslav.jpg` — Yaroslav photo

### Other public files:
- `favicon.svg` — Site favicon
- `opengraph.jpg` — OpenGraph social image
- `raveera-style-pack.md` — Style guide documentation

---

## 12. Home.tsx (Alternative/Old Home Page)

There is also a `home.tsx` file that contains an older version of the homepage with a simpler design. It is NOT used in the current App.tsx routing — the HomePage component is defined inline in App.tsx. The `home.tsx` can be ignored or used as a reference.

---

## 13. Not Found Page

`not-found.tsx` — a simple 404 page component.

---

## 14. How to Recreate This Project

1. Create a new Vite + React + TypeScript project
2. Install all dependencies listed in section 3
3. Copy all configuration files from section 4
4. Copy the CSS from `src/index.css`
5. Create all page components (the main work):
   - Copy App.tsx (1235 lines) — this is the largest file containing the entire homepage
   - Copy SBCEventPage.tsx (780 lines) — the event landing page
   - Copy the 5 legal pages (each ~100 lines)
   - Copy main.tsx and lib/utils.ts
6. Place all images in `public/images/`
7. Run `npm run dev` to start

The two most important files are:
- **App.tsx** (1235 lines) — main landing page + router
- **SBCEventPage.tsx** (780 lines) — event landing page

All other files are either configuration, small utilities, or the shadcn/ui component library.
