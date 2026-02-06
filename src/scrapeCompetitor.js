// src/scrapeCompetitor.js
import { chromium } from "playwright";

export async function scrapeCompetitor(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 40000
    });

    // --- 見出し省略を完全無効化する（重要） ---
    await page.addStyleTag({
      content: `
        * {
          max-width: none !important;
          overflow: visible !important;
          text-overflow: clip !important;
          white-space: normal !important;
        }
      `
    });

    const headers = await page.$$eval("h2, h3, h4, h5", els =>
      els.map(e => {
        const titleAttr = e.getAttribute("title");
        const dataText = Object.values(e.dataset || {})
          .join(" ")
          .trim();
        const fullText = Array.from(e.childNodes)
          .map(n => n.textContent || "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        const rawText = e.textContent
          .replace(/\s+/g, " ")
          .trim();

        return {
          level: e.tagName.toLowerCase(),
          title:
            (titleAttr && titleAttr.trim()) ||
            (dataText && dataText) ||
            (fullText && fullText) ||
            rawText
        };
      })
    );

    return { url, headers };

  } finally {
    // ★ ここが最重要（成功・失敗どちらでも必ず実行）
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
