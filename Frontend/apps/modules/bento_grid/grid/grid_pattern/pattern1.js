// pattern1.js
import { createCardHtml } from '../bento-helpers.js';

export function renderPattern1(p1, h1, h2, p2) {
  return `
    <div class="bento-pattern-row bento-pattern-1">
      <div class="bento-top-group">
        <div class="bento-left-col">${createCardHtml(p1)}</div>
        <div class="bento-right-col">${createCardHtml(h1)}</div>
      </div>
      <div class="bento-bottom-group">
        <div class="bento-left-col">${createCardHtml(h2)}</div>
        <div class="bento-right-col">
          <div class="bento-sub-col">${createCardHtml(p2)}</div>
        </div>
      </div>
    </div>
  `;
}