import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    this.history = [];
  }

  renderMobile(photo) {
    return createCardHtml(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    const possiblePresets = [];

    // 🎯 ПРАВИЛО 1: 1 Большой + 1 Малый (HL + HS = 8 + 4 col)
    if (landscapes.length >= 2) {
      possiblePresets.push('HL_HS', 'HS_HL');
    }

    // 🎯 ПРАВИЛО 2: 1 Большой + 2 Малых (HL + VS + VS = 6 + 3 + 3 col)
    if (landscapes.length >= 1 && portraits.length >= 2) {
      possiblePresets.push('HL_2VS', '2VS_HL');
    }

    // 🎯 Вспомогательные моно-блочные комбинации
    if (portraits.length >= 4) possiblePresets.push('4_VS'); // 4 малых вертикали
    if (portraits.length >= 2) possiblePresets.push('2_VL'); // 2 больших вертикали
    if (landscapes.length >= 3) possiblePresets.push('3_HS'); // 3 малых горизонтали

    // Выбор пресета без 3 повторов подряд
    if (possiblePresets.length > 0) {
      let filtered = possiblePresets;
      const last = this.history[this.history.length - 1];
      const secondLast = this.history[this.history.length - 2];

      if (last && last === secondLast) {
        filtered = possiblePresets.filter(p => p !== last);
      }

      if (filtered.length === 0) filtered = possiblePresets;

      const selected = filtered[Math.floor(Math.random() * filtered.length)];

      this.history.push(selected);
      if (this.history.length > 5) this.history.shift();

      return this._renderPreset(selected, landscapes, portraits);
    }

    return this._renderTail(landscapes, portraits);
  }

  _renderPreset(preset, landscapes, portraits) {
    switch (preset) {
      // --- ПРАВИЛО: 1 Большой + 1 Малый ---
      case 'HL_HS': { // [Большой HL] + [Малый HS]
        const l1 = landscapes.splice(0, 1)[0];
        const l2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-hl">${createCardHtml(l1)}</div>
            <div class="atom-hs">${createCardHtml(l2)}</div>
          </div>`;
      }

      case 'HS_HL': { // [Малый HS] + [Большой HL]
        const l1 = landscapes.splice(0, 1)[0];
        const l2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-hs">${createCardHtml(l1)}</div>
            <div class="atom-hl">${createCardHtml(l2)}</div>
          </div>`;
      }

      // --- ПРАВИЛО: 1 Большой + 2 Малых ---
      case 'HL_2VS': { // [Большой HL] + [Малый VS] + [Малый VS]
        const l1 = landscapes.splice(0, 1)[0];
        const p1 = portraits.splice(0, 1)[0];
        const p2 = portraits.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-hl-2vs">
            <div class="atom-hl">${createCardHtml(l1)}</div>
            <div class="atom-vs">${createCardHtml(p1)}</div>
            <div class="atom-vs">${createCardHtml(p2)}</div>
          </div>`;
      }

      case '2VS_HL': { // [Малый VS] + [Малый VS] + [Большой HL]
        const p1 = portraits.splice(0, 1)[0];
        const p2 = portraits.splice(0, 1)[0];
        const l1 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid mode-hl-2vs">
            <div class="atom-vs">${createCardHtml(p1)}</div>
            <div class="atom-vs">${createCardHtml(p2)}</div>
            <div class="atom-hl">${createCardHtml(l1)}</div>
          </div>`;
      }

      // --- Остальные вспомогательные комбинации ---
      case '4_VS': {
        const p = portraits.splice(0, 4);
        return `
          <div class="bento-atom-grid">
            <div class="atom-vs">${createCardHtml(p[0])}</div>
            <div class="atom-vs">${createCardHtml(p[1])}</div>
            <div class="atom-vs">${createCardHtml(p[2])}</div>
            <div class="atom-vs">${createCardHtml(p[3])}</div>
          </div>`;
      }

      case '2_VL': {
        const p = portraits.splice(0, 2);
        return `
          <div class="bento-atom-grid">
            <div class="atom-vl">${createCardHtml(p[0])}</div>
            <div class="atom-vl">${createCardHtml(p[1])}</div>
          </div>`;
      }

      case '3_HS': {
        const l = landscapes.splice(0, 3);
        return `
          <div class="bento-atom-grid">
            <div class="atom-hs">${createCardHtml(l[0])}</div>
            <div class="atom-hs">${createCardHtml(l[1])}</div>
            <div class="atom-hs">${createCardHtml(l[2])}</div>
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
      <div class="${item.isPortrait ? 'atom-vs' : 'atom-hs'}">
        ${createCardHtml(item)}
      </div>
    `).join('');

    return `<div class="bento-atom-grid mode-tail">${cards}</div>`;
  }
}