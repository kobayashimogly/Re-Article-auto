// src/phaseE/prompt.js
export function buildPrompt(selfArticle, competitors) {
    return `
  あなたは就活メディアの編集長です。
  以下の「自分の記事構造」と「競合記事構造」を比較し、
  構造として不足している h2 / h3 を設計してください。
  
  # 絶対ルール（最重要）
  - h2 を追加する場合、必ず直下に適切な h3 を複数含めること
  - 「例文」「◯選」「一覧」「リスト」を含む h2 は、
    内容に対応した h3 を必ず設計すること
  - h2 単体、h3 単体の追加は禁止
  - 追加位置（どの h2 の後に挿入するか）を必ず指定する
  - 既存の構造は変更しない
  - 本文は一切書かない
  - JSONのみ出力
  
  # 出力形式（厳守）
  {
    "actions": [
      {
        "type": "add_h2",
        "title": "追加するh2タイトル",
        "insert_after": "このh2の直後に挿入する",
        "children": [
          { "level": "h3", "title": "h3タイトル" }
        ]
      },
      {
        "type": "add_h3",
        "parent": "既存h2タイトル",
        "title": "追加するh3タイトル"
      }
    ]
  }
  
  # 自分の記事構造
  ${JSON.stringify(selfArticle, null, 2)}
  
  # 競合記事構造
  ${JSON.stringify(competitors, null, 2)}
  
  JSONのみを出力してください。
  `.trim();
  }
  