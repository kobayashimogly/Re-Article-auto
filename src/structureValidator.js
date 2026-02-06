// src/structureValidator.js

// 「10選」「5つ」「3点」など
const NUMBER_PATTERN = /(\d+)(選|個|つ|点)/;

// 丸数字（①②③…）も拾いたい場合
const CIRCLED_NUMBER_PATTERN = /[①②③④⑤⑥⑦⑧⑨⑩]/g;

/**
 * タイトルから「要求されている数」を取得
 */
function extractRequiredCount(title = "") {
  const match = title.match(NUMBER_PATTERN);
  if (match) return Number(match[1]);

  const circled = title.match(CIRCLED_NUMBER_PATTERN);
  if (circled && circled.length >= 2) {
    return circled.length;
  }

  return null;
}

/**
 * 次階層の見出し数を数える
 */
function countNextLevel(node) {
  return Array.isArray(node.children) ? node.children.length : 0;
}

/**
 * 単一ノードの数整合性チェック
 */
function checkNumberConsistency(node) {
  const required = extractRequiredCount(node.title);
  if (!required) return null;

  const actual = countNextLevel(node);
  if (actual < required) {
    return `「${node.title}」は最低 ${required} 個の下位見出しが必要ですが、実際は ${actual} 個です。`;
  }
  return null;
}

/**
 * 再帰ウォーク
 */
function walk(node, errors) {
  const err = checkNumberConsistency(node);
  if (err) errors.push(err);

  if (node.children) {
    node.children.forEach(child => walk(child, errors));
  }
}

/**
 * 構造バリデーション本体
 */
export function validateStructure(structure, keyword) {
    if (!Array.isArray(structure)) {
      throw new Error("validateStructure: structure must be h2 array");
    }

  const errors = [];

  const minH2 = 7;
  const minH3 = 16;

  // h2数
  if (structure.length < minH2) {
    errors.push(`h2 が ${minH2} 個未満です。（現在 ${structure.length} 個）`);
  }

  // h3総数
  const h3Count = structure.reduce(
    (sum, h2) => sum + (h2.children?.length ?? 0),
    0
  );
  if (h3Count < minH3) {
    errors.push(`h3 が ${minH3} 個未満です。（現在 ${h3Count} 個）`);
  }

  // 最初のh2にキーワードが含まれるか
  const firstTitle = structure[0]?.title ?? "";
  const kwWords = String(keyword).split(/\s+/).filter(Boolean);

  const containsKw = kwWords.some(k =>
    firstTitle.slice(0, 15).includes(k)
  );
  if (!containsKw) {
    errors.push("最初の h2 タイトルの前半にキーワードが含まれていません。");
  }

  // 数チェック（h2 / h3 / h4 / h5 全部）
  structure.forEach(h2 => walk(h2, errors));

  return errors;
}
