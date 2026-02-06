export function applyStructureActions(article, actions) {
    for (const act of actions) {
      if (act.type === "add_h2") {
        article.sections.push({
          level: "h2",
          title: act.title,
          body: "",
          children: []
        });
      }
  
      if (act.type === "add_h3") {
        const parent = article.sections.find(
          s => s.title === act.parent
        );
        if (!parent) continue;
  
        parent.children.push({
          level: "h3",
          title: act.title,
          body: "",
          children: []
        });
      }
    }
  }
  