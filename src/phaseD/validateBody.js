// src/phaseD/validateBody.js

// 禁止記号（あなたのルールに合わせる）
const NG_CHARS = ["”", "“", "*", "\""];

// 丁寧語チェック（あなたの最新版）
function endsWithPolite(text) {
  return /(です|ます|しょう|さい)[。．\.!\?！？」]*$/.test(text.trim());
}

// タグ除外してカウント（念のため）
function stripTags(text) {
  return text.replace(/<[^>]*>/g, "");
}

function countChars(text) {
  return stripTags(text).replace(/\s+/g, "").length;
}

// [[YELLOW]] の数（マーカーのまま運用）
function countYellowMarkers(text) {
  const m = text.match(/\[\[YELLOW\]\]/g);
  return m ? m.length : 0;
}

// export（← ここ重要：generateBody.js が import できるように）
export function validateBody(body, level = "h3") {
  const errors = [];

  if (!body || typeof body !== "string") {
    return { ok: false, errors: ["body が空です"] };
  }

  // 禁止記号
  for (const ch of NG_CHARS) {
    if (body.includes(ch)) errors.push(`禁止記号が含まれています: ${ch}`);
  }

  // 文字数：全レベル共通 200〜350
  const len = countChars(body);
  if (len < 180 || len > 350) {
    errors.push(`本文が文字数外です（${len}字） ※200〜300字に収まるようにしてください`);
  }

  // 丁寧語で終わる
  if (!endsWithPolite(body)) {
    errors.push("本文が丁寧語で終わっていません（です・ます・しょう・さい など）");
  }

  // YELLOW：最低1つ（上限もかけるならここで）
  const yellow = countYellowMarkers(body);
  if (yellow < 1) {
    errors.push("本文中で重要な単語にやフレーズを[[YELLOW]] と[[/YELLOW]]で囲ってください。これを最低1つ入れる");
  }

  return { ok: errors.length === 0, errors };
}
