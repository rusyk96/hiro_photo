
import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    this.lastPreset = null;
  }

  /**
   * Единый билдер Bento-рядов для десктопа и мобилки
   */
  buildNextRow(landscapes, portraits) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    const possiblePresets = [];

    // 🎯 1. Смешанный сценарий: 1 HL (8 col) + 1 VS (4 col)
    if (landscapes.length >= 1 && portraits.length >= 1) {
      possiblePresets.push('HL_VS', 'VS_HL');
    }

    // 🎯 2. Смешанный сценарий: Стопка 2 HS (4 col) + 2 VL (8 col)
    if (landscapes.length >= 2 && portraits.length >= 2) {
      possiblePresets.push('STACK2HS_2VL', '2VL_STACK2HS');
    }

    // 🎯 3. Чисто ГОРИЗОНТАЛЬНЫЙ сценарий: Стопка 2 HS (4 col) + 1 HL (8 col)
    if (landscapes.length >= 3) {
      possiblePresets.push('STACK2HS_HL', 'HL_STACK2HS');
    }

    // Выбор пресета с защитой от дублей подряд
    let candidates = possiblePresets;
    if (candidates.length > 1 && this.lastPreset) {
      candidates = candidates.filter(p => p !== this.lastPreset);
    }

    if (candidates.length > 0) {
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastPreset = selected;
      return this._renderPreset(selected, landscapes, portraits);
    }

    // Если фоток осталось меньше, чем нужно для целого блока — забираем хвост
    return this._renderTail(landscapes, portraits);
  }

  _renderPreset(preset, landscapes, portraits) {
    switch (preset) {
      // --- 1 HL + 1 VS ---
      case 'HL_VS': {
        const l = landscapes.splice(0, 1)[0];
        const p = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-hl">${createCardHtml(l)}</div>
            <div class="atom-vs">${createCardHtml(p)}</div>
          </div>`;
      }

      case 'VS_HL': {
        const p = portraits.splice(0, 1)[0];
        const l = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-vs">${createCardHtml(p)}</div>
            <div class="atom-hl">${createCardHtml(l)}</div>
          </div>`;
      }

      // --- Стопка 2 HS + Большая HL ---
      case 'STACK2HS_HL': {
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        const hl = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
            <div class="atom-hl">${createCardHtml(hl)}</div>
          </div>`;
      }

      // --- ЗЕРКАЛО: Большая HL + Стопка 2 HS ---
      case 'HL_STACK2HS': {
        const hl = landscapes.splice(0, 1)[0];
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-hl">${createCardHtml(hl)}</div>
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
          </div>`;
      }

      // --- Стопка 2 HS + 2 VL ---
      case 'STACK2HS_2VL': {
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        const vl1 = portraits.splice(0, 1)[0];
        const vl2 = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
            <div class="atom-vs">${createCardHtml(vl1)}</div>
            <div class="atom-vs">${createCardHtml(vl2)}</div>
          </div>`;
      }

      case '2VL_STACK2HS': {
        const vl1 = portraits.splice(0, 1)[0];
        const vl2 = portraits.splice(0, 1)[0];
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-vs">${createCardHtml(vl1)}</div>
            <div class="atom-vs">${createCardHtml(vl2)}</div>
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
          </div>`;
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

    const cards = remain.map(item => `
      <div class="${item.isPortrait ? 'atom-vs' : 'atom-hl'}">
        ${createCardHtml(item)}
      </div>
    `).join('');

    return `<div class="bento-atom-grid mode-tail">${cards}</div>`;
  }
}