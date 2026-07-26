import { createCardHtml } from '../bento-helpers.js';

export function renderPattern6(big1, p1, p2, p3) {
  return `
    <div class="bento-row pattern-6">
      <div class="col-left main-accent">
        ${createCardHtml(big1)}
      </div>
      <div class="col-right sub-stack-3">
        ${createCardHtml(p1)}
        ${createCardHtml(p2)}
        ${createCardHtml(p3)}
      </div>
    </div>
  `;
}