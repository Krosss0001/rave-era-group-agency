# Rave'era Group Website — Complete Project Documentation

## Для GPT / ChatGPT / Claude

**Задача**: Пересоздай этот проект от нуля и задеплой на домен `http://redo.ua/`.

---

## 1) Технологический стек

- **Фреймворк**: Vite 6 + React 18 + TypeScript
- **Стили**: Tailwind CSS v4 (`@import "tailwindcss"` — новый синтаксис, не `tailwind.config.js`)
- **Анимации**: framer-motion
- **Иконки**: lucide-react
- **Шрифты**: Inter (300–900) + JetBrains Mono (400, 600)

---

## 2) Структура проекта

```
raveera-website/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx          ← ГЛАВНЫЙ КОМПОНЕНТ (всё в одном файле)
    └── index.css        ← ГЛОБАЛЬНЫЕ СТИЛИ
```

---

## 3) Файл `package.json`

```json
{
  "name": "raveera-website",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --config vite.config.ts --host 0.0.0.0",
    "build": "vite build --config vite.config.ts",
    "serve": "vite preview --config vite.config.ts --host 0.0.0.0",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.469.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

---

## 4) Файл `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
```

---

## 5) Файл `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

---

## 6) Файл `src/main.tsx`

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

---

## 7) Файл `index.html`

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

---

## 8) Файл `src/index.css` — ГЛОБАЛЬНЫЕ СТИЛИ

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

## 9) Файл `src/App.tsx` — ГЛАВНЫЙ КОМПОНЕНТ

**1164 строки** — все секции лендинга в одном файле.

### Импорты

```tsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, ChevronDown, Menu, X, Globe,
  MapPin, Mail, MessageCircle, Phone, Zap, Building2,
  Monitor, Users, LayoutGrid, CalendarDays, Mic2,
  Coffee, DollarSign, Newspaper, Ticket, Sparkles,
} from "lucide-react";

type Lang = "en" | "uk";
```

### Анимационные варианты (глобальные)

```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
```

### Собственные подкомпоненты

```tsx
const G = "#00FF88";

function BrandLine({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  if (compact) return <span className={className}>Rave<span style={{ color: G }}>'</span>era Group</span>;
  return (
    <span className={className}>
      Rave<span style={{ color: G }}>'</span>era Group <span style={{ color: G }}>·</span> Concerts <span style={{ color: G }}>&amp;</span> Marketing Agency
    </span>
  );
}

function SectionLabel({ idx, sub }: { idx: string; sub: string }) {
  return (
    <motion.div variants={fadeIn} className="flex items-center gap-3 mb-5">
      <span className="text-[10px] font-mono text-white/20 tracking-widest">{idx}.</span>
      <span className="w-5 h-px bg-white/10" />
      <span className="text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color: G }}>{sub}</span>
    </motion.div>
  );
}

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 55, damping: 18 });
  const [val, setVal] = useState(0);
  useEffect(() => { if (inView) mv.set(target); }, [inView, mv, target]);
  useEffect(() => spring.on("change", (v) => setVal(Math.round(v))), [spring]);
  return <span ref={ref}>{val}{suffix}</span>;
}
```

### Иконки сервисов (12 штук)

```tsx
const SVC_ICONS = [
  <Zap className="w-5 h-5" />, <Building2 className="w-5 h-5" />, <Monitor className="w-5 h-5" />,
  <Users className="w-5 h-5" />, <LayoutGrid className="w-5 h-5" />, <CalendarDays className="w-5 h-5" />,
  <Mic2 className="w-5 h-5" />, <Coffee className="w-5 h-5" />, <DollarSign className="w-5 h-5" />,
  <Newspaper className="w-5 h-5" />, <Ticket className="w-5 h-5" />, <Sparkles className="w-5 h-5" />,
];
```

### Контент / Переводы

**2 языка: EN + UK (украинский)**.
Все текст лендинга живёт в объекте `T`.

**Разделы**: hero, stats, trusted, cases (6 items), about, ravepass, services (12 items), team (2 members), contact, footer.

**Hero EN**: "We Build Events" / "That Sell", sub "Conferences · Festivals · Corporate Events"
**Hero UK**: "Ми Будуємо Події," / "Які Продають", sub "Конференції · Фестивалі · Корпоративні заходи"

**Cases**: SBC Summit Ukraine 2026, Zeekr 9X Launch, Smart Commerce Forum, Music Box Fest, NCrypto Conf 2025, E-Commerce Conf 2025, NCrypto Awards 2025.

**Services**: Concept & Strategy, Venue Selection, Full Technical Production, Team & Staff, Expo Zone & Design, Event Program, Artists & Hosts, Catering & Service, Sponsors & Partners, PR & Media, Ticketing & Analytics, Activities & Wow Effects.

**Team**: Bohdan Chekan (CEO), Yaroslav (CMO, IT Lead).

---

### App component — структура секций

```tsx
export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const tr = T[lang];

  const { scrollY, scrollYProgress } = useScroll();
  useEffect(() => scrollY.on("change", (v) => setNavScrolled(v > 50)), [scrollY]);
  useEffect(() => { document.documentElement.lang = lang === "uk" ? "uk" : "en"; }, [lang]);

  // IntersectionObserver для активной секции в навигации
  useEffect(() => {
    const ids = ["hero", "cases", "about", "ravepass", "services", "team", "contact"];
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { threshold: 0.25 }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const heroY = useTransform(scrollY, [0, 600], [0, -90]);
  const heroOp = useTransform(scrollY, [0, 500], [1, 0]);
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  const toggleLang = () => setLang((l) => (l === "en" ? "uk" : "en"));
  const navLinks = (["cases", "about", "services", "team"] as const);

  return (
    <div className="bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ПРОГРЕСС-БАР СКРОЛЛА — тонкая зелёная линия сверху */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
                  style={{ scaleX: scrollYProgress, background: G }} />

      {/* НАВИГАЦИЯ — fixed, с blur при скролле */}
      <motion.header ...>
        {/* Логотип BrandLine, ссылки cases/about/services/team, Contact button, UA/EN toggle, mobile menu */}
      </motion.header>

      {/* HERO — h-screen, parallax, grid bg, glow blobs, badge, H1 "We Build Events / That Sell", stats counter */}
      <section id="hero" className="relative h-screen min-h-[680px] flex flex-col justify-center px-6 md:px-12 overflow-hidden">
        {/* Пульсирующий badge, анимация H1, subtitle, CTA кнопки, stats с Counter */}
      </section>

      {/* CASES — 6 кейсов с чередованием картинка/текст, grayscale images */}
      <section id="cases" className="py-24 md:py-36 px-6 md:px-12">...</section>

      {/* ABOUT — две колонки: текст + картинки, цитата с декоративной кавычкой */}
      <section id="about" className="py-24 md:py-36 px-6 md:px-12 bg-[#030303]">...</section>

      {/* RAVEPASS — влево текст, справа карточка с grid+brackets+QR+glow */}
      <section id="ravepass" className="py-24 md:py-32 px-6 md:px-12">...</section>

      {/* SERVICES — 12 карточек 4x3, номера 01-12 */}
      <section id="services" className="py-24 md:py-36 px-6 md:px-12 bg-[#030303]">...</section>

      {/* TRUSTED BY — две строки marquee с логотипами партнёров */}
      <section className="py-14 md:py-20 border-y border-white/[0.06] bg-[#020202]">...</section>

      {/* TEAM — 2 карточки команды с grayscale → color hover */}
      <section id="team" className="py-24 md:py-36 px-6 md:px-12">...</section>

      {/* CONTACT — 4 контактные карточки + Telegram CTA */}
      <section id="contact" className="py-24 md:py-36 px-6 md:px-12">...</section>

      {/* FOOTER — 3 колонки: BrandLine, Menu links, Contacts+social icons */}
      <footer className="py-12 px-6 md:px-12 border-t border-white/[0.05] bg-[#020202]">...</footer>

    </div>
  );
}
```

---

## 10) Ассеты / изображения

Все изображения лежат в `public/images/` и `public/`:

| Файл | Размер | Описание |
|---|---|---|
| `case-zeekr.jpg` | — | Фото презентации автомобиля Zeekr 9X на мероприятии |
| `case-smart-commerce.jpg` | — | Лого/brand Smart Commerce Forum на тёмном фоне |
| `case-music-box.jpg` | — | Лого Music Box Fest на тёмном фоне |
| `case-1.png` | — | Скриншот / постер NCrypto Conference 2025 |
| `case-2.png` | — | Скриншот E-Commerce Conference 2025 |
| `case-3.png` | — | Скриншот NCrypto Awards 2025 |
| `about-1.png` | square | Фото с мероприятия (подборка репортажных фото) |
| `about-2.png` | 4:5 | Фото с мероприятия (portrait) |
| `team-bogdan.jpg` | portrait | Фото соундера команды — мужчина |
| `team-yaroslav.jpg` | portrait | Фото соундера команды — мужчина |
| `team-1.png` | portrait | Фото участника мероприятия |
| `team-2.png` | portrait | Фото участника |
| `team-3.png` | portrait | Фото участника |
| `favicon.svg` | — | SVG favicon (можно сделать простую зелёную точку) |
| `opengraph.jpg` | 1200x630 | OG image (можно сгенерировать из скриншота hero) |

---

## 11) Сборка и деплой на redo.ua

### Шаг 1: Создай проект

```bash
npm create vite@latest redo-site -- --template react-ts
cd redo-site
npm install framer-motion lucide-react
npm install -D tailwindcss @tailwindcss/vite tw-animate-css
```

### Шаг 2: Настрой `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist", emptyOutDir: true },
  server: { host: "0.0.0.0", allowedHosts: true },
});
```

### Шаг 3: Замени файлы

Помести содержимое этого документа в:
- `src/App.tsx` — главный компонент
- `src/index.css` — глобальные стили
- `src/main.tsx` — точка входа
- `index.html` — HTML шаблон
- `vite.config.ts` — конфиг Vite
- `tsconfig.json` — конфиг TypeScript
- `package.json` — зависимости

### Шаг 4: Ассеты

Создай папку `public/images/` и помести туда изображения. 
Если изображений нет — создай placeholder-картинки по описанию из раздела 10.

### Шаг 5: Сборка

```bash
npm run build
```

Результат — папка `dist/` с статическими файлами.

### Шаг 6: Деплой на redo.ua

**Вариант A — Netlify / Vercel / Cloudflare Pages:**
Загрузи папку `dist/` на хостинг. Настрой CNAME/DNS на redo.ua у провайдера.

**Вариант B — VPS / свой сервер:**
```bash
# Установка nginx
sudo apt update && sudo apt install nginx
# Копирование dist/
sudo cp -r dist/* /var/www/redo.ua/
# Настройка nginx на redo.ua
sudo nano /etc/nginx/sites-available/redo.ua
```

nginx config:
```nginx
server {
    listen 80;
    server_name redo.ua www.redo.ua;
    root /var/www/redo.ua;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    # SSL через Let's Encrypt
}
```

```bash
sudo ln -s /etc/nginx/sites-available/redo.ua /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Вариант C — GitHub Pages:**
Залей в репозиторий, включи GitHub Pages для ветки `gh-pages`, затем настрой DNS на redo.ua.

---

## 12) Примечания по переносу

### Что может отличаться от этого проекта:

1. **Язык**: если тебе не нужен украинский — убери объект `uk` из `T` и упрости переключение языка.
2. **Контент**: замени все текстовые поля в `T` на свой продукт.
3. **Бренд**: замени `BrandLine` на своё название. Можно оставить тот же зелёный цвет или поменять.
4. **Секции**: добавь/убери секции по необходимости.
5. **Регион**: если redo.ua — это Украина, то добавь украинский язык в <html lang="uk">.
