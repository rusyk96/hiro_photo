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
    this.cycleCount = 0; // Счётчик повторов (0..6)
    this.pairIndex = 0;  // Индекс пары: 0 (1-2), 1 (3-4), 2 (5-6), 3 (7-8)
    this.toggle = false; // Переключатель внутри пары (A или B)
  }

  renderMobile(photo) {
    return renderMobilePattern(photo);
  }

  // Вспомогательный забор нужных кадров
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

    // Определяем текущую пару паттернов по алгоритму
    // Пара 0: P1 / P2
    // Пара 1: P3 / P4
    // Пара 2: P5 / P6
    // Пара 3: P7 / P8
    const currentPair = this.pairIndex;
    const isA = !this.toggle;

    let html = null;

    // Пытаемся отрендерить паттерн согласно текущей фазе
    if (currentPair === 0) {
      // Пара 1-2
      const res = this.takePhotos(landscapes, portraits, 2, 2);
      if (res.success) {
        html = isA 
          ? renderPattern1(res.p[0], res.l[0], res.l[1], res.p[1])
          : renderPattern2(res.p[0], res.p[1], res.l[0], res.l[1], res.p[0], res.p[1]);
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
      // Пара 5-6
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

    // Управление шагом паттернов (6-7 повторов пары)
    if (html) {
      this.toggle = !this.toggle;
      this.cycleCount++;
      if (this.cycleCount >= 13) { // ~6.5 циклов (13 переключений A/B)
        this.cycleCount = 0;
        this.pairIndex = (this.pairIndex + 1) % 4; // Зацикливаем по 8 паттернам
      }
      return html;
    }

    // --- ФОЛЛБЭК ДЛЯ ХВОСТА И НЕХВАТКИ КАДРОВ ---
    if (landscapes.length >= 1 && portraits.length >= 2) {
      const l = landscapes.shift();
      const p1 = portraits.shift();
      const p2 = portraits.shift();
      return renderPattern8(l, p1, p2);
    }

    // Закрываем хвост без наплыва на подвал
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