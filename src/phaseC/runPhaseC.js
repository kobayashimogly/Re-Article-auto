// src/phaseC/runPhaseC.js
import path from "path";
import fs from "fs";
import { buildRewritePlan } from "./buildRewritePlan.js";
import { validateStructure } from "../structureValidator.js";
import { applyRewritePlan } from "./applyRewritePlan.js";

const keyword = process.argv[2];
if (!keyword) {
  console.error("❌ キーワードを指定してください");
  process.exit(1);
}

const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, "_");
const outputDir = path.join(process.cwd(), "output");
const files = fs.readdirSync(outputDir);

// ===== フェーズA =====
const selfArticleFile = files.find(
  f =>
    f.endsWith(`_${safeKeyword}.json`) &&
    !f.startsWith("competitors_") &&
    !f.startsWith("rewritePlan_") &&
    !f.startsWith("改_")
);
if (!selfArticleFile) throw new Error("❌ フェーズAが見つかりません");

// ===== フェーズB =====
const competitorFile = `competitors_${safeKeyword}.json`;
if (!files.includes(competitorFile)) {
  throw new Error("❌ フェーズBが見つかりません");
}

let currentPath = path.join(outputDir, selfArticleFile);
let currentJson = JSON.parse(fs.readFileSync(currentPath, "utf8"));

let structure =
  currentJson.sections ||
  currentJson.structure ||
  currentJson.blocks ||
  currentJson;

if (!Array.isArray(structure)) {
  throw new Error("❌ 記事構造が配列ではありません");
}

// ===== 構造チェックループ =====
const MAX_LOOP = 6;

for (let loop = 1; loop <= MAX_LOOP; loop++) {
  console.log(`\n🔁 構造チェックループ ${loop}/${MAX_LOOP}`);

  const errors = validateStructure(structure, keyword);

  if (errors.length === 0) {
    console.log("✅ 構造エラー解消。フェーズC完了");
    process.exit(0);
  }

  console.log("⚠️ 構造エラー:");
  errors.forEach((e, i) => console.log(`${i + 1}. ${e}`));

  const rewritePlanPath = path.join(
    outputDir,
    `rewritePlan_${safeKeyword}.json`
  );

  const plan = await buildRewritePlan({
    selfArticleJsonPath: currentPath,
    competitorJsonPath: path.join(outputDir, competitorFile),
    structureErrors: errors,
    outputPath: rewritePlanPath
  });

  if (!plan.actions?.length) {
    throw new Error("❌ AIが修正案を出力しませんでした");
  }

  console.log(`📝 修正案生成: ${plan.actions.length} 件`);

  // ★ 構造を更新
  structure = applyRewritePlan(structure, plan);

  // ★ 新しいJSONを保存
  currentPath = path.join(
    outputDir,
    `改_${loop}_${safeKeyword}.json`
  );

  fs.writeFileSync(
    currentPath,
    JSON.stringify({ sections: structure }, null, 2),
    "utf8"
  );

  console.log(`💾 構造更新 → ${path.basename(currentPath)}`);
}

throw new Error("❌ 構造修正が6回以内に完了しませんでした");
