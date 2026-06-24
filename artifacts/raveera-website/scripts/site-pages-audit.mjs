import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const executablePath = process.env.BROWSER_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const widths = [320, 360, 375, 390, 430, 480, 768, 834, 1024, 1180, 1280, 1366, 1440, 1536, 1920];
const routes = [
  ["/", "RAVE"],
  ["/event/e-commerce-conference-2026", "E-COMMERCE CONFERENCE 2026"],
  ["/event/e-commerce-conference-2026/ticket-form?type=online", "ONLINE"],
  ["/event/e-commerce-conference-2026/ticket-form?type=standard", "STANDARD"],
  ["/event/e-commerce-conference-2026/ticket-form?type=vip", "VIP"],
  ["/event/e-commerce-conference-2026/ticket-form?type=corporate", "CORPORATE"],
  ["/event/e-commerce-conference-2026/payment/success", "RAVE'ERA TICKETS"],
  ["/event/e-commerce-conference-2026/payment/fail?type=standard", "ALLIANCEPAY"],
  ["/event/sbc-summit-ukraine-2026", "SBC SUMMIT UKRAINE 2026"],
  ["/event/sbc-summit-ukraine-2026/ticket-form?type=sport", "SBC"],
  ["/contacts", "ceo@rave-era.com.ua"],
  ["/public-offer", "UA303001190000026006744298001"],
  ["/privacy", "ceo@rave-era.com.ua"],
  ["/returns", "ceo@rave-era.com.ua"],
  ["/admin/checkin", "RAVE'ERA"],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isExpectedExternalError(message, source) {
  return message.includes("ERR_NETWORK_ACCESS_DENIED") &&
    (source.includes("fonts.googleapis.com") || source.includes("www.google.com/maps"));
}

async function inspectRoute(page, path, expectedText, width) {
  const errors = [];
  const onConsole = (message) => {
    if (message.type() !== "error") return;
    const source = message.location().url;
    if (!isExpectedExternalError(message.text(), source)) errors.push(`console: ${message.text()} (${source})`);
  };
  const onPageError = (error) => errors.push(`pageerror: ${error.message}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
  assert(response?.ok(), `${width}px ${path}: route failed`);
  await page.waitForFunction(
    (text) => document.body.innerText.toUpperCase().includes(text.toUpperCase()),
    expectedText,
    { timeout: 5_000 },
  );
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    visibleText: document.body.innerText.replace(/\s+/g, " ").trim(),
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
    visibleFixed: [...document.querySelectorAll("[class*='fixed'], [style*='position: fixed']")]
      .filter((element) => getComputedStyle(element).display !== "none")
      .length,
  }));

  assert(state.overflow <= 1, `${width}px ${path}: horizontal overflow is ${state.overflow}px`);
  assert(state.visibleText.toUpperCase().includes(expectedText.toUpperCase()), `${width}px ${path}: expected content is missing (${expectedText})`);
  assert(state.brokenImages.length === 0, `${width}px ${path}: broken images: ${state.brokenImages.join(", ")}`);
  assert(errors.length === 0, `${width}px ${path}: browser errors:\n${errors.join("\n")}`);
  page.off("console", onConsole);
  page.off("pageerror", onPageError);
}

const browser = await chromium.launch({ executablePath, headless: true, args: ["--disable-gpu"] });

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.addInitScript(() => localStorage.setItem("raveera-cookie-consent", "accepted"));
    for (const [path, expectedText] of routes) await inspectRoute(page, path, expectedText, width);

    await page.route("**/api/ticket/ECC-2026-ABCDEF123456", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ticket: {
          ticketCode: "ECC-2026-ABCDEF123456",
          eventTitle: "E-Commerce Conference 2026",
          eventSlug: "e-commerce-conference-2026",
          eventDateTime: "2026-10-06T09:30:00+03:00",
          eventVenue: "КВЦ Парковий, Київ",
          eventHref: "/event/e-commerce-conference-2026",
          ticketType: "vip",
          status: "ACTIVE",
          issuedAt: "2026-10-01T10:00:00.000Z",
        } }),
      });
    });
    await inspectRoute(page, "/ticket/ECC-2026-ABCDEF123456", "E-COMMERCE CONFERENCE 2026", width);
    await page.close();
  }

  const metadataPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await metadataPage.goto(`${baseUrl}/event/e-commerce-conference-2026`, { waitUntil: "domcontentloaded" });
  await metadataPage.waitForFunction(
    () => document.querySelector('link[rel="canonical"]')?.getAttribute("href")?.endsWith("/event/e-commerce-conference-2026"),
    undefined,
    { timeout: 5_000 },
  );
  const metadata = await metadataPage.evaluate(() => ({
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
    twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute("content"),
    jsonLd: document.querySelector("#ecc-event-jsonld")?.textContent,
  }));
  assert(metadata.canonical?.endsWith("/event/e-commerce-conference-2026"), "ECC canonical URL is missing");
  assert(metadata.ogImage?.endsWith("ecommerce-conference-2026-poster.webp"), "ECC OG image is missing");
  assert(metadata.twitterImage === metadata.ogImage, "ECC Twitter image diverges from OG image");
  assert(JSON.parse(metadata.jsonLd || "{}").name === "E-Commerce Conference 2026", "ECC Event JSON-LD is missing");
  await metadataPage.close();

  console.log(`Full site page audit passed at widths: ${widths.join(", ")}`);
} finally {
  await browser.close();
}
