import { createCardHtml } from './bento-helpers.js';

eimport { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    this.lastMode = null;
  }

  renderMobile(photo) {
    return createCardHtml(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    // 🎯 АТОМ 1: Combo (1 Landscape + 2 Portraits)
    if (landscapes.length >= 1 && portraits.length >= 2) {
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

    // 🎯 АТОМ 2: 4 Портрета в ряд (4 Portraits)
    if (portraits.length >= 4) {
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

    // 🎯 АТОМ 3: 3 Горизонтали в ряд (3 Landscapes)
    if (landscapes.length >= 3) {
      const l = landscapes.splice(0, 3);
      return `
        <div class="bento-atom-grid mode-3-landscapes">
          <div class="atom-item">${createCardHtml(l[0])}</div>
          <div class="atom-item">${createCardHtml(l[1])}</div>
          <div class="atom-item">${createCardHtml(l[2])}</div>
        </div>
      `;
    }

    // 🎯 4. ХВОСТ (Когда осталось < 3 фото)
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