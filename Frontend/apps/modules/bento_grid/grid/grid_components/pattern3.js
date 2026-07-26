import { createCardHtml } from '../bento-helpers.js';

export function renderPattern3(p1, p2, h1, h2, p3) {
  return `
    <div class="bento-row pattern-3">
      <div class="bento-top">
        <div class="col-left sub-stack">
          ${createCardHtml(p1)}
          ${createCardHtml(p2)}
        </div>
        <div class="col-right">${createCardHtml(h1)}</div>
      </div>
      <div class="bento-bottom">
        <div class="col-left">${createCardHtml(h2)}</div>
        <div class="col-right">${createCardHtml(p3)}</div>
      </div>
    </div>
  `;
}