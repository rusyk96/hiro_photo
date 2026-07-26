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
    if (landscapes.length === 0 && portraits.length === 0) {
      return null;
    }

    // 🎯 1. Собираем пул доступных стандартных паттернов
    const availablePatterns = [];

    // Pattern 1 (3 L + 1 P)
    if (landscapes.length >= 3 && portraits.length >= 1) availablePatterns.push(1);
    // Pattern 2 (6 L)
    if (landscapes.length >= 6) availablePatterns.push(2);
    // Pattern 3 (4 L + 1 P)
    if (landscapes.length >= 4 && portraits.length >= 1) availablePatterns.push(3);

    // Если есть стандартные паттерны — крутим их через рандом без повторов
    if (availablePatterns.length > 0) {
      let candidates = availablePatterns;
      if (candidates.length > 1 && this.lastPatternIndex !== null) {
        candidates = candidates.filter(p => p !== this.lastPatternIndex);
      }

      const selectedPattern = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastPatternIndex = selectedPattern;

      return this._renderSelectedPattern(selectedPattern, landscapes, portraits);
    }

    // 🎯 2. ВЫГРЕБАЮЩИЙ РЕЖИМ (Если один из типов кадров закончился)

    // Если портреты кончились, но есть хотя бы 3-5 пейзажей — строим Pattern 2
    if (landscapes.length >= 6) {
      this.lastPatternIndex = 2;
      return this._renderSelectedPattern(2, landscapes, portraits);
    }

    // Если остался 1 портрет и хотя бы 3 пейзажа — насильно собираем Pattern 1
    if (portraits.length >= 1 && landscapes.length >= 3) {
      this.lastPatternIndex = 1;
      return this._renderSelectedPattern(1, landscapes, portraits);
    }

    // 🎯 3. ФОЛЛБЭК ХВОСТА (Вызывается ТОЛЬКО когда реально осталось < 3-4 фото)
    return this._renderTail(landscapes, portraits);
  }

  _renderSelectedPattern(patternId, landscapes, portraits) {
    switch (patternId) {
      case 1: { // Pattern 1: 3 L + 1 P
        const p1 = portraits.splice(0, 1)[0];
        const h1 = landscapes.splice(0, 1)[0];
        const h2 = landscapes.splice(0, 1)[0];
        const h3_stack = landscapes.splice(0, 2);
        return renderPattern1(p1, h1, h2, h3_stack);
      }

      case 2: { // Pattern 2: 6 L
        const h_top = landscapes.splice(0, 2);
        const h_big1 = landscapes.splice(0, 1)[0];
        const h_big2 = landscapes.splice(0, 1)[0];
        const h_bot = landscapes.splice(0, 2);
        return renderPattern2(h_top, h_big1, h_big2, h_bot);
      }

      case 3: { // Pattern 3: 4 L + 1 P
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