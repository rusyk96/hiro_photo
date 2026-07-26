import { createCardHtml } from './bento-helpers.js';

export class GridEngine {
  constructor() {
    this.lastLayoutType = null;
  }

  renderMobile(photo) {
    return createCardHtml(photo);
  }

  /**
   * Главный метод: берет фото из общего потока (один массив!) 
   * и забирает оттуда по 3–4 штуки на один атомный блок.
   */
  buildNextDesktopRow(photos) {
    if (!photos || photos.length === 0) return null;

    // 🎯 1. ХВОСТ: Если осталось 1 или 2 фото — отдаем под аккуратный финиш
    if (photos.length <= 2) {
      const tailPhotos = photos.splice(0, photos.length);
      return this._renderTailBlock(tailPhotos);
    }

    // 🎯 2. ОПРЕДЕЛЯЕМ РАЗМЕР БЛОКА (3 или 4 фото)
    // Если осталось ровно 3 или 4, берем их. Иначе случайно выбираем 3 или 4.
    let count = 3;
    if (photos.length === 4) {
      count = 4;
    } else if (photos.length > 4) {
      count = Math.random() > 0.5 ? 3 : 4;
    } else {
      count = photos.length;
    }

    const chunk = photos.splice(0, count);

    // 🎯 3. ГЕНЕРИРУЕМ АТОМАРНЫЙ БЛОК
    return this._renderAtomicBlock(chunk);
  }

  _renderAtomicBlock(photos) {
    const count = photos.length;
    
    // Доступные варианты конфигураций сетки на 12 колонок
    // p = photo (атом)
    const layouts = {
      // Блоки из 3 элементов
      3: [
        // 1 Большая (8) + 2 Маленькие (4 в стеке)
        (p) => `<div class="bento-atom-grid mode-3-hero-left">
                  <div class="atom-hero span-8">${createCardHtml(p[0])}</div>
                  <div class="atom-stack span-4">
                    <div class="atom-sub">${createCardHtml(p[1])}</div>
                    <div class="atom-sub">${createCardHtml(p[2])}</div>
                  </div>
                </div>`,
        // 2 Маленькие (4 в стеке) + 1 Большая (8)
        (p) => `<div class="bento-atom-grid mode-3-hero-right">
                  <div class="atom-stack span-4">
                    <div class="atom-sub">${createCardHtml(p[0])}</div>
                    <div class="atom-sub">${createCardHtml(p[1])}</div>
                  </div>
                  <div class="atom-hero span-8">${createCardHtml(p[2])}</div>
                </div>`,
        // 3 Равные колонки (4 + 4 + 4)
        (p) => `<div class="bento-atom-grid mode-3-equal">
                  <div class="atom-item span-4">${createCardHtml(p[0])}</div>
                  <div class="atom-item span-4">${createCardHtml(p[1])}</div>
                  <div class="atom-item span-4">${createCardHtml(p[2])}</div>
                </div>`
      ],
      // Блоки из 4 элементов
      4: [
        // 4 Равных элемента в ряд (3 + 3 + 3 + 3)
        (p) => `<div class="bento-atom-grid mode-4-equal">
                  <div class="atom-item span-3">${createCardHtml(p[0])}</div>
                  <div class="atom-item span-3">${createCardHtml(p[1])}</div>
                  <div class="atom-item span-3">${createCardHtml(p[2])}</div>
                  <div class="atom-item span-3">${createCardHtml(p[3])}</div>
                </div>`,
        // 1 Большой (6) + 3 Маленьких (2 в стеке справа + 1 снизу/рядом)
        (p) => `<div class="bento-atom-grid mode-4-asymmetric">
                  <div class="atom-hero span-6">${createCardHtml(p[0])}</div>
                  <div class="atom-item span-6 grid-sub-3">
                    <div>${createCardHtml(p[1])}</div>
                    <div>${createCardHtml(p[2])}</div>
                    <div>${createCardHtml(p[3])}</div>
                  </div>
                </div>`
      ]
    };

    const availableLayouts = layouts[count] || layouts[3];
    
    // Выбираем случайный атом, не повторяя предыдущий
    let randomIndex = Math.floor(Math.random() * availableLayouts.length);
    const selectedLayout = availableLayouts[randomIndex];

    return selectedLayout(photos);
  }

  _renderTailBlock(photos) {
    const cards = photos.map(p => `
      <div class="atom-tail-item">
        ${createCardHtml(p)}
      </div>
    `).join('');

    return `<div class="bento-atom-grid mode-tail" data-count="${photos.length}">${cards}</div>`;
  }
}