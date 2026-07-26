import { createCardHtml } from '../bento-helpers.js';

export function renderPattern1(p1, h1, h2, p2) {
  return `
    <div class="bento-row pattern-1">
      <div class="bento-top">
        <div class="col-left">${createCardHtml(p1)}</div>
        <div class="col-right">${createCardHtml(h1)}</div>
      </div>
      <div class="bento-bottom">
        <div class="col-left">${createCardHtml(h2)}</div>
        <div class="col-right">${createCardHtml(p2)}</div>
      </div>
    </div>
  `;
}