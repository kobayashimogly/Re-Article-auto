// src/phaseC/prompt.js
export function buildPrompt(selfArticle, competitors, structureErrors) {
    return `
  あなたはSEO記事の「構造修正案」を作るAIです。
  本文は一切書かず、**以下の構造エラーを修正するための actions のみ**を出力してください。
  
  ## 重要ルール
  - actions が空になることはありません
  - 各エラーに対して最低1つの action を作成してください
  - 削除は禁止。追加・修正のみ
  - JSON以外は出力しない
  
  ## 構造エラー（必ず全て対応）
  ${structureErrors.map((e, i) => `${i + 1}. ${e}`).join("\n")}
  
  ## 出力形式
  {
    "actions": [
      {
        "type": "rename_h2 | add_h3 | add_h4",
        "target": "対象の見出しタイトル",
        "title": "修正後または追加する見出し",
        "reason": "上記エラーを解消するため"
      }
    ]
  }
  
  ## 自分の記事構造
  ${JSON.stringify(selfArticle, null, 2)}
  
  ## 競合構造（参考）
  ${JSON.stringify(competitors, null, 2)}
  
  JSONのみを出力してください。
    `.trim();
  }
  