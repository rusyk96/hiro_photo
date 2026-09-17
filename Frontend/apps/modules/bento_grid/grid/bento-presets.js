// bento-presets.js
import { createCardHtml } from './bento-helpers.js';

export const MOBILE_PRESETS = {
  '2VS': (landscapes, portraits) => {
    const p1 = portraits.splice(0, 1)[0];
    const p2 = portraits.splice(0, 1)[0];
    return `
      <div class="bento-atom-grid mode-mobile">
        <div class="atom-vs">${createCardHtml(p1)}</div>
        <div class="atom-vs">${createCardHtml(p2)}</div>
      </div>`;
  },
  'STACK2HS_VS': (landscapes, portraits) => {
    const [hs1, hs2] = landscapes.splice(0, 2);
    const p = portraits.splice(0, 1)[0];
    return `
      <div class="bento-atom-grid mode-mobile">
        <div class="hs-stack">
          <div class="atom-hs">${createCardHtml(hs1)}</div>
          <div class="atom-hs">${createCardHtml(hs2)}</div>
        </div>
        <div class="atom-vs">${createCardHtml(p)}</div>
      </div>`;
  },
  'VS_STACK2HS': (landscapes, portraits) => {
    const p = portraits.splice(0, 1)[0];
    const [hs1, hs2] = landscapes.splice(0, 2);
    return `
      <div class="bento-atom-grid mode-mobile">
        <div class="atom-vs">${createCardHtml(p)}</div>
        <div class="hs-stack">
          <div class="atom-hs">${createCardHtml(hs1)}</div>
          <div class="atom-hs">${createCardHtml(hs2)}</div>
        </div>
      </div>`;
  },
  '1HL': (landscapes) => {
    const l = landscapes.splice(0, 1)[0];
    return `
      <div class="bento-atom-grid mode-mobile">
        <div class="atom-hl">${createCardHtml(l)}</div>
      </div>`;
  }
};

export const DESKTOP_PRESETS = {
  'HL_VS': (landscapes, portraits) => {
    const l = landscapes.splice(0, 1)[0];
    const p = portraits.splice(0, 1)[0];
    return `
      <div class="bento-atom-grid mode-desktop">
        <div class="atom-hl">${createCardHtml(l)}</div>
        <div class="atom-vs">${createCardHtml(p)}</div>
      </div>`;
  },
  'VS_HL': (landscapes, portraits) => {
    const p = portraits.splice(0, 1)[0];
    const l = landscapes.splice(0, 1)[0];
    return `
      <div class="bento-atom-grid mode-desktop">
        <div class="atom-vs">${createCardHtml(p)}</div>
        <div class="atom-hl">${createCardHtml(l)}</div>
      </div>`;
  },
  'STACK2HS_HL': (landscapes) => {
    const [hs1, hs2, hl] = landscapes.splice(0, 3);
    return `
      <div class="bento-atom-grid mode-desktop">
        <div class="hs-stack">
          <div class="atom-hs">${createCardHtml(hs1)}</div>
          <div class="atom-hs">${createCardHtml(hs2)}</div>
        </div>
        <div class="atom-hl">${createCardHtml(hl)}</div>
      </div>`;
  },
  'HL_STACK2HS': (landscapes) => {
    const [hl, hs1, hs2] = landscapes.splice(0, 3);
    return `
      <div class="bento-atom-grid mode-desktop">
        <div class="atom-hl">${createCardHtml(hl)}</div>
        <div class="hs-stack">
          <div class="atom-hs">${createCardHtml(hs1)}</div>
          <div class="atom-hs">${createCardHtml(hs2)}</div>
        </div>
      </div>`;
  },
  'STACK2HS_2VL': (landscapes, portraits) => {
    const [hs1, hs2] = landscapes.splice(0, 2);
    const [vl1, vl2] = portraits.splice(0, 2);
    return `
      <div class="bento-atom-grid mode-desktop">
        <div class="hs-stack">
          <div class="atom-hs">${createCardHtml(hs1)}</div>
          <div class="atom-hs">${createCardHtml(hs2)}</div>
        </div>
        <div class="atom-vs">${createCardHtml(vl1)}</div>
        <div class="atom-vs">${createCardHtml(vl2)}</div>
      </div>`;
  },
  '2VL_STACK2HS': (landscapes, portraits) => {
    const [vl1, vl2] = portraits.splice(0, 2);
    const [hs1, hs2] = landscapes.splice(0, 2);
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
};
