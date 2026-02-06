// src/htmlToJsonFull.js

/**
 * HTML全文を
 * - intro（テキスト）
 * - h2（親）
 *   - h3 / h4 / h5（子）
 * に変換する
 * body は「表示文字のみ（タグ・改行除去）」
 */
export function htmlToFullJson(markedHtml) {
    const headingRegex = /(<h[2-5][\s\S]*?<\/h[2-5]>)/gi;
    const parts = markedHtml.split(headingRegex);
  
    const result = {
      intro: { body: "" },
      sections: []
    };
  
    let currentH2 = null;
    let currentStack = [];
  
    const getLevelNum = (tag) =>
      Number(tag.match(/^<h([2-5])/i)[1]);
  
    const extractTitle = (html) =>
      html.replace(/<[^>]*>/g, "").trim();
  
    const normalizeText = (html) =>
      html
        .replace(/<[^>]*>/g, "")   // タグ除去
        .replace(/\n+/g, "")       // 改行除去
        .replace(/\s+/g, " ")      // 連続空白を1つに
        .trim();
  
    const appendBody = (text) => {
      if (!text) return;
  
      if (currentStack.length > 0) {
        currentStack[currentStack.length - 1].body += text;
      } else if (currentH2) {
        currentH2.body += text;
      } else {
        result.intro.body += text;
      }
    };
  
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
  
      // 見出し
      if (part.match(/^<h[2-5]/i)) {
        const levelNum = getLevelNum(part);
        const level = `h${levelNum}`;
        const title = extractTitle(part);
  
        const node = {
          level,
          title,
          body: "",
          children: []
        };
  
        if (levelNum === 2) {
          result.sections.push(node);
          currentH2 = node;
          currentStack = [];
          continue;
        }
  
        if (!currentH2) {
          // h2前のh3以下はintro扱い
          result.intro.body += normalizeText(part);
          continue;
        }
  
        // 階層調整
        while (
          currentStack.length > 0 &&
          Number(currentStack[currentStack.length - 1].level[1]) >= levelNum
        ) {
          currentStack.pop();
        }
  
        if (currentStack.length === 0) {
          currentH2.children.push(node);
        } else {
          currentStack[currentStack.length - 1].children.push(node);
        }
  
        currentStack.push(node);
      } else {
        // 本文
        const text = normalizeText(part);
        appendBody(text);
      }
    }
  
    return result;
  }
  