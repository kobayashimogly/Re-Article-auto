// src/phaseD/resolveTargetJson.js
import fs from "fs";
import path from "path";

export function resolveTargetJson(outputDir, safeKeyword) {
  const files = fs.readdirSync(outputDir);

  // 改_xx_ があれば最大番号
  const revised = files
    .filter(f => f.startsWith("改_") && f.endsWith(`_${safeKeyword}.json`))
    .map(f => ({
      file: f,
      index: Number(f.match(/^改_(\d+)_/)?.[1] || 0)
    }))
    .sort((a, b) => b.index - a.index);

  if (revised.length > 0) {
    return path.join(outputDir, revised[0].file);
  }

  // なければ {記事ID}_kw.json を探す
  const fallback = files.find(
    f => f.endsWith(`_${safeKeyword}.json`) && /^\d+_/.test(f)
  );

  if (!fallback) {
    throw new Error("❌ 起点となる記事JSONが見つかりません");
  }

  return path.join(outputDir, fallback);
}
