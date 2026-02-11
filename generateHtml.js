// generateHtml.js
import fs from "fs";
import path from "path";

// ====================================================
// input.json 読み込み
// ====================================================
function loadInput() {
  const raw = fs.readFileSync("input.json", "utf-8");
  return JSON.parse(raw);
}

// ====================================================
// 最新の 改_xx_*.json を取得
// ====================================================
function getLatestArticleFile(keyword) {
  const files = fs.readdirSync("output");
  const regex = new RegExp(`^改_(\\d+)_${keyword}\\.json$`);

  const matched = files
    .map(f => {
      const m = f.match(regex);
      return m ? { file: f, index: Number(m[1]) } : null;
    })
    .filter(Boolean);

  if (matched.length === 0) return null;

  matched.sort((a, b) => a.index - b.index);
  return matched[matched.length - 1].file;
}

// ====================================================
// YELLOW変換
// ====================================================
function convertYellow(text = "") {
  return text
    .replace(/\[\[YELLOW\]\]/g, `<span class="yellow">`)
    .replace(/\[\[\/YELLOW\]\]/g, `</span>`);
}

// ====================================================
// 「。」ごとに <p></p>
// ====================================================
function toParagraphs(text = "") {
  return convertYellow(text)
    .split(/。+/)
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => `<p>${t}。</p>`)
    .join("\n");
}

// ====================================================
// 再帰的にHTML生成
// ====================================================
function renderNode(node) {
  let html = "";

  html += `<${node.level}>${node.title}</${node.level}>\n`;

  if (node.body && node.body.trim()) {
    html += `${toParagraphs(node.body)}\n`;
  }

  if (Array.isArray(node.children)) {
    node.children.forEach(child => {
      html += "\n" + renderNode(child);
    });
  }

  return html;
}

// ====================================================
// main
// ====================================================
function main() {
  // ① input.json から取得
  const input = loadInput();
  const { articleId, keyword } = input;

  if (!articleId || !keyword) {
    console.log("❌ input.json に articleId / keyword がありません");
    return;
  }

  const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, "_");

  // ② 最新の改_xx_json取得
  const file = getLatestArticleFile(safeKeyword);
  if (!file) {
    console.log("❌ 改_xx_json が見つかりません");
    return;
  }

  const jsonPath = path.join("output", file);
  console.log(`📄 読み込み: ${jsonPath}`);

  const article = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  let html = "";

// ★ intro があれば、記事冒頭の本文として出力
if (article.intro && article.intro.body) {
  html += toParagraphs(article.intro.body) + "\n";
}

const sections = article.sections || [];

sections.forEach(section => {
  html += renderNode(section) + "\n";
});


  html = html.replace(/<p>。<\/p>\n?/g, "");

  // ③ 出力名は articleId 基準
  const mediaPrefix = input.media || "";
    const outFile = `${articleId}_${mediaPrefix}${safeKeyword}.html`;
  fs.writeFileSync(outFile, html, "utf-8");

  console.log(`✅ HTML生成完了 → ${outFile}`);
}

main();
