// mobilePattern.js
import { createCardHtml } from '../bento-helpers.js'

export function renderMobilePattern(photo) {
  return `
    <div class="bento-mobile-row">
      ${createCardHtml(photo)}
    </div>
  `;
}