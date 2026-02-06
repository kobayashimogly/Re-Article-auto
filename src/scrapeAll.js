// src/scrapeAll.js
import fs from "fs";
import path from "path";
import { getCompetitorUrls } from "./serpSearch.js";
import { scrapeCompetitor } from "./scrapeCompetitor.js";
import { htmlToFullJson } from "./htmlToJsonFull.js";

/**
 * headers配列を「疑似HTML」に変換する
 * 例:
 * [{ level: "h2", title: "AAA" }]
 * → <h2>AAA</h2>
 */
function headersToPseudoHtml(headers) {
  return headers
    .map(h => `<${h.level}>${h.title}</${h.level}>`)
    .join("");
}

async function main() {
  const keyword = process.argv[2];

  if (!keyword) {
    console.log("❌ キーワードを指定してください");
    console.log("例: node src/scrapeAll.js \"大学で学んだこと\"");
    return;
  }

  console.log("🔍 競合検索開始:", keyword);

  // 1. SERP検索
  const urls = await getCompetitorUrls(keyword);

  if (urls.length === 0) {
    console.log("❌ 有効な競合URLが取得できませんでした");
    return;
  }

  console.log("✅ 対象URL:", urls);

  const competitors = [];

  // 2. 各URLをスクレイピング
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`📥 [${i + 1}/${urls.length}] スクレイピング中 → ${url}`);

    try {
      const scraped = await scrapeCompetitor(url);

      // 3. headers → 疑似HTML → 構造JSON
      const pseudoHtml = headersToPseudoHtml(scraped.headers);
      const structured = htmlToFullJson(pseudoHtml);

      competitors.push({
        rank: i + 1,
        url,
        sections: structured.sections
      });

    } catch (err) {
      console.log("⚠️ スキップ（取得失敗）:", url);
      console.error(err.message);
    }
  }

  // 4. 出力
  const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, "_");
  const outputPath = path.join(
    process.cwd(),
    "output",
    `competitors_${safeKeyword}.json`
  );

  const output = {
    keyword,
    competitors
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");

  console.log("✅ フェーズB 完了");
  console.log(`📄 ${outputPath}`);
}

main();
