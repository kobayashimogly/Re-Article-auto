// src/phaseE/buildStructureDiff.js
import fs from "fs";
import { buildPrompt } from "./prompt.js";
import { callGemini } from "../utils/callGemini.js";

function extractJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("❌ JSON抽出失敗");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function buildStructureDiff({
  selfArticle,
  competitors,
  outputPath
}) {
  const prompt = buildPrompt(selfArticle, competitors);
  const raw = await callGemini(prompt);

  const result = extractJson(raw);

  // ★ 安全装置：h2は必ず children 必須
  result.actions.forEach(act => {
    if (act.type === "add_h2" && (!act.children || act.children.length === 0)) {
      throw new Error(`❌ add_h2 に children がありません: ${act.title}`);
    }
  });

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
  return result;
}
