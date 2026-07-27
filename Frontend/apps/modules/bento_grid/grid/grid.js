import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    this.lastPreset = null;
  }

  /**
   * 🧱 Генерирует сразу весь массив готовых HTML-рядов для альбома (один раз на старте!)
   */
  generateFullGrid(items, isMobile = false) {
    // Делим исходные элементы на ландшафты и портреты с сохранением оригинальных индексов
    const landscapes = items
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter(item => !item.isPortrait);

    const portraits = items
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter(item => item.isPortrait);

    const rowsHtml = [];
    let isFirstRow = true;

    while (landscapes.length > 0 || portraits.length > 0) {
      let rowHtml = null;

      if (isMobile) {
        rowHtml = this.buildNextMobileRow(landscapes, portraits, isFirstRow);
      } else {
        rowHtml = this.buildNextDesktopRow(landscapes, portraits, isFirstRow);
      }

      if (rowHtml) {
        rowsHtml.push(rowHtml);
        isFirstRow = false;
      } else {
        break;
      }
    }

    return rowsHtml.join('');
  }

  // ==========================================
  // 📱 МОБИЛЬНЫЙ ГЕНЕРАТОР (Строго 2 колонки)
  // ==========================================
  buildNextMobileRow(landscapes, portraits, isFirstRow = false) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    if (isFirstRow) {
      if (landscapes.length > 0 && (!portraits.length || landscapes[0].originalIndex < portraits[0].originalIndex)) {
        const hero = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-mobile mode-hero">
            <div class="atom-hl">${createCardHtml(hero)}</div>
          </div>`;
      }
    }

    const possiblePresets = [];

    if (portraits.length >= 2) {
      possiblePresets.push('2VS');
    }
    if (landscapes.length >= 2 && portraits.length >= 1) {
      possiblePresets.push('STACK2HS_VS', 'VS_STACK2HS');
    }
    if (landscapes.length >= 1) {
      possiblePresets.push('1HL');
    }

    let candidates = possiblePresets;
    if (candidates.length > 1 && this.lastPreset) {
      candidates = candidates.filter(p => p !== this.lastPreset);
    }

    if (candidates.length > 0) {
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastPreset = selected;
      return this._renderMobilePreset(selected, landscapes, portraits);
    }

    return this._renderTail(landscapes, portraits);
  }

  _renderMobilePreset(preset, landscapes, portraits) {
    switch (preset) {
      case '2VS': {
        const p1 = portraits.splice(0, 1)[0];
        const p2 = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-mobile">
            <div class="atom-vs">${createCardHtml(p1)}</div>
            <div class="atom-vs">${createCardHtml(p2)}</div>
          </div>`;
      }
      case 'STACK2HS_VS': {
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        const p = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-mobile">
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
            <div class="atom-vs">${createCardHtml(p)}</div>
          </div>`;
      }
      case 'VS_STACK2HS': {
        const p = portraits.splice(0, 1)[0];
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-mobile">
            <div class="atom-vs">${createCardHtml(p)}</div>
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
          </div>`;
      }
      case '1HL': {
        const l = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-mobile">
            <div class="atom-hl">${createCardHtml(l)}</div>
          </div>`;
      }
      default:
        return null;
    }
  }

  // ==========================================
  // 💻 ДЕСКТОПНЫЙ ГЕНЕРАТОР (12 колонок)
  // ==========================================
  buildNextDesktopRow(landscapes, portraits, isFirstRow = false) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    if (isFirstRow) {
      if (landscapes.length > 0 && (!portraits.length || landscapes[0].originalIndex < portraits[0].originalIndex)) {
        const hero = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-desktop mode-hero">
            <div class="atom-hl" style="grid-column: span 12;">${createCardHtml(hero)}</div>
          </div>`;
      }
    }

    const possiblePresets = [];

    if (landscapes.length >= 1 && portraits.length >= 1) {
      possiblePresets.push('HL_VS', 'VS_HL');
    }
    if (landscapes.length >= 2 && portraits.length >= 2) {
      possiblePresets.push('STACK2HS_2VL', '2VL_STACK2HS');
    }
    if (landscapes.length >= 3) {
      possiblePresets.push('STACK2HS_HL', 'HL_STACK2HS');
    }

    let candidates = possiblePresets;
    if (candidates.length > 1 && this.lastPreset) {
      candidates = candidates.filter(p => p !== this.lastPreset);
    }

    if (candidates.length > 0) {
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      this.lastPreset = selected;
      return this._renderDesktopPreset(selected, landscapes, portraits);
    }

    return this._renderTail(landscapes, portraits);
  }

  _renderDesktopPreset(preset, landscapes, portraits) {
    switch (preset) {
      case 'HL_VS': {
        const l = landscapes.splice(0, 1)[0];
        const p = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-desktop">
            <div class="atom-hl">${createCardHtml(l)}</div>
            <div class="atom-vs">${createCardHtml(p)}</div>
          </div>`;
      }
      case 'VS_HL': {
        const p = portraits.splice(0, 1)[0];
        const l = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-desktop">
            <div class="atom-vs">${createCardHtml(p)}</div>
            <div class="atom-hl">${createCardHtml(l)}</div>
          </div>`;
      }
      case 'STACK2HS_HL': {
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        const hl = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-desktop">
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
            <div class="atom-hl">${createCardHtml(hl)}</div>
          </div>`;
      }
      case 'HL_STACK2HS': {
        const hl = landscapes.splice(0, 1)[0];
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-desktop">
            <div class="atom-hl">${createCardHtml(hl)}</div>
            <div class="hs-stack">
              <div class="atom-hs">${createCardHtml(hs1)}</div>
              <div class="atom-hs">${createCardHtml(hs2)}</div>
            </div>
          </div>`;
      }
      case 'STACK2HS_2VL': {
        const hs1 = landscapes.splice(0, 1)[0];
        const hs2 = landscapes.splice(0, 1)[0];
        const vl1 = portraits.splice(0, 1)[0];
        const vl2 = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-desktop">
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
          <div class="bento-atom-grid mode-desktop">
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
    const remain = [...landscapes, ...portraits].sort((a, b) => a.originalIndex - b.originalIndex);
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