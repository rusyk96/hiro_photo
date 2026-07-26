import { 
  renderPattern1, 
  renderPattern2, 
  renderPattern3 
} from '../../../../Component_Based_Design/focus_component/galerey/bento_grid/patterns/index_patterns.js';
import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    // Храним исторический трекинг, чтобы не повторять один и тот же паттерн 2 раза подряд
    this.lastPatternIndex = null;
  }

  renderMobile(photo) {
    return createCardHtml(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    if (landscapes.length === 0 && portraits.length === 0) {
      return null;
    }

    // 1. Собираем список паттернов, которые ФИЗИЧЕСКИ можно построить из текущих остатков
    const availablePatterns = [];

    // Pattern 1: нужно 3 L и 1 P
    if (landscapes.length >= 3 && portraits.length >= 1) {
      availablePatterns.push(1);
    }

    // Pattern 2: нужно 6 L
    if (landscapes.length >= 6) {
      availablePatterns.push(2);
    }

    // Pattern 3: нужно 4 L и 1 P
    if (landscapes.length >= 4 && portraits.length >= 1) {
      availablePatterns.push(3);
    }

    // 2. Выбираем паттерн из доступных с помощью псевдорандома
    if (availablePatterns.length > 0) {
      // Исключаем повторение предыдущего паттерна, если есть выбор из нескольких
      let candidates = availablePatterns;
      if (candidates.length > 1 && this.lastPatternIndex !== null) {
        candidates = candidates.filter(p => p !== this.lastPatternIndex);
      }

      // Рандомный выбор
      const selectedPattern = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastPatternIndex = selectedPattern;

      // 3. Рендерим выбранный паттерн
      return this._renderSelectedPattern(selectedPattern, landscapes, portraits);
    }

    // 4. Если под нормальные паттерны картинок не хватает — собираем аккуратный хвост (остатки)
    return this._renderTail(landscapes, portraits);
  }

  _renderSelectedPattern(patternId, landscapes, portraits) {
    switch (patternId) {
      case 1: { // 3 L + 1 P
        const p1 = portraits.splice(0, 1)[0];
        const h1 = landscapes.splice(0, 1)[0];
        const h2 = landscapes.splice(0, 1)[0];
        const h3_stack = landscapes.splice(0, 2); // 2 элемента для вертикального стека
        return renderPattern1(p1, h1, h2, h3_stack);
      }

      case 2: { // 6 L
        const h_top = landscapes.splice(0, 2);
        const h_big1 = landscapes.splice(0, 1)[0];
        const h_big2 = landscapes.splice(0, 1)[0];
        const h_bot = landscapes.splice(0, 2);
        return renderPattern2(h_top, h_big1, h_big2, h_bot);
      }

      case 3: { // 4 L + 1 P
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

    // Группируем остатки в аккуратную сетку
    const cardsHtml = remain.map(p => {
      // Определяем соотношение сторон в зависимости от типа кадра
      const ratioClass = p.isPortrait ? 'tail-portrait' : 'tail-landscape';
      return `
        <div class="bento-tail-item ${ratioClass}">
          ${createCardHtml(p)}
        </div>
      `;
    }).join('');

    // Передаем количество элементов через data-count, чтобы CSS сам выбрал идеальное число колонок
    return `<div class="bento-row bento-tail-grid" data-count="${remain.length}">${cardsHtml}</div>`;
  }
}