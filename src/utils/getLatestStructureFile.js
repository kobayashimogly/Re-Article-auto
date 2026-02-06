// src/utils/getLatestStructureFile.js
import fs from "fs";
import path from "path";

export function getLatestStructureFile(keyword) {
  const safeKw = keyword.replace(/[\\\/:*?"<>|]/g, "_");
  const outputDir = path.join(process.cwd(), "output");

  const files = fs.readdirSync(outputDir);

  const targets = files
    .filter(f => f.match(new RegExp(`^改_(\\d+)_${safeKw}\\.json$`)))
    .map(f => {
      const num = Number(f.match(/^改_(\d+)_/)[1]);
      return { file: f, num };
    });

  if (targets.length === 0) {
    throw new Error("❌ 改_xx 構造ファイルが見つかりません");
  }

  targets.sort((a, b) => b.num - a.num);

  return path.join(outputDir, targets[0].file);
}
