import { createCardHtml } from '../fantome_helpers.js';

export function renderPattern3(h1_stack, h_big1, h_big2, p1) {
  return `
    <div class="bento-row pattern-3">
      <div class="bento-top">
        <div class="col-left col-stack">
          ${createCardHtml(h1_stack[0])}
          ${createCardHtml(h1_stack[1])}
        </div>
        <div class="col-right">${createCardHtml(h_big1)}</div>
      </div>
      <div class="bento-bottom">
        <div class="col-left">${createCardHtml(h_big2)}</div>
        <div class="col-right">${createCardHtml(p1)}</div>
      </div>
    </div>
  `;
}