// src/scrapeCompetitor.js
import { chromium } from "playwright";

export async function scrapeCompetitor(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

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

  // --- h2〜h5 のみ抽出 ---
  const headers = await page.$$eval("h2, h3, h4, h5", els =>
    els.map(e => {
      // 1. title属性
      const titleAttr = e.getAttribute("title");

      // 2. data-* 属性
      const dataText = Object.values(e.dataset || {})
        .join(" ")
        .trim();

      // 3. childNodes（spanなど完全対応）
      const fullText = Array.from(e.childNodes)
        .map(n => n.textContent || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      // 4. fallback
      const rawText = e.textContent
        .replace(/\s+/g, " ")
        .trim();

      return {
        level: e.tagName.toLowerCase(), // h2 | h3 | h4 | h5
        title:
          (titleAttr && titleAttr.trim()) ||
          (dataText && dataText) ||
          (fullText && fullText) ||
          rawText
      };
    })
  );

  await browser.close();

  return {
    url,
    headers
  };
}
