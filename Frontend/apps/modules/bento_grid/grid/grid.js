import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    this.lastAtomType = null;
  }

  renderMobile(photo) {
    return createCardHtml(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    // 🎯 1. Собираем пул ВСЕХ доступных атомов прямо сейчас
    const availableAtoms = [];

    // Атом "Combo Left" (1 L + 2 P) — Герой слева
    // Атом "Combo Right" (2 P + 1 L) — Герой справа
    if (landscapes.length >= 1 && portraits.length >= 2) {
      availableAtoms.push('combo-left', 'combo-right');
    }

    // Атом "4 Портрета"
    if (portraits.length >= 4) {
      availableAtoms.push('4-portraits');
    }

    // Атом "3 Горизонтали"
    if (landscapes.length >= 3) {
      availableAtoms.push('3-landscapes');
    }

    // 🎯 2. Если есть из чего выбирать — выбираем РАНДОМНО (без дублей подряд)
    if (availableAtoms.length > 0) {
      let candidates = availableAtoms;
      
      // Не повторяем один и тот же тип атома два раза подряд
      if (candidates.length > 1 && this.lastAtomType !== null) {
        candidates = candidates.filter(type => type !== this.lastAtomType);
      }

      const selectedType = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastAtomType = selectedType;

      return this._renderSelectedAtom(selectedType, landscapes, portraits);
    }

    // 🎯 3. Выгребающие фоллбэки (когда идеальный пул пуст, но фото еще есть)
    if (landscapes.length >= 1 && portraits.length >= 1) {
      // Спасательный комбо из 1L и 1P
      const l = landscapes.splice(0, 1)[0];
      const p = portraits.splice(0, 1)[0];
      return `
        <div class="bento-atom-grid mode-combo-hero-l">
          <div class="atom-hero">${createCardHtml(l)}</div>
          <div class="atom-sub" style="grid-column: span 4;">${createCardHtml(p)}</div>
        </div>
      `;
    }

    // 🎯 4. ХВОСТ (финиш на 1-2 оставшихся кадра)
    return this._renderTail(landscapes, portraits);
  }

  _renderSelectedAtom(type, landscapes, portraits) {
    switch (type) {
      case 'combo-left': { // 1 Горизонталь слева (8), 2 Портрета справа (2 + 2)
        const l1 = landscapes.splice(0, 1)[0];
        const p1 = portraits.splice(0, 1)[0];
        const p2 = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-combo-hero-l">
            <div class="atom-hero">${createCardHtml(l1)}</div>
            <div class="atom-sub">${createCardHtml(p1)}</div>
            <div class="atom-sub">${createCardHtml(p2)}</div>
          </div>
        `;
      }

      case 'combo-right': { // 2 Портрета слева (2 + 2), 1 Горизонталь справа (8)
        const p1 = portraits.splice(0, 1)[0];
        const p2 = portraits.splice(0, 1)[0];
        const l1 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-combo-hero-r">
            <div class="atom-sub">${createCardHtml(p1)}</div>
            <div class="atom-sub">${createCardHtml(p2)}</div>
            <div class="atom-hero">${createCardHtml(l1)}</div>
          </div>
        `;
      }

      case '4-portraits': {
        const p = portraits.splice(0, 4);
        return `
          <div class="bento-atom-grid mode-4-portraits">
            <div class="atom-item">${createCardHtml(p[0])}</div>
            <div class="atom-item">${createCardHtml(p[1])}</div>
            <div class="atom-item">${createCardHtml(p[2])}</div>
            <div class="atom-item">${createCardHtml(p[3])}</div>
          </div>
        `;
      }

      case '3-landscapes': {
        const l = landscapes.splice(0, 3);
        return `
          <div class="bento-atom-grid mode-3-landscapes">
            <div class="atom-item">${createCardHtml(l[0])}</div>
            <div class="atom-item">${createCardHtml(l[1])}</div>
            <div class="atom-item">${createCardHtml(l[2])}</div>
          </div>
        `;
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

    const cardsHtml = remain.map(item => `
      <div class="atom-item ${item.isPortrait ? 'is-portrait' : 'is-landscape'}">
        ${createCardHtml(item)}
      </div>
    `).join('');

    return `<div class="bento-atom-grid mode-tail" data-count="${remain.length}">${cardsHtml}</div>`;
  }
}