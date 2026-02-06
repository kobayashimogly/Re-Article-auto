// src/phaseD/isBodyComplete.js
export function isBodyComplete(node) {
    // body プロパティが無い
    if (!("body" in node)) return false;
  
    // string でない
    if (typeof node.body !== "string") return false;
  
    // 空白系（"", " ", "　", 改行だけ 等）
    if (node.body.trim().length === 0) return false;
  
    // ここまで来たら本文あり
    return true;
  }
  