import { createCardHtml } from './bento-helpers.js';

export class MobileGridEngine {
  constructor() {
    this.lastPreset = null;
  }

  buildNextRow(landscapes, portraits) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    const possiblePresets = [];

    // 🎯 1. Стопка 2 HS (1 col) + 1 VS (1 col) — главный мобильный Bento-блок
    if (landscapes.length >= 2 && portraits.length >= 1) {
      possiblePresets.push('STACK2HS_VS', 'VS_STACK2HS');
    }

    // 🎯 2. Большая горизонталь на всю ширину (2 col)
    if (landscapes.length >= 1) {
      possiblePresets.push('HL_FULL');
    }

    // 🎯 3. Две вертикали в ряд (1 col + 1 col)
    if (portraits.length >= 2) {
      possiblePresets.push('TWO_VS');
    }

    // Защита от дублирования подряд
    let candidates = possiblePresets;
    if (candidates.length > 1 && this.lastPreset) {
      candidates = candidates.filter(p => p !== this.lastPreset);
    }

    if (candidates.length > 0) {
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastPreset = selected;
      return this._renderPreset(selected, landscapes, portraits);
    }

    // Добираем остатки без вылета в фоллбэки
    if (landscapes.length > 0) return this._renderPreset('HL_FULL', landscapes, portraits);
    if (portraits.length > 0) return this._renderPreset('TWO_VS', landscapes, portraits);

    return null;
  }

  _renderPreset(preset, landscapes, portraits) {
    switch (preset) {
      // Стопка 2 HS слева + 1 VS справа
      case 'STACK2HS_VS': {
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        const vs = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
            <div class="atom-vs">${createCardHtml(vs)}</div>
          </div>`;
      }

      // ЗЕРКАЛО: 1 VS слева + Стопка 2 HS справа
      case 'VS_STACK2HS': {
        const vs = portraits.splice(0, 1)[0];
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-vs">${createCardHtml(vs)}</div>
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
          </div>`;
      }

      // 1 большая горизонталь (span 2)
      case 'HL_FULL': {
        const hl = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-hl">${createCardHtml(hl)}</div>
          </div>`;
      }

      // 2 вертикали в ряд
      case 'TWO_VS': {
        const vs1 = portraits.splice(0, 1)[0] || landscapes.splice(0, 1)[0];
        const vs2 = portraits.splice(0, 1)[0] || landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-vs">${createCardHtml(vs1)}</div>
            <div class="atom-vs">${createCardHtml(vs2)}</div>
          </div>`;
      }

      default:
        return null;
    }
  }
}