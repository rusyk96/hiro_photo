import { 
  renderPattern1, 
  renderPattern2, 
  renderPattern3 
} from '../../../../Component_Based_Design/focus_component/galerey/bento_grid/patterns/index_patterns.js';
import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  renderMobile(photo) {
    return createCardHtml(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    if (landscapes.length === 0 && portraits.length === 0) {
      return null;
    }

    // 🎯 1. Pattern 2 (6 горизонталей)
    if (landscapes.length >= 6) {
      const h_top = landscapes.splice(0, 2); // массив из 2 шт
      const h_big1 = landscapes.splice(0, 1)[0];
      const h_big2 = landscapes.splice(0, 1)[0];
      const h_bot = landscapes.splice(0, 2); // массив из 2 шт
      return renderPattern2(h_top, h_big1, h_big2, h_bot);
    }

    // 🎯 2. Pattern 3 (4 горизонтали + 1 портрет)
    if (landscapes.length >= 4 && portraits.length >= 1) {
      const h_top = landscapes.splice(0, 2); // массив из 2 шт
      const h_big1 = landscapes.splice(0, 1)[0];
      const h_big2 = landscapes.splice(0, 1)[0];
      const p1 = portraits.splice(0, 1)[0];
      return renderPattern3(h_top, h_big1, h_big2, p1);
    }

    // 🎯 3. Pattern 1 (3 горизонтали + 1 портрет)
    if (landscapes.length >= 3 && portraits.length >= 1) {
      const p1 = portraits.splice(0, 1)[0];
      const h1 = landscapes.splice(0, 1)[0];
      const h2 = landscapes.splice(0, 1)[0];
      const h3_stack = landscapes.splice(0, 2); // массив из 2 шт!
      return renderPattern1(p1, h1, h2, h3_stack);
    }

    // 4. Фоллбэк: если фоток осталось мало и под паттерны не хватает
    const remain = [...landscapes, ...portraits];
    landscapes.length = 0;
    portraits.length = 0;

    if (remain.length > 0) {
      const cardsHtml = remain.map(p => createCardHtml(p)).join('');
      return `<div class="bento-row bento-tail-wrapper">${cardsHtml}</div>`;
    }

    return null;
  }
}