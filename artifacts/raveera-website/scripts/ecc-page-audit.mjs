import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const executablePath =
  process.env.BROWSER_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440];
const eccPath = "/event/e-commerce-conference-2026";
const expectedTicketTypes = ["online", "standard", "vip", "corporate"];
const expectedTopics = {
  UA: [
    ["ai", "AI"],
    ["automation", "Автоматизація"],
    ["google-ads", "Google Ads"],
    ["google-shopping", "Google Shopping"],
    ["facebook-ads", "Facebook Ads"],
    ["meta", "Meta"],
    ["tiktok", "TikTok"],
    ["product-business", "Товарний бізнес"],
    ["arbitrage", "Арбітраж"],
    ["marketplaces", "Маркетплейси"],
    ["amazon", "Amazon"],
    ["dropshipping", "Дропшипінг"],
    ["prom", "Prom"],
    ["shopify", "Shopify"],
    ["online-stores", "Інтернет-магазини"],
    ["woocommerce", "WooCommerce"],
    ["cross-border-sales", "Продажі за кордон"],
    ["dollar-revenue", "Заробіток у доларах"],
    ["export", "Експорт"],
    ["ugc-content", "UGC-контент"],
    ["influencers", "Інфлюенсери"],
    ["creatives", "Креативи"],
    ["reels", "Reels"],
    ["sales-funnels", "Воронки продажів"],
    ["lead-generation", "Лідогенерація"],
    ["crm", "CRM"],
    ["legal", "Юристи"],
    ["accounting", "Бухгалтерія"],
    ["systematization", "Систематизація"],
    ["ltv", "LTV"],
    ["experts", "Експерти"],
    ["networking", "Нетворкінг"],
    ["scaling", "Масштабування"],
    ["retention", "Retention"],
    ["call-center", "Call-центр"],
    ["logistics", "Логістика"],
    ["china-sourcing", "Замовлення з Китаю"],
    ["warehouse", "Склад"],
    ["margin", "Маржинальність"],
  ],
  EN: [
    ["ai", "AI"],
    ["automation", "Automation"],
    ["google-ads", "Google Ads"],
    ["google-shopping", "Google Shopping"],
    ["facebook-ads", "Facebook Ads"],
    ["meta", "Meta"],
    ["tiktok", "TikTok"],
    ["product-business", "Product Business"],
    ["arbitrage", "Arbitrage"],
    ["marketplaces", "Marketplaces"],
    ["amazon", "Amazon"],
    ["dropshipping", "Dropshipping"],
    ["prom", "Prom"],
    ["shopify", "Shopify"],
    ["online-stores", "Online Stores"],
    ["woocommerce", "WooCommerce"],
    ["cross-border-sales", "Cross-border Sales"],
    ["dollar-revenue", "Dollar Revenue"],
    ["export", "Export"],
    ["ugc-content", "UGC Content"],
    ["influencers", "Influencers"],
    ["creatives", "Creatives"],
    ["reels", "Reels"],
    ["sales-funnels", "Sales Funnels"],
    ["lead-generation", "Lead Generation"],
    ["crm", "CRM"],
    ["legal", "Legal"],
    ["accounting", "Accounting"],
    ["systematization", "Systematization"],
    ["ltv", "LTV"],
    ["experts", "Experts"],
    ["networking", "Networking"],
    ["scaling", "Scaling"],
    ["retention", "Retention"],
    ["call-center", "Call Center"],
    ["logistics", "Logistics"],
    ["china-sourcing", "China Sourcing"],
    ["warehouse", "Warehouse"],
    ["margin", "Margin"],
  ],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function revealPage(page) {
  await page.evaluate(async () => {
    const landmarks = [...document.querySelectorAll("header, main > section, footer")];
    for (const landmark of landmarks) {
      landmark.scrollIntoView({ block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
    window.scrollTo(0, 0);
  });
  await page.locator('[data-qa="ecc-ticket-card"]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator('button[aria-controls^="ecc-faq-answer-"]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
}

async function assertVisibleContent(page, width, language) {
  const result = await page.evaluate(() => {
    const visibleText = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return "";
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0
        ? ""
        : element.textContent?.trim() || "";
    };

    return {
      hero: visibleText("h1"),
      ticketsTitle: visibleText('[data-qa="ecc-ticket-card"]'),
      ticketCards: document.querySelectorAll('[data-qa="ecc-ticket-card"]').length,
      ticketCardText: [...document.querySelectorAll('[data-qa="ecc-ticket-card"]')].map((card) => card.textContent?.trim() || ""),
      ticketFeatures: document.querySelectorAll('[data-qa="ecc-ticket-feature"]').length,
      leaderCards: document.querySelectorAll('[data-qa="ecc-leader-card"]').length,
      speakersTitle: visibleText('[data-qa="ecc-speakers-title"]'),
      speakerCards: document.querySelectorAll('[data-qa="ecc-speaker-card"]').length,
      speakerPlaceholders: document.querySelectorAll('[data-qa="ecc-speaker-placeholder"]').length,
      speakerNames: [...document.querySelectorAll('[data-qa="ecc-speaker-card"] p:first-of-type')].map((name) => name.textContent?.trim() || ""),
      speakerImages: [...document.querySelectorAll('[data-qa="ecc-speaker-card"] img')].map((image) => ({
        src: image.getAttribute("src") || "",
        loading: image.getAttribute("loading") || "",
        decoding: image.getAttribute("decoding") || "",
        className: image.className,
      })),
      conferencePartnersTitle: visibleText('[data-qa="ecc-conference-partners-title"]'),
      conferencePartnerCards: document.querySelectorAll('[data-qa="ecc-conference-partner-card"]').length,
      conferencePartnerPlaceholders: document.querySelectorAll('[data-qa="ecc-conference-partner-placeholder"]').length,
      conferencePartnerImages: [...document.querySelectorAll('[data-qa="ecc-conference-partner-card"] img')].map((image) => ({
        src: image.getAttribute("src") || "",
        loading: image.getAttribute("loading") || "",
        decoding: image.getAttribute("decoding") || "",
        className: image.className,
      })),
      conferencePartnerHref: document.querySelector('[data-qa="ecc-conference-partners-link"]')?.getAttribute("href") || "",
      mediaPartnersTitle: visibleText('[data-qa="ecc-media-partners-title"]'),
      mediaPartnerCards: document.querySelectorAll('[data-qa="ecc-media-partner-card"]').length,
      mediaPartnerPlaceholders: document.querySelectorAll('[data-qa="ecc-media-partner-placeholder"]').length,
      mediaPartnerImages: [...document.querySelectorAll('[data-qa="ecc-media-partner-card"] img')].map((image) => ({
        src: image.getAttribute("src") || "",
        alt: image.getAttribute("alt") || "",
        loading: image.getAttribute("loading") || "",
        decoding: image.getAttribute("decoding") || "",
        className: image.className,
      })),
      programPreviewTitle: visibleText('[data-qa="ecc-program-preview-title"]'),
      programPreviewBadge: visibleText('[data-qa="ecc-program-preview-badge"]'),
      programPreviewRows: document.querySelectorAll('[data-qa="ecc-program-preview-row"]').length,
      programPreviewHref: document.querySelector('[data-qa="ecc-program-preview-cta"]')?.getAttribute("href") || "",
      topicChips: [...document.querySelectorAll('[data-qa="ecc-topic-chip"]')].map((chip) => ({
        id: chip.getAttribute("data-topic-id") || "",
        label: chip.textContent?.trim() || "",
        tagName: chip.tagName,
      })),
      marqueeTracks: document.querySelectorAll('[data-qa="ecc-topics-marquee-track"]').length,
      marqueeSegments: document.querySelectorAll('[data-qa="ecc-topics-marquee-segment"]').length,
      marqueeReducedMotion: document.querySelector('[data-qa="ecc-topics-marquee"]')?.getAttribute("data-reduced-motion") || "",
      partnerTitle: visibleText('[data-qa="ecc-partner-cta"] h2'),
      partnerBenefits: [...document.querySelectorAll('[data-qa="ecc-partner-benefit"]')].map((benefit) => benefit.textContent?.trim() || ""),
      partnerHref: document.querySelector('[data-qa="ecc-partner-link"]')?.getAttribute("href") || "",
      heroImage: {
        currentSrc: document.querySelector('[data-qa="ecc-hero-image"]')?.currentSrc || "",
        loading: document.querySelector('[data-qa="ecc-hero-image"]')?.getAttribute("loading") || "",
        decoding: document.querySelector('[data-qa="ecc-hero-image"]')?.getAttribute("decoding") || "",
        fetchPriority: document.querySelector('[data-qa="ecc-hero-image"]')?.getAttribute("fetchpriority") || "",
      },
      partnerImage: {
        src: document.querySelector('[data-qa="ecc-partner-image"]')?.getAttribute("src") || "",
        currentSrc: document.querySelector('[data-qa="ecc-partner-image"]')?.currentSrc || "",
        loading: document.querySelector('[data-qa="ecc-partner-image"]')?.getAttribute("loading") || "",
        decoding: document.querySelector('[data-qa="ecc-partner-image"]')?.getAttribute("decoding") || "",
      },
      partnerBadges: [
        visibleText('[data-qa="ecc-partner-expo-badge"]'),
        visibleText('[data-qa="ecc-partner-zone-badge"]'),
      ],
      ticketCardPositions: [...document.querySelectorAll('[data-qa="ecc-ticket-card"]')].map((card) => {
        const rect = card.getBoundingClientRect();
        return { left: Math.round(rect.left), top: Math.round(rect.top) };
      }),
      partnerBeforeTickets: Boolean(
        document.querySelector('[data-qa="ecc-partner-cta"]')?.compareDocumentPosition(
          document.querySelector('[data-qa="ecc-ticket-card"]'),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      programItems: document.querySelectorAll('[data-qa="ecc-program-item"]').length,
      faqItems: document.querySelectorAll('button[aria-controls^="ecc-faq-answer-"]').length,
      faq: visibleText('button[aria-controls^="ecc-faq-answer-"]'),
      footer: visibleText("footer"),
      location: visibleText("iframe[title]") || document.querySelector('iframe[title]')?.getAttribute("title") || "",
      mapSrc: document.querySelector("iframe")?.getAttribute("src") || "",
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      mapHref: document.querySelector('a[href="https://maps.app.goo.gl/bih3ZUsmSrxpcbjW6"]')?.getAttribute("href") || "",
      legalHrefs: [...document.querySelectorAll("footer a")].map((link) => link.getAttribute("href")).filter(Boolean),
      ticketLinks: [...document.querySelectorAll('a[href*="/event/e-commerce-conference-2026/ticket-form?type="]')]
        .map((link) => link.getAttribute("href"))
        .filter(Boolean),
    };
  });

  assert(result.hero.includes("E-COMMERCE CONFERENCE 2026"), `${width}px ${language}: hero text missing`);
  assert(result.ticketCards === 4, `${width}px ${language}: expected 4 ticket cards, found ${result.ticketCards}`);
  for (const price of ["1 500", "2 100", "5 500"]) {
    assert(result.ticketCardText.some((text) => text.includes(price)), `${width}px ${language}: missing ECC price ${price}`);
  }
  assert(result.ticketCardText.every((text) => !text.includes("1 800") && !text.includes("4 000")), `${width}px ${language}: stale ECC price displayed`);
  assert(result.ticketFeatures === 21, `${width}px ${language}: expected 21 ticket benefits, found ${result.ticketFeatures}`);
  assert(result.leaderCards === 8, `${width}px ${language}: expected 8 market leader cards, found ${result.leaderCards}`);
  assert(result.speakerCards === 6, `${width}px ${language}: expected 6 speaker cards, found ${result.speakerCards}`);
  assert(result.speakerPlaceholders === 2, `${width}px ${language}: expected 2 speaker placeholders, found ${result.speakerPlaceholders}`);
  assert(result.speakerImages.length === 6, `${width}px ${language}: expected 6 speaker images, found ${result.speakerImages.length}`);
  assert(result.speakerNames.includes("Артем Степанчук"), `${width}px ${language}: Artem Stepanchuk is missing`);
  for (const imagePath of ["andrii-hadai.jpg", "daniel-vibe.jpg", "denys-volosov.jpg", "maksym-shchekov.jpg", "artur-booster.png", "artem-stepanchuk.jpg"]) {
    const image = result.speakerImages.find(({ src }) => src.endsWith(`/images/speakers/${imagePath}`));
    assert(image, `${width}px ${language}: missing speaker image ${imagePath}`);
    assert(image.loading === "lazy" && image.decoding === "async", `${width}px ${language}: speaker image loading attributes mismatch`);
    assert(image.className.includes("object-cover") && image.className.includes("object-center"), `${width}px ${language}: speaker image fit mismatch`);
  }
  assert(result.conferencePartnerCards === 8, `${width}px ${language}: expected 8 conference partners, found ${result.conferencePartnerCards}`);
  assert(result.conferencePartnerPlaceholders === 4, `${width}px ${language}: expected 4 conference partner placeholders, found ${result.conferencePartnerPlaceholders}`);
  assert(result.conferencePartnerImages.length === 8, `${width}px ${language}: expected 8 partner logos, found ${result.conferencePartnerImages.length}`);
  for (const imagePath of ["lemon-drop.png", "keycrm.png", "keep-call.png", "pricer24.png", "ravepass.png", "business-club.png", "tv7-studio.png", "infovision.png"]) {
    const image = result.conferencePartnerImages.find(({ src }) => src.endsWith(`/images/partners/${imagePath}`));
    assert(image, `${width}px ${language}: missing partner logo ${imagePath}`);
    assert(image.loading === "lazy" && image.decoding === "async", `${width}px ${language}: partner logo loading attributes mismatch`);
    assert(image.className.includes("object-contain"), `${width}px ${language}: partner logo fit mismatch`);
  }
  assert(result.mediaPartnerCards === 3, `${width}px ${language}: expected 3 media partners, found ${result.mediaPartnerCards}`);
  assert(result.mediaPartnerPlaceholders === 5, `${width}px ${language}: expected 5 media partner placeholders, found ${result.mediaPartnerPlaceholders}`);
  assert(result.mediaPartnerImages.length === 3, `${width}px ${language}: expected 3 media partner logos, found ${result.mediaPartnerImages.length}`);
  assert(result.programPreviewTitle === (language === "UA" ? "Програма заходу" : "Event Program"), `${width}px ${language}: program preview title mismatch`);
  assert(result.programPreviewBadge === (language === "UA" ? "Програма формується" : "Program is being formed"), `${width}px ${language}: program preview badge mismatch`);
  assert(result.programPreviewRows === 4, `${width}px ${language}: expected four program preview rows`);
  assert(result.programPreviewHref === "/event/e-commerce-conference-2026/ticket-form?type=standard", `${width}px ${language}: program preview CTA mismatch`);
  for (const [imagePath, alt] of [["kontora22.png", "kontora22"], ["moderno.png", "MODERNO Web Development"], ["booster.png", "BOOSTER"]]) {
    const image = result.mediaPartnerImages.find(({ src }) => src.endsWith(`/images/media/${imagePath}`));
    assert(image, `${width}px ${language}: missing media logo ${imagePath}`);
    assert(image.alt === alt, `${width}px ${language}: media logo alt text mismatch for ${imagePath}`);
    assert(image.loading === "lazy" && image.decoding === "async", `${width}px ${language}: media logo loading attributes mismatch`);
    assert(image.className.includes("object-contain"), `${width}px ${language}: media logo fit mismatch`);
  }
  assert(result.conferencePartnerHref === "https://t.me/bogdan_chekan", `${width}px ${language}: conference partner CTA link mismatch`);
  assert(result.speakersTitle === (language === "UA" ? "Експерти конференції" : "Conference Experts"), `${width}px ${language}: speakers localization mismatch`);
  assert(result.conferencePartnersTitle === (language === "UA" ? "Партнери конференції" : "Conference Partners"), `${width}px ${language}: conference partners localization mismatch`);
  assert(result.mediaPartnersTitle === (language === "UA" ? "Медіа партнери" : "Media Partners"), `${width}px ${language}: media partners localization mismatch`);
  assert(result.topicChips.length === 39, `${width}px ${language}: expected 39 topic chips, found ${result.topicChips.length}`);
  assert(
    JSON.stringify(result.topicChips.map(({ id, label }) => [id, label])) === JSON.stringify(expectedTopics[language]),
    `${width}px ${language}: topic IDs, labels, or order mismatch`,
  );
  assert(result.topicChips.every(({ tagName }) => tagName === "SPAN"), `${width}px ${language}: topic chips must render as spans`);
  assert(result.topicChips.every(({ label }) => label.length > 0), `${width}px ${language}: topic text disappeared`);
  assert(result.marqueeTracks === 2, `${width}px ${language}: expected two marquee tracks, found ${result.marqueeTracks}`);
  assert(result.marqueeSegments === 8, `${width}px ${language}: expected eight marquee segments, found ${result.marqueeSegments}`);
  assert(result.marqueeReducedMotion === "false", `${width}px ${language}: animated marquee unexpectedly disabled`);
  assert(
    result.partnerTitle === (language === "UA" ? "Як стати партнером конференції?" : "How to become a conference partner?"),
    `${width}px ${language}: partner CTA title mismatch (${JSON.stringify(result.partnerTitle)})`,
  );
  assert(result.partnerBenefits.length === 4, `${width}px ${language}: expected four partner benefits`);
  assert(
    JSON.stringify(result.partnerBenefits) === JSON.stringify(
      language === "UA"
        ? ["Експо-зона", "Брендинг", "Лідогенерація", "Нетворкінг"]
        : ["Expo zone", "Branding", "Lead generation", "Networking"],
    ),
    `${width}px ${language}: partner benefits mismatch`,
  );
  assert(
    result.partnerHref === "https://t.me/bogdan_chekan",
    `${width}px ${language}: partner CTA link mismatch`,
  );
  assert(result.heroImage.loading === "eager", `${width}px ${language}: hero image must load eagerly`);
  assert(result.heroImage.decoding === "async", `${width}px ${language}: hero image must decode asynchronously`);
  assert(result.heroImage.fetchPriority === "high", `${width}px ${language}: hero image fetch priority mismatch`);
  assert(
    result.heroImage.currentSrc.endsWith("/images/ecommerce-conference-2026-poster.webp"),
    `${width}px ${language}: hero did not select optimized WebP`,
  );
  assert(result.partnerImage.loading === "lazy", `${width}px ${language}: partner image must lazy load`);
  assert(result.partnerImage.decoding === "async", `${width}px ${language}: partner image must decode asynchronously`);
  assert(
    result.partnerImage.src === "/images/ecommerce-partnership-expo-2026.png",
    `${width}px ${language}: partnership image source mismatch`,
  );
  assert(
    result.partnerImage.currentSrc.endsWith("/images/ecommerce-partnership-expo-2026.webp"),
    `${width}px ${language}: partnership image did not select optimized WebP`,
  );
  assert(
    JSON.stringify(result.partnerBadges) === JSON.stringify(
      language === "UA" ? ["70+ EXPO КОМПАНІЙ", "ПАРТНЕРСЬКА ЗОНА"] : ["70+ EXPO COMPANIES", "PARTNER ZONE"],
    ),
    `${width}px ${language}: partnership image badges mismatch`,
  );
  const ticketColumns = new Set(result.ticketCardPositions.map(({ left }) => left)).size;
  const expectedTicketColumns = width >= 1280 ? 4 : width >= 768 ? 2 : 1;
  assert(
    ticketColumns === expectedTicketColumns,
    `${width}px ${language}: expected ${expectedTicketColumns} ticket columns, found ${ticketColumns}`,
  );
  assert(result.partnerBeforeTickets, `${width}px ${language}: partner CTA must appear before tickets`);
  assert(result.programItems === 6, `${width}px ${language}: expected 6 program items, found ${result.programItems}`);
  assert(result.faqItems === 6, `${width}px ${language}: expected 6 FAQ items, found ${result.faqItems}`);
  assert(result.ticketsTitle.length > 20, `${width}px ${language}: ticket text missing (${JSON.stringify(result.ticketsTitle)})`);
  assert(result.faq.length > 5, `${width}px ${language}: FAQ text missing`);
  assert(result.footer.includes("RAVE'ERA"), `${width}px ${language}: footer text missing`);
  assert(result.location.length > 5, `${width}px ${language}: location title missing`);
  assert(result.overflow <= 1, `${width}px ${language}: horizontal overflow is ${result.overflow}px`);
  assert(result.mapHref === "https://maps.app.goo.gl/bih3ZUsmSrxpcbjW6", `${width}px ${language}: map link mismatch`);
  assert(result.mapSrc.includes("Parkovyi%20ECC"), `${width}px ${language}: embedded map location mismatch`);
  for (const href of ["/contacts", "/public-offer", "/privacy", "/returns"]) {
    assert(result.legalHrefs.includes(href), `${width}px ${language}: missing legal link ${href}`);
  }

  for (const type of expectedTicketTypes) {
    assert(
      result.ticketLinks.some((href) => href.endsWith(`?type=${type}`)),
      `${width}px ${language}: missing ticket link for type=${type}`,
    );
  }
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--disable-gpu"],
});

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        const source = message.location().url;
        const blockedExternalResource =
          message.text().includes("ERR_NETWORK_ACCESS_DENIED") &&
          (source.startsWith("https://fonts.googleapis.com") || source.startsWith("https://www.google.com/maps"));
        if (!blockedExternalResource) {
          errors.push(`console: ${message.text()}${source ? ` (${source})` : ""}`);
        }
      }
    });
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

    await page.goto(`${baseUrl}${eccPath}`, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("raveera-cookie-consent", "accepted"));
    await revealPage(page);
    await assertVisibleContent(page, width, "UA");
    const seo = await page.evaluate(() => ({
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
      ogImageType: document.querySelector('meta[property="og:image:type"]')?.getAttribute("content"),
      ogImageWidth: document.querySelector('meta[property="og:image:width"]')?.getAttribute("content"),
      ogImageHeight: document.querySelector('meta[property="og:image:height"]')?.getAttribute("content"),
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute("content"),
      twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute("content"),
      jsonLd: document.querySelector("#ecc-event-jsonld")?.textContent || "",
    }));
    assert(seo.title === "E-Commerce Conference 2026 | RAVE'ERA GROUP", `${width}px: document title mismatch`);
    assert(seo.canonical === `${baseUrl.startsWith("http://127.0.0.1") ? "https://www.rave-era.com.ua" : baseUrl}${eccPath}`, `${width}px: canonical mismatch`);
    assert(seo.ogImage?.endsWith("/images/ecommerce-conference-2026-poster.webp"), `${width}px: OG image mismatch`);
    assert(seo.ogImageType === "image/webp", `${width}px: OG image type mismatch`);
    assert(seo.ogImageWidth === "1672" && seo.ogImageHeight === "941", `${width}px: OG image dimensions mismatch`);
    assert(seo.twitterCard === "summary_large_image", `${width}px: Twitter card mismatch`);
    assert(seo.twitterImage?.endsWith("/images/ecommerce-conference-2026-poster.webp"), `${width}px: Twitter image mismatch`);
    const eventJsonLd = JSON.parse(seo.jsonLd);
    assert(eventJsonLd.name === "E-Commerce Conference 2026", `${width}px: JSON-LD event name mismatch`);
    assert(eventJsonLd.startDate === "2026-10-06", `${width}px: JSON-LD date mismatch`);
    assert(eventJsonLd.location?.name?.includes("Parkovyi"), `${width}px: JSON-LD location mismatch`);
    assert(eventJsonLd.location?.address?.addressLocality === "Київ", `${width}px: JSON-LD city mismatch`);

    const languageButton = page.getByRole("button", { name: "Switch language" });
    for (const language of ["EN", "UA", "EN", "UA"]) {
      await languageButton.click();
      await page.waitForTimeout(120);
      await assertVisibleContent(page, width, language);
    }

    assert(errors.length === 0, `${width}px: browser errors:\n${errors.join("\n")}`);
    await page.close();
  }

  const routePage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await routePage.goto(`${baseUrl}${eccPath}/ticket-form?type=business`, { waitUntil: "networkidle" });
  await routePage.waitForFunction(() => new URLSearchParams(location.search).get("type") !== "business");
  assert(
    new URL(routePage.url()).searchParams.get("type") === "online",
    "ECC type=business did not normalize to the first supported ECC ticket type",
  );

  for (const type of expectedTicketTypes) {
    await routePage.goto(`${baseUrl}${eccPath}/ticket-form?type=${type}`, { waitUntil: "networkidle" });
    const activeTicket = routePage.locator('button[aria-pressed="true"]');
    const activeName = (await activeTicket.textContent())?.trim().toLowerCase() || "";
    const expectedName = type === "vip" ? "vip + afterparty" : type;
    assert(activeName.startsWith(expectedName), `ECC ticket form did not retain type=${type}`);
  }

  for (const href of ["/contacts", "/public-offer", "/privacy", "/returns"]) {
    const response = await routePage.goto(`${baseUrl}${href}`, { waitUntil: "domcontentloaded" });
    assert(response?.ok(), `Legal route failed: ${href}`);
  }

  const sitemapResponse = await routePage.goto(`${baseUrl}/sitemap.xml`, { waitUntil: "domcontentloaded" });
  assert(sitemapResponse?.ok(), "Sitemap route failed");
  const sitemap = await sitemapResponse.text();
  assert(sitemap?.includes("/event/e-commerce-conference-2026"), "Sitemap is missing the ECC event page");
  assert(!sitemap?.includes("/portfolio/e-commerce-conference-2026"), "Removed ECC portfolio route leaked into sitemap");

  await routePage.goto(`${baseUrl}/event/sbc-summit-ukraine-2026`, { waitUntil: "networkidle" });
  const sbcHeading = (await routePage.locator("h1").textContent())?.trim() || "";
  assert(
    sbcHeading.toLowerCase().replace(/\s+/g, "").includes("sbcsummitukraine2026"),
    `SBC page smoke check failed (${JSON.stringify(sbcHeading)})`,
  );
  assert((await routePage.locator("#ecc-event-jsonld").count()) === 0, "ECC JSON-LD leaked onto SBC page");
  const sbcOverflow = await routePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(sbcOverflow <= 1, `SBC page overflow is ${sbcOverflow}px`);
  await routePage.close();

  const reducedMotionPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await reducedMotionPage.emulateMedia({ reducedMotion: "reduce" });
  await reducedMotionPage.goto(`${baseUrl}${eccPath}`, { waitUntil: "networkidle" });
  const reducedMotionResult = await reducedMotionPage.evaluate(() => ({
    mode: document.querySelector('[data-qa="ecc-topics-marquee"]')?.getAttribute("data-reduced-motion") || "",
    staticRows: document.querySelectorAll('[data-qa="ecc-topics-marquee-static"]').length,
    animatedTracks: document.querySelectorAll('[data-qa="ecc-topics-marquee-track"]').length,
    staticLabels: document.querySelector('[data-qa="ecc-topics-marquee-static"]')?.textContent?.trim() || "",
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  assert(reducedMotionResult.mode === "true", "Reduced-motion marquee mode was not enabled");
  assert(reducedMotionResult.staticRows === 1, "Reduced-motion marquee static grid is missing");
  assert(reducedMotionResult.animatedTracks === 0, "Reduced-motion mode still renders animated marquee tracks");
  assert(reducedMotionResult.staticLabels.length > 20, "Reduced-motion marquee labels are missing");
  assert(reducedMotionResult.overflow <= 1, `Reduced-motion page overflow is ${reducedMotionResult.overflow}px`);
  await reducedMotionPage.close();

  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const type of expectedTicketTypes) {
      await page.goto(`${baseUrl}${eccPath}/ticket-form?type=${type}`, { waitUntil: "domcontentloaded" });
      await page.locator('button[aria-pressed="true"]').waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 1, `${width}px type=${type}: ticket form overflow is ${overflow}px`);
    }

    await page.route("**/api/ticket/ECC-2026-ABCDEF123456", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ticket: {
            ticketCode: "ECC-2026-ABCDEF123456",
            eventTitle: "E-Commerce Conference 2026",
            eventSlug: "e-commerce-conference-2026",
            eventDateTime: "2026-10-06T09:30:00+03:00",
            eventVenue: "КВЦ Парковий, Київ",
            eventHref: "/event/e-commerce-conference-2026",
            ticketType: "vip",
            status: "ACTIVE",
            issuedAt: "2026-10-01T10:00:00.000Z",
          },
        }),
      });
    });
    await page.goto(`${baseUrl}/ticket/ECC-2026-ABCDEF123456`, { waitUntil: "domcontentloaded" });
    await page.getByText("2026-10-06T09:30:00+03:00").waitFor();
    assert(await page.getByText("КВЦ Парковий, Київ").isVisible(), `${width}px: ECC ticket venue missing`);
    assert(
      (await page.locator("nav a").first().getAttribute("href")) === eccPath,
      `${width}px: ECC ticket back link mismatch`,
    );
    const ticketOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(ticketOverflow <= 1, `${width}px: public ECC ticket overflow is ${ticketOverflow}px`);

    await page.goto(`${baseUrl}/admin/checkin`, { waitUntil: "domcontentloaded" });
    await page.locator("main").waitFor();
    const adminOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(adminOverflow <= 1, `${width}px: admin check-in overflow is ${adminOverflow}px`);
    await page.close();
  }

  console.log(`ECC page audit passed at widths: ${widths.join(", ")}`);
} finally {
  await browser.close();
}
