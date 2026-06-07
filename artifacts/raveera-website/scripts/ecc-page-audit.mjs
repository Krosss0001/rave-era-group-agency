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
      ticketFeatures: document.querySelectorAll('[data-qa="ecc-ticket-feature"]').length,
      leaderCards: document.querySelectorAll('[data-qa="ecc-leader-card"]').length,
      topicChips: [...document.querySelectorAll('[data-qa="ecc-topic-chip"]')].map((chip) => ({
        id: chip.getAttribute("data-topic-id") || "",
        label: chip.textContent?.trim() || "",
        tagName: chip.tagName,
      })),
      marqueeTracks: document.querySelectorAll('[data-qa="ecc-topics-marquee-track"]').length,
      marqueeSegments: document.querySelectorAll('[data-qa="ecc-topics-marquee-segment"]').length,
      marqueeReducedMotion: document.querySelector('[data-qa="ecc-topics-marquee"]')?.getAttribute("data-reduced-motion") || "",
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
  assert(result.ticketFeatures === 21, `${width}px ${language}: expected 21 ticket benefits, found ${result.ticketFeatures}`);
  assert(result.leaderCards === 8, `${width}px ${language}: expected 8 market leader cards, found ${result.leaderCards}`);
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
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute("content"),
      twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute("content"),
      jsonLd: document.querySelector("#ecc-event-jsonld")?.textContent || "",
    }));
    assert(seo.title === "E-Commerce Conference 2026 | RAVE'ERA GROUP", `${width}px: document title mismatch`);
    assert(seo.canonical === `${baseUrl.startsWith("http://127.0.0.1") ? "https://www.rave-era.com.ua" : baseUrl}${eccPath}`, `${width}px: canonical mismatch`);
    assert(seo.ogImage?.endsWith("/images/ecommerce-conference-2026-poster.png"), `${width}px: OG image mismatch`);
    assert(seo.twitterCard === "summary_large_image", `${width}px: Twitter card mismatch`);
    assert(seo.twitterImage?.endsWith("/images/ecommerce-conference-2026-poster.png"), `${width}px: Twitter image mismatch`);
    const eventJsonLd = JSON.parse(seo.jsonLd);
    assert(eventJsonLd.startDate === "2026-10-06", `${width}px: JSON-LD date mismatch`);
    assert(eventJsonLd.location?.name?.includes("Parkovyi"), `${width}px: JSON-LD location mismatch`);

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
            eventDateTime: "6 жовтня 2026",
            eventVenue: "КВЦ «Парковий», Київ",
            eventHref: "/event/e-commerce-conference-2026",
            ticketType: "vip",
            customerName: "Test Buyer",
            status: "ACTIVE",
            qrPayload: "https://www.rave-era.com.ua/ticket/ECC-2026-ABCDEF123456",
            issuedAt: "2026-10-01T10:00:00.000Z",
          },
        }),
      });
    });
    await page.goto(`${baseUrl}/ticket/ECC-2026-ABCDEF123456`, { waitUntil: "domcontentloaded" });
    await page.getByText("6 жовтня 2026").waitFor();
    assert(await page.getByText("КВЦ «Парковий», Київ").isVisible(), `${width}px: ECC ticket venue missing`);
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
