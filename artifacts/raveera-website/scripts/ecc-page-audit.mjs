import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const executablePath =
  process.env.BROWSER_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const widths = [320, 375, 390, 430, 768, 1280, 1440];
const eccPath = "/event/e-commerce-conference-2026";
const expectedTicketTypes = ["online", "standard", "vip", "corporate"];

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
      programItems: document.querySelectorAll('[data-qa="ecc-program-item"]').length,
      faqItems: document.querySelectorAll('button[aria-controls^="ecc-faq-answer-"]').length,
      faq: visibleText('button[aria-controls^="ecc-faq-answer-"]'),
      footer: visibleText("footer"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ticketLinks: [...document.querySelectorAll('a[href*="/event/e-commerce-conference-2026/ticket-form?type="]')]
        .map((link) => link.getAttribute("href"))
        .filter(Boolean),
    };
  });

  assert(result.hero.includes("E-COMMERCE CONFERENCE 2026"), `${width}px ${language}: hero text missing`);
  assert(result.ticketCards === 4, `${width}px ${language}: expected 4 ticket cards, found ${result.ticketCards}`);
  assert(result.ticketFeatures === 21, `${width}px ${language}: expected 21 ticket benefits, found ${result.ticketFeatures}`);
  assert(result.leaderCards === 8, `${width}px ${language}: expected 8 market leader cards, found ${result.leaderCards}`);
  assert(result.programItems === 6, `${width}px ${language}: expected 6 program items, found ${result.programItems}`);
  assert(result.faqItems === 6, `${width}px ${language}: expected 6 FAQ items, found ${result.faqItems}`);
  assert(result.ticketsTitle.length > 20, `${width}px ${language}: ticket text missing (${JSON.stringify(result.ticketsTitle)})`);
  assert(result.faq.length > 5, `${width}px ${language}: FAQ text missing`);
  assert(result.footer.includes("RAVE'ERA"), `${width}px ${language}: footer text missing`);
  assert(result.overflow <= 1, `${width}px ${language}: horizontal overflow is ${result.overflow}px`);

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

  await routePage.goto(`${baseUrl}/event/sbc-summit-ukraine-2026`, { waitUntil: "networkidle" });
  const sbcHeading = (await routePage.locator("h1").textContent())?.trim() || "";
  assert(
    sbcHeading.toLowerCase().replace(/\s+/g, "").includes("sbcsummitukraine2026"),
    `SBC page smoke check failed (${JSON.stringify(sbcHeading)})`,
  );
  await routePage.close();

  console.log(`ECC page audit passed at widths: ${widths.join(", ")}`);
} finally {
  await browser.close();
}
