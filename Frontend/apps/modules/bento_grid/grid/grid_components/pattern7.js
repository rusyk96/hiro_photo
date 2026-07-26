import { createCardHtml } from '../bento-helpers.js';

export function renderPattern7(big1, p1, p2, p3) {
  return `
    <div class="bento-row pattern-7">
      <div class="col-left main-accent">
        ${createCardHtml(big1)}
      </div>
      <div class="col-right sub-stack-custom">
        ${createCardHtml(p1)}
        ${createCardHtml(p2)}
        ${createCardHtml(p3)}
      </div>
    </div>
  `;
}