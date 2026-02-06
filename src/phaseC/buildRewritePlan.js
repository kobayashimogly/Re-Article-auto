// src/phaseC/buildRewritePlan.js
import fs from "fs";
import path from "path";
import { buildPrompt } from "./prompt.js";
import { callGemini } from "../utils/callGemini.js";

function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("AI出力が空です");
  }

  // code fence除去
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // 最初に現れる JSONオブジェクトをできるだけ安全に抽出
  // 方針：最初の "{" から始め、括弧の対応が取れたところで切る
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("JSON開始 { が見つかりません");

  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;

    if (depth === 0) {
      return cleaned.slice(start, i + 1);
    }
  }

  throw new Error("JSONの括弧対応が取れません（} が不足）");
}

export async function buildRewritePlan({
  selfArticleJsonPath,
  competitorJsonPath,
  structureErrors,
  outputPath
}) {
  // ===== 入力ガード =====
  if (!selfArticleJsonPath) throw new Error("selfArticleJsonPath が未指定です");
  if (!competitorJsonPath) throw new Error("competitorJsonPath が未指定です");
  if (!Array.isArray(structureErrors)) throw new Error("structureErrors は配列である必要があります");
  if (!outputPath) throw new Error("outputPath が未指定です");

  // ===== JSON読み込み =====
  const selfArticle = JSON.parse(fs.readFileSync(selfArticleJsonPath, "utf8"));
  const competitors = JSON.parse(fs.readFileSync(competitorJsonPath, "utf8"));

  // ===== prompt生成 =====
  const prompt = buildPrompt(selfArticle, competitors, structureErrors);

  // ===== AI呼び出し =====
  const rawText = await callGemini(prompt);

  // ===== JSON抽出・解析 =====
  let resultJson;
  try {
    const jsonText = extractJson(rawText);
    resultJson = JSON.parse(jsonText);
  } catch (e) {
    console.error("❌ AI RAW OUTPUT ↓↓↓");
    console.error(rawText);
    console.error("❌ PARSE ERROR:", e?.message || e);
    throw new Error("❌ AI出力がJSONとして解析できません");
  }

  // ===== 最低限のschemaチェック（落ちないため）=====
  if (!resultJson || !Array.isArray(resultJson.actions)) {
    console.error("❌ AI JSON:", resultJson);
    throw new Error("❌ AI出力JSONが不正です（actions配列がありません）");
  }

  // ===== 出力先ディレクトリ作成 =====
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });

  // ===== 保存 =====
  fs.writeFileSync(outputPath, JSON.stringify(resultJson, null, 2), "utf8");

  // 呼び出し元で使えるように返す（便利）
  return resultJson;
}
