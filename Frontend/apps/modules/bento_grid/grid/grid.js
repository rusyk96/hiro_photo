import { renderPattern1 } from './grid_components/pattern1.js';
import { renderPattern2 } from './grid_components/pattern2.js';
import { renderPattern3 } from './grid_components/pattern3.js';
import { renderPattern4 } from './grid_components/pattern4.js';
import { renderPattern5 } from './grid_components/pattern5.js';
import { renderPattern6 } from './grid_components/pattern6.js';
import { renderPattern7 } from './grid_components/pattern7.js';
import { renderPattern8 } from './grid_components/pattern8.js';
import { renderMobilePattern } from './grid_components/mobilePattern.js';

export class GridEngine {
  constructor() {
    this.cycleCount = 0; // Счётчик повторов
    this.pairIndex = 0;  // Пара: 0 (1-2), 1 (3-4), 2 (5-6), 3 (7-8)
    this.toggle = false; // A / B
  }

  renderMobile(photo) {
    return renderMobilePattern(photo);
  }

  takePhotos(landscapes, portraits, needL, needP) {
    if (landscapes.length >= needL && portraits.length >= needP) {
      const l = landscapes.splice(0, needL);
      const p = portraits.splice(0, needP);
      return { l, p, success: true };
    }
    return { success: false };
  }

  buildNextDesktopRow(landscapes, portraits) {
    if (landscapes.length === 0 && portraits.length === 0) {
      return null;
    }

    const currentPair = this.pairIndex;
    const isA = !this.toggle;
    let html = null;

    // --- ОСНОВНОЙ ЦИКЛ ПАТТЕРНОВ ---
    if (currentPair === 0) {
      // Пара 1-2 (2 портрета, 2 горизонтали)
      const res = this.takePhotos(landscapes, portraits, 2, 2);
      if (res.success) {
        html = isA 
          ? renderPattern1(res.p[0], res.l[0], res.l[1], res.p[1])
          : renderPattern2(res.p[0], res.p[1], res.l[0], res.l[1]); // Ровно 4 аргумента!
      }
    } else if (currentPair === 1) {
      // Пара 3-4
      const res3 = this.takePhotos(landscapes, portraits, 2, 3);
      const res4 = this.takePhotos(landscapes, portraits, 1, 3);
      if (isA && res3.success) {
        html = renderPattern3(res3.p[0], res3.p[1], res3.l[0], res3.l[1], res3.p[2]);
      } else if (!isA && res4.success) {
        html = renderPattern4(res4.p[0], res4.p[1], res4.p[2], res4.l[0]);
      }
    } else if (currentPair === 2) {
      // Пара 5-6 (1 ландшафт, 3 портрета)
      const res = this.takePhotos(landscapes, portraits, 1, 3);
      if (res.success) {
        html = isA 
          ? renderPattern5(res.p[0], res.p[1], res.p[2], res.l[0])
          : renderPattern6(res.l[0], res.p[0], res.p[1], res.p[2]);
      }
    } else if (currentPair === 3) {
      // Пара 7-8
      const res7 = this.takePhotos(landscapes, portraits, 1, 3);
      const res8 = this.takePhotos(landscapes, portraits, 1, 2);
      if (isA && res7.success) {
        html = renderPattern7(res7.l[0], res7.p[0], res7.p[1], res7.p[2]);
      } else if (!isA && res8.success) {
        html = renderPattern8(res8.l[0], res8.p[0], res8.p[1]);
      }
    }

    // Инкремент смены пар (ротация каждые 6-7 итераций)
    if (html) {
      this.toggle = !this.toggle;
      this.cycleCount++;
      if (this.cycleCount >= 13) {
        this.cycleCount = 0;
        this.pairIndex = (this.pairIndex + 1) % 4;
      }
      return html;
    }

    // --- ФОЛЛБЭК, ЕСЛИ КАДРЫ В МАССИВАХ КАНЧИВАЮТСЯ НЕСБАЛАНСИРОВАННО ---
    if (landscapes.length >= 1 && portraits.length >= 2) {
      return renderPattern8(landscapes.shift(), portraits.shift(), portraits.shift());
    }

    // Хвост
    const remain = [...landscapes, ...portraits];
    landscapes.length = 0;
    portraits.length = 0;

    if (remain.length > 0) {
      const cardsHtml = remain.map(p => `<div class="bento-tail-item">${renderMobilePattern(p)}</div>`).join('');
      return `<div class="bento-row bento-tail-wrapper">${cardsHtml}</div>`;
    }

    return null;
  }
}