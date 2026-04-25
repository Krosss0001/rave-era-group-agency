# Rave'era Style Pack

Полный пакет стиля для копирования в другой проект.

## 1) Цвета

### Base
- `#000000` — основной фон
- `#020202` — тёмный фон 1
- `#030303` — тёмный фон 2
- `#040404` — карточный фон
- `#080808` — глубокий карточный фон
- `#FFFFFF` — основной текст
- `#00FF88` — главный акцент

### White opacity
- `text-white/80` — сильный подзаголовок
- `text-white/65` — цитаты
- `text-white/55` — описания кейсов
- `text-white/45` — body / hero subtitle
- `text-white/35` — карточки
- `text-white/30` — подписи
- `text-white/25` — декоративные подписи
- `text-white/20` — footer labels
- `text-white/15` — micro text

### Green opacity
- `#00FF88` — чистый акцент
- `#00FF8890` — glow текста
- `#00FF8850` / `#00FF8840` — активные border / glow
- `#00FF8830` — hover border
- `#00FF8810` — hover tint
- `#00FF8808` / `#00FF8806` / `#00FF8805` — badge tint

## 2) Шрифты

### Inter
- Использование: весь основной UI
- Веса: `300, 400, 500, 600, 700, 800, 900`

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

### JetBrains Mono
- Использование: индексы, метки, технический текст, footer copy
- Веса: `400, 600`

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

## 3) Типографика

- Hero H1: `clamp(3rem, 9.5vw, 10.5rem)` + `font-black` + `leading-[0.86]`
- Section H2: `text-4xl md:text-6xl lg:text-7xl` + `font-black`
- Card title: `text-2xl md:text-3xl` + `font-black`
- Body large: `text-base md:text-lg` + `font-light`
- Body: `text-sm`
- Body small: `text-xs`
- Mono label: `text-[10px] font-mono uppercase tracking-[0.2em..0.24em]`

## 4) Layout

### Container
```tsx
<div className="max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
```

### Section spacing
```tsx
<section className="py-24 md:py-36">
```

### Breakpoints
- default: mobile
- `sm`: big phone
- `md`: tablet
- `lg`: laptop
- `xl`: desktop
- `2xl`: TV / large monitor

## 5) Core component patterns

### BrandLine
```tsx
const G = "#00FF88";

function BrandLine({ compact = false }) {
  if (compact) {
    return <span>Rave<span style={{ color: G }}>'</span>era Group</span>;
  }
  return (
    <span>
      Rave<span style={{ color: G }}>'</span>era Group{" "}
      <span style={{ color: G }}>·</span> Concerts{" "}
      <span style={{ color: G }}>&amp;</span> Marketing Agency
    </span>
  );
}
```

### CTA button
```tsx
<button
  className="group relative overflow-hidden px-8 py-4 font-bold text-sm uppercase tracking-widest text-black"
  style={{ background: G }}
>
  <span className="relative z-10 flex items-center gap-2">
    Discuss your project
  </span>
</button>
```

### Section label
```tsx
<div className="flex items-center gap-3 mb-5">
  <span className="text-[10px] font-mono text-white/20 tracking-widest">01.</span>
  <span className="w-5 h-px bg-white/10" />
  <span className="text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color: G }}>
    Featured Cases
  </span>
</div>
```

### Card hover style
```tsx
<div className="group relative border border-white/[0.05] p-6 hover:border-[#00FF88]/30 transition-all duration-400 overflow-hidden cursor-default bg-black/20 hover:bg-[#00FF88]/[0.02]">
```

## 6) Motion

### Easing
```tsx
[0.16, 1, 0.3, 1]
```

### Common variants
```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
```

### Marquee
```tsx
<motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} />
```

## 7) Decorative effects

- subtle grid background: `rgba(255,255,255,0.018)` lines, `80px 80px`
- green grid card background: `#00FF8818`, `32px 32px`
- glow blobs: blurred green circles with low opacity
- corner brackets: 4 thin green corners
- text shadow glow: `0 0 100px #00FF8845`
- icon drop shadow: `drop-shadow(0 0 24px #00FF88)`

## 8) Responsive rules

- header uses compact brand on small screens
- grids collapse to 1 column on phones
- cards use `sm:grid-cols-2`, `lg:grid-cols-4` where needed
- hero title scales with `clamp()`
- padding always follows `px-4 sm:px-6 md:px-10 lg:px-12`
- section spacing stays `py-24 md:py-36`

## 9) Global CSS starter
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
@import "tailwindcss";

:root {
  --background: 0 0% 0%;
  --foreground: 0 0% 96%;
  --primary: 151 100% 50%;
  --radius: 0px;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  background: #000;
}

body {
  background: #000;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  overflow-x: hidden;
}

section[id] { scroll-margin-top: 80px; }
::selection { background: #00FF88; color: #000; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: #050505; }
::-webkit-scrollbar-thumb { background: #00FF8855; }
::-webkit-scrollbar-thumb:hover { background: #00FF88; }
```

## 10) Copy checklist
- black background
- white opacity hierarchy
- neon green only for key accents
- Inter 900 for hero and section titles
- JetBrains Mono for labels
- no rounded corners
- grid texture
- glow blobs
- marquee
- scroll progress bar
- green apostrophe, dot, ampersand in brand

## 11) Files in this project
- `artifacts/raveera-website/src/App.tsx`
- `artifacts/raveera-website/src/index.css`
- `artifacts/raveera-website/index.html`
- `artifacts/raveera-website/public/images/`
