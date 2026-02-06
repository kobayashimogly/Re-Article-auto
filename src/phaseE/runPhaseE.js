// src/phaseE/runPhaseE.js
import fs from "fs";
import path from "path";
import { resolveTargetJson } from "../phaseD/resolveTargetJson.js";
import { buildStructureDiff } from "./buildStructureDiff.js";

const keyword = process.argv[2];
if (!keyword) {
  console.error("❌ キーワードを指定してください");
  process.exit(1);
}

const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, "_");
const outputDir = path.join(process.cwd(), "output");

// ===============================
// 起点JSON取得（改_最大 or 元記事）
// ===============================
const baseJsonPath = resolveTargetJson(outputDir, safeKeyword);
console.log(`📄 PhaseE 起点: ${path.basename(baseJsonPath)}`);

const article = JSON.parse(fs.readFileSync(baseJsonPath, "utf8"));

// 競合
const competitorPath = path.join(outputDir, `competitors_${safeKeyword}.json`);
const competitors = JSON.parse(fs.readFileSync(competitorPath, "utf8"));

// ===============================
// AIで追加構成案生成
// ===============================
const diffPath = path.join(outputDir, `structureDiff_${safeKeyword}.json`);
const diff = await buildStructureDiff({
  selfArticle: article,
  competitors,
  outputPath: diffPath
});

// ===============================
// 構造反映
// ===============================
const sections = article.sections || article;

diff.actions.forEach(act => {
  if (act.type === "add_h2") {
    const idx = sections.findIndex(s => s.title === act.insert_after);
    const insertPos = idx === -1 ? sections.length : idx + 1;

    sections.splice(insertPos, 0, {
      level: "h2",
      title: act.title,
      body: "",
      children: act.children.map(c => ({
        level: "h3",
        title: c.title,
        body: "",
        children: []
      }))
    });
  }

  if (act.type === "add_h3") {
    const parent = sections.find(s => s.title === act.parent);
    if (!parent) return;

    parent.children.push({
      level: "h3",
      title: act.title,
      body: "",
      children: []
    });
  }
});

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

console.log(`🎉 PhaseE 完了 → ${outFile}`);
