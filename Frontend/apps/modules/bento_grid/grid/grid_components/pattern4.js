import { createCardHtml } from '../bento-helpers.js';

export function renderPattern4(p1, p2, p3, big1) {
  return `
    <div class="bento-row pattern-4">
      <div class="col-left sub-stack-3">
        ${createCardHtml(p1)}
        ${createCardHtml(p2)}
        ${createCardHtml(p3)}
      </div>
      <div class="col-right main-accent">
        ${createCardHtml(big1)}
      </div>
    </div>
  `;
}