// index.js
import fs from "fs";
import path from "path";
import { spanToMarker } from "./src/spanMarker.js";
import { htmlToFullJson } from "./src/htmlToJsonFull.js";

const inputPath = process.argv[2];
if (!inputPath) {
  throw new Error("input.json が指定されていません");
}

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const { articleId, keyword, html, htmlFile } = input;

// ===============================
// HTML取得（両対応）
// ===============================
let originalHtml;

if (typeof html === "string" && html.trim() !== "") {
  // GAS / CI 用：HTML本文が直接渡される
  originalHtml = html;
  console.log("ℹ️ HTML source: inline html");
} else if (typeof htmlFile === "string" && htmlFile.trim() !== "") {
  // ローカル / ファイル指定用
  const htmlPath = path.resolve(path.dirname(inputPath), htmlFile);
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`HTMLファイルが見つかりません: ${htmlPath}`);
  }
  originalHtml = fs.readFileSync(htmlPath, "utf8");
  console.log(`ℹ️ HTML source: file (${htmlFile})`);
} else {
  throw new Error("html または htmlFile のどちらかが必要です");
}

// ===============================
// 以降は元の処理そのまま
// ===============================

// span.yellow → マーカー
const markedHtml = spanToMarker(originalHtml);

// HTML全文 → 構造JSON
const structured = htmlToFullJson(markedHtml);

// 出力
const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, "_");
const jsonName = `${articleId}_${safeKeyword}.json`;
const outputPath = path.join(process.cwd(), "output", jsonName);

// output ディレクトリ保証
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(outputPath, JSON.stringify(structured, null, 2), "utf8");

console.log("✅ フェーズA（完全版）完了");
console.log(`📄 ${outputPath}`);
console.log(`🔹 ブロック数：${structured.length}`);
