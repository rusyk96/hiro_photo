import { createCardHtml } from '../bento-helpers.js';

export function renderPattern2(p1, p2, h1, h2, p3, p4) {
  return `
    <div class="bento-row pattern-2">
      <div class="bento-top">
        <div class="col-left sub-stack">
          ${createCardHtml(p1)}
          ${createCardHtml(p2)}
        </div>
        <div class="col-right">${createCardHtml(h1)}</div>
      </div>
      <div class="bento-bottom">
        <div class="col-left">${createCardHtml(h2)}</div>
        <div class="col-right sub-stack">
          ${createCardHtml(p3)}
          ${createCardHtml(p4)}
        </div>
      </div>
    </div>
  `;
}