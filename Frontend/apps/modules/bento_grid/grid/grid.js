import { 
  renderPattern1, 
  renderPattern2, 
  renderPattern3 
} from '../../../../Component_Based_Design/focus_component/galerey/bento_grid/patterns/index_patterns.js';
import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    this.lastPatternIndex = null;
  }

  renderMobile(photo) {
    return createCardHtml(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    const totalRemaining = landscapes.length + portraits.length;
    if (totalRemaining === 0) return null;

    // 🎯 1. Проверяем полные стандартные паттерны
    const availablePatterns = [];
    if (landscapes.length >= 3 && portraits.length >= 1) availablePatterns.push(1);
    if (landscapes.length >= 6) availablePatterns.push(2);
    if (landscapes.length >= 4 && portraits.length >= 1) availablePatterns.push(3);

    if (availablePatterns.length > 0) {
      let candidates = availablePatterns;
      if (candidates.length > 1 && this.lastPatternIndex !== null) {
        candidates = candidates.filter(p => p !== this.lastPatternIndex);
      }
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastPatternIndex = selected;
      return this._renderSelectedPattern(selected, landscapes, portraits);
    }

    // 🎯 2. ГИБКИЙ РЕЖИМ (Если идеальные паттерны не собрались, но фото еще МНОГО)
    
    // Если есть хотя бы 1 портрет и 2-3 горизонтали -> собираем Pattern 1, дублируя горизонталь в стек
    if (portraits.length >= 1 && landscapes.length >= 2) {
      const p1 = portraits.splice(0, 1)[0];
      const h1 = landscapes.splice(0, 1)[0];
      const h2 = landscapes.splice(0, 1)[0];
      // Если 3-й горизонтали нет, берем h2 как вторую в стек, чтобы HTML не ломался
      const h3_second = landscapes.length > 0 ? landscapes.splice(0, 1)[0] : h2; 
      this.lastPatternIndex = 1;
      return renderPattern1(p1, h1, h2, [h2, h3_second]);
    }

    // Если портретов нет, но горизонталей от 3 до 5 -> делаем адаптивную сборку Pattern 2
    if (landscapes.length >= 3) {
      const h_top = [landscapes.splice(0, 1)[0], landscapes.splice(0, 1)[0]];
      const h_big1 = landscapes.splice(0, 1)[0];
      const h_big2 = landscapes.length > 0 ? landscapes.splice(0, 1)[0] : h_big1;
      const h_bot = landscapes.length >= 2 
        ? [landscapes.splice(0, 1)[0], landscapes.splice(0, 1)[0]] 
        : [h_big1, h_big2];

      this.lastPatternIndex = 2;
      return renderPattern2(h_top, h_big1, h_big2, h_bot);
    }

    // 🎯 3. СТРОГИЙ ФОЛЛБЭК (Срабатывает ТОЛЬКО на финише, когда осталось 1-2 фото)
    return this._renderTail(landscapes, portraits);
  }

  _renderSelectedPattern(patternId, landscapes, portraits) {
    switch (patternId) {
      case 1: {
        const p1 = portraits.splice(0, 1)[0];
        const h1 = landscapes.splice(0, 1)[0];
        const h2 = landscapes.splice(0, 1)[0];
        const h3_stack = landscapes.splice(0, 2);
        return renderPattern1(p1, h1, h2, h3_stack);
      }
      case 2: {
        const h_top = landscapes.splice(0, 2);
        const h_big1 = landscapes.splice(0, 1)[0];
        const h_big2 = landscapes.splice(0, 1)[0];
        const h_bot = landscapes.splice(0, 2);
        return renderPattern2(h_top, h_big1, h_big2, h_bot);
      }
      case 3: {
        const h_top = landscapes.splice(0, 2);
        const h_big1 = landscapes.splice(0, 1)[0];
        const h_big2 = landscapes.splice(0, 1)[0];
        const p1 = portraits.splice(0, 1)[0];
        return renderPattern3(h_top, h_big1, h_big2, p1);
      }
      default:
        return null;
    }
  }

  _renderTail(landscapes, portraits) {
    const remain = [...landscapes, ...portraits];
    landscapes.length = 0;
    portraits.length = 0;

    if (remain.length === 0) return null;

    const cardsHtml = remain.map(p => {
      const ratioClass = p.isPortrait ? 'tail-portrait' : 'tail-landscape';
      return `
        <div class="bento-tail-item ${ratioClass}">
          ${createCardHtml(p)}
        </div>
      `;
    }).join('');

    return `<div class="bento-row bento-tail-grid" data-count="${remain.length}">${cardsHtml}</div>`;
  }
}