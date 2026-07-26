import { renderPattern1 } from '../../../../Component_Based_Design/focus_component/galerey/bento_grid/patterns/index_patterns.js';
import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  // Напрямую отдаем HTML карточки без лишних div
  renderMobile(photo) {
    return createCardHtml(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    if (landscapes.length === 0 && portraits.length === 0) {
      return null;
    }

    // Рендерим ТОЛЬКО Pattern 1 (нужно 2 портрета и 2 ландшафта)
    if (portraits.length >= 2 && landscapes.length >= 2) {
      const p = portraits.splice(0, 2);
      const l = landscapes.splice(0, 2);
      return renderPattern1(p[0], l[0], l[1], p[1]);
    }

    // Временный фоллбэк под остатки
    const remain = [...landscapes, ...portraits];
    landscapes.length = 0;
    portraits.length = 0;

    if (remain.length > 0) {
      const cardsHtml = remain.map(p => `
        <div class="bento-tail-item">
          ${createCardHtml(p)}
        </div>
      `).join('');
      return `<div class="bento-row bento-tail-wrapper">${cardsHtml}</div>`;
    }

    return null;
  }
}