import { createCardHtml } from '../bento-helpers.js';

export function renderPattern8(big1, p1, p2) {
  return `
    <div class="bento-row pattern-8">
      <div class="col-left main-accent">
        ${createCardHtml(big1)}
      </div>
      <div class="col-right sub-stack-2">
        ${createCardHtml(p1)}
        ${createCardHtml(p2)}
      </div>
    </div>
  `;
}