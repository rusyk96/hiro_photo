import { renderPattern1 

} from '../../../../Component_Based_Design/focus_component/galerey/bento_grid/patterns/index_patterns.js'; 
// (или через абсолютный путь, смотря где лежит grid.js)

export class GridEngine {
  renderMobile(photo) {
    return renderMobilePattern(photo);
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

    // Простой фоллбэк для остатков фоток, пока отлаживаем
    const remain = [...landscapes, ...portraits];
    landscapes.length = 0;
    portraits.length = 0;

    if (remain.length > 0) {
      const cardsHtml = remain.map(p => `<div class="bento-tail-item">${renderMobilePattern(p)}</div>`).join('');
      return `<div class="bento-row bento-tail-wrapper">${cardsHtml}</div>`;
    }

    return null;
  }
}