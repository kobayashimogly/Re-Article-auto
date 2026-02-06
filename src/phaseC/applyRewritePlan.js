// src/phaseC/applyRewritePlan.js

export function applyRewritePlan(structure, plan) {
    const cloned = JSON.parse(JSON.stringify(structure));
  
    for (const action of plan.actions) {
      switch (action.type) {
  
        // =====================
        // h2 タイトル変更
        // =====================
        case "rename_h2": {
          const h2 = cloned.find(b => b.title === action.target);
          if (h2) h2.title = action.title;
          break;
        }
  
        // =====================
        // h2 追加
        // =====================
        case "add_h2": {
          const newH2 = {
            level: "h2",
            title: action.title,
            body: "",
            children: action.children?.map(c => ({
              level: "h3",
              title: c.title,
              body: "",
              children: []
            })) || []
          };
  
          if (action.position?.after_h2) {
            const idx = cloned.findIndex(
              b => b.title === action.position.after_h2
            );
            cloned.splice(idx + 1, 0, newH2);
          } else {
            cloned.push(newH2);
          }
          break;
        }
  
        // =====================
        // h3 追加
        // =====================
        case "add_h3": {
          const h2 = cloned.find(b => b.title === action.target_h2);
          if (h2) {
            h2.children.push({
              level: "h3",
              title: action.title,
              body: "",
              children: []
            });
          }
          break;
        }
  
        // =====================
        // h4 追加
        // =====================
        case "add_h4": {
          for (const h2 of cloned) {
            const h3 = h2.children?.find(c => c.title === action.target);
            if (h3) {
              h3.children = h3.children || [];
              h3.children.push({
                level: "h4",
                title: action.title,
                body: "",
                children: []
              });
            }
          }
          break;
        }
  
        // =====================
        // h3 並び替え（最低限）
        // =====================
        case "reorder_h3": {
          const h2 = cloned.find(b => b.title === action.target_h2);
          if (!h2) break;
  
          const idx = h2.children.findIndex(c => c.title === action.title);
          if (idx === -1) break;
  
          const [item] = h2.children.splice(idx, 1);
  
          if (action.position?.before_h3) {
            const targetIdx = h2.children.findIndex(
              c => c.title === action.position.before_h3
            );
            h2.children.splice(targetIdx, 0, item);
          } else {
            h2.children.push(item);
          }
          break;
        }
  
        default:
          console.warn("⚠️ 未対応 action:", action.type);
      }
    }
  
    return cloned;
  }
  