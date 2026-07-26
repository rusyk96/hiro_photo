import { createCardHtml } from '../bento-helpers.js';

export function renderPattern5(p1, p2, p3, big1) {
  // Если передано 3 кадра слева — один вариант, если 2 — другой
  const leftStack = p3 
    ? `${createCardHtml(p1)}${createCardHtml(p2)}${createCardHtml(p3)}`
    : `${createCardHtml(p1)}${createCardHtml(p2)}`;

  return `
    <div class="bento-row pattern-5">
      <div class="col-left sub-stack">
        ${leftStack}
      </div>
      <div class="col-right main-accent">
        ${createCardHtml(big1)}
      </div>
    </div>
  `;
}