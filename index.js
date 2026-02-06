// index.js
import fs from "fs";
import path from "path";
import { spanToMarker } from "./src/spanMarker.js";
import { htmlToFullJson } from "./src/htmlToJsonFull.js";

const inputPath = process.argv[2];
const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const { articleId, keyword, htmlFile } = input;

const htmlPath = path.resolve(path.dirname(inputPath), htmlFile);
const originalHtml = fs.readFileSync(htmlPath, "utf8");

// span.yellow → マーカー
const markedHtml = spanToMarker(originalHtml);

// HTML全文 → 構造JSON
const structured = htmlToFullJson(markedHtml);

// 出力
const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, "_");
const jsonName = `${articleId}_${safeKeyword}.json`;
const outputPath = path.join(process.cwd(), "output", jsonName);

fs.writeFileSync(outputPath, JSON.stringify(structured, null, 2), "utf8");

console.log("✅ フェーズA（完全版）完了");
console.log(`📄 ${outputPath}`);
console.log(`🔹 ブロック数：${structured.length}`);
