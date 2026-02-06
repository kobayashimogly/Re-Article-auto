// src/phaseD/applyBody.js
export function applyBody(article, target, body) {
    let ref = article;
  
    for (let i = 0; i < target.path.length - 1; i++) {
      const key = target.path[i];
      if (!(key in ref)) {
        throw new Error(`❌ applyBody: path 不正 → ${target.path.join(".")}`);
      }
      ref = ref[key];
    }
  
    const lastKey = target.path[target.path.length - 1];
    if (!ref[lastKey]) {
      throw new Error(`❌ applyBody: 対象ノードが存在しません`);
    }
  
    ref[lastKey].body = body;
  }
  