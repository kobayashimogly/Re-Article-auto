// src/spanMarker.js

// <span class="yellow">text</span> → [[YELLOW]]text[[/YELLOW]]
export function spanToMarker(html) {
    return html.replace(
      /<span\s+class=["']yellow["']>([\s\S]*?)<\/span>/g,
      '[[YELLOW]]$1[[/YELLOW]]'
    );
  }
  
  // [[YELLOW]]text[[/YELLOW]] → <span class="yellow">text</span>
  export function markerToSpan(text) {
    return text
      .replace(/\[\[YELLOW\]\]/g, '<span class="yellow">')
      .replace(/\[\[\/YELLOW\]\]/g, '</span>');
  }
  