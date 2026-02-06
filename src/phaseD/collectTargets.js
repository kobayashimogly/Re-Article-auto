// src/phaseD/collectTargets.js
function isEmptyBody(body) {
    if (body === undefined || body === null) return true;
    if (typeof body !== "string") return false;
    return body.replace(/\s|　/g, "").length === 0;
  }
  
  export function collectTargets(sections) {
    const targets = [];
  
    function walk(node, path) {
      if (!node || typeof node !== "object") return;
  
      if (
        ["h2", "h3", "h4", "h5"].includes(node.level) &&
        isEmptyBody(node.body)
      ) {
        targets.push({
          node,
          path: [...path], // ★ 必ずコピー
        });
      }
  
      if (Array.isArray(node.children)) {
        node.children.forEach((child, i) => {
          walk(child, path.concat(["children", i]));
        });
      }
    }
  
    sections.forEach((section, i) => {
      walk(section, ["sections", i]);
    });
  
    return targets;
  }
  