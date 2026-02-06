// src/phaseD/runPhaseD.js
import path from "path";
import fs from "fs";

import { resolveTargetJson } from "./resolveTargetJson.js";
import { collectTargets } from "./collectTargets.js";
import { generateBodyWithLoop } from "./generateBody.js";
import { applyBody } from "./applyBody.js";

const keyword = process.argv[2];
if (!keyword) {
  console.error("❌ キーワードを指定してください");
  process.exit(1);
}

const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, "_");
const outputDir = path.join(process.cwd(), "output");

// ===============================
// 起点JSON解決（改_最大番号）
// ===============================
const targetJsonPath = resolveTargetJson(outputDir, safeKeyword);
console.log(`📄 phaseD 起点JSON: ${path.basename(targetJsonPath)}`);

let article = JSON.parse(fs.readFileSync(targetJsonPath, "utf8"));

// ===============================
// 🔑 探索起点を sections に固定
// ===============================
if (!Array.isArray(article.sections)) {
  throw new Error("❌ article.sections が存在しません");
}

// ===============================
// body 未生成ブロック収集
// ===============================
const targets = collectTargets(article.sections);

if (targets.length === 0) {
  console.log("✅ すべて本文あり。phaseDは不要です。");
  process.exit(0);
}

console.log(`✍️ 本文生成対象: ${targets.length} ブロック`);

// ===============================
// 本文生成ループ
// ===============================
for (const target of targets) {
  const body = await generateBodyWithLoop(keyword, target);
  applyBody(article, target, body);
}

// ===============================
// 保存（改_インクリメント）
// ===============================
const nextIndex = (article.__revisionIndex || 1) + 1;
article.__revisionIndex = nextIndex;

const outFile = `改_${nextIndex}_${safeKeyword}.json`;
fs.writeFileSync(
  path.join(outputDir, outFile),
  JSON.stringify(article, null, 2),
  "utf8"
);

console.log(`🎉 phaseD 完了 → ${outFile}`);
