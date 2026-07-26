import { createCardHtml } from '../fantome_helpers.js';

export function renderPattern2(h1_stack, h_big1, h_big2, h2_stack) {
  return `
    <div class="bento-row pattern-2">
      <div class="bento-top">
        <div class="col-left col-stack">
          ${createCardHtml(h1_stack[0])}
          ${createCardHtml(h1_stack[1])}
        </div>
        <div class="col-right">${createCardHtml(h_big1)}</div>
      </div>
      <div class="bento-bottom">
        <div class="col-left">${createCardHtml(h_big2)}</div>
        <div class="col-right col-stack">
          ${createCardHtml(h2_stack[0])}
          ${createCardHtml(h2_stack[1])}
        </div>
      </div>
    </div>
  `;
}