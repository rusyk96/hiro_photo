import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    this.history = []; // История последних сыгравших пресетов
  }

  renderMobile(photo) {
    return createCardHtml(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    // 🎯 Собираем список допустимых комбинаций на основе доступных фото
    const possiblePresets = [];

    // Пресет A: [HL] + [VS] + [VS]  (18/10 + две вертикалки 3/4) -> (8 col + 3 col + 3 col = не влазит, верный счет: 8 + 2 + 2... ой, у нас VS = 3 col)
    // Корректная математика на 12 колонок:
    // Combo 1: HL (8 col) + VS (3 col) -- нужен баланс 12 col. 
    // Давай составим идеальные пресеты ровно на 12 колонок из наших 4 атомов:

    // 1. [HL + HS] -> (8 + 4 = 12 col) | Нужно: 2 Landscapes
    if (landscapes.length >= 2) possiblePresets.push('HL_HS');

    // 2. [HS + HL] -> (4 + 8 = 12 col) | Нужно: 2 Landscapes
    if (landscapes.length >= 2) possiblePresets.push('HS_HL');

    // 3. [VS + VS + VS + VS] -> (3 + 3 + 3 + 3 = 12 col) | Нужно: 4 Portraits
    if (portraits.length >= 4) possiblePresets.push('4_VS');

    // 4. [VL + VL] -> (6 + 6 = 12 col) | Нужно: 2 Portraits
    if (portraits.length >= 2) possiblePresets.push('2_VL');

    // 5. [HS + HS + HS] -> (4 + 4 + 4 = 12 col) | Нужно: 3 Landscapes
    if (landscapes.length >= 3) possiblePresets.push('3_HS');


    // 🎯 Выбираем пресет с защитой от 3 повторов подряд
    if (possiblePresets.length > 0) {
      let filtered = possiblePresets;

      // Если последний пресет повторялся уже 2 раза — БЛОКИРУЕМ ЕГО
      const last = this.history[this.history.length - 1];
      const secondLast = this.history[this.history.length - 2];

      if (last && last === secondLast) {
        filtered = possiblePresets.filter(p => p !== last);
      }

      // Если после фильтрации ничего не осталось, возвращаем исходный выбор
      if (filtered.length === 0) filtered = possiblePresets;

      // Берем случайный
      const selected = filtered[Math.floor(Math.random() * filtered.length)];
      
      // Пишем в историю (держим только последние 5)
      this.history.push(selected);
      if (this.history.length > 5) this.history.shift();

      return this._renderPreset(selected, landscapes, portraits);
    }

    // 🎯 ФОЛЛБЭК ДЛЯ ОСТАТКОВ (хвост)
    return this._renderTail(landscapes, portraits);
  }

  _renderPreset(preset, landscapes, portraits) {
    switch (preset) {
      case 'HL_HS': { // Большая L (8) + Малая L (4)
        const l1 = landscapes.splice(0, 1)[0];
        const l2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-hl">${createCardHtml(l1)}</div>
            <div class="atom-hs">${createCardHtml(l2)}</div>
          </div>`;
      }

      case 'HS_HL': { // Малая L (4) + Большая L (8)
        const l1 = landscapes.splice(0, 1)[0];
        const l2 = landscapes.splice(0, 1)[0];
        return `
          <div class="bento-atom-grid">
            <div class="atom-hs">${createCardHtml(l1)}</div>
            <div class="atom-hl">${createCardHtml(l2)}</div>
          </div>`;
      }

      case '4_VS': { // 4 Малых Портрета (3+3+3+3)
        const p = portraits.splice(0, 4);
        return `
          <div class="bento-atom-grid">
            <div class="atom-vs">${createCardHtml(p[0])}</div>
            <div class="atom-vs">${createCardHtml(p[1])}</div>
            <div class="atom-vs">${createCardHtml(p[2])}</div>
            <div class="atom-vs">${createCardHtml(p[3])}</div>
          </div>`;
      }

      case '2_VL': { // 2 Больших Портрета (6+6)
        const p = portraits.splice(0, 2);
        return `
          <div class="bento-atom-grid">
            <div class="atom-vl">${createCardHtml(p[0])}</div>
            <div class="atom-vl">${createCardHtml(p[1])}</div>
          </div>`;
      }

      case '3_HS': { // 3 Малых Горизонтали (4+4+4)
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