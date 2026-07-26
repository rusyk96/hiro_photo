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
    this.patternStep = 0;
  }

  renderMobile(photo) {
    return renderMobilePattern(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    if (landscapes.length === 0 && portraits.length === 0) {
      return null;
    }

    const step = this.patternStep % 4;

    // --- 1. ПОЛНОЦЕННЫЕ BENTO-ПАТТЕРНЫ ---

    // Паттерн 4 / 6 (1 акцент + 3 мелких)
    if (landscapes.length >= 1 && portraits.length >= 3) {
      this.patternStep++;
      return (step % 2 === 0)
        ? renderPattern4(portraits.shift(), portraits.shift(), portraits.shift(), landscapes.shift())
        : renderPattern6(landscapes.shift(), portraits.shift(), portraits.shift(), portraits.shift());
    }

    // Паттерн 1 (2 портрета + 2 горизонтали)
    if (portraits.length >= 2 && landscapes.length >= 2) {
      this.patternStep++;
      return renderPattern1(portraits.shift(), landscapes.shift(), landscapes.shift(), portraits.shift());
    }

    // Паттерн 8 (1 акцент + 2 мелких)
    if (landscapes.length >= 1 && portraits.length >= 2) {
      this.patternStep++;
      return renderPattern8(landscapes.shift(), portraits.shift(), portraits.shift());
    }

    // --- 2. МЯГКАЯ ДЕГРАДАЦИЯ ДЛЯ ХВОСТОВ (аккуратное закрытие сетки) ---

    // Если есть 3+ одинаковых кадра
    if (portraits.length >= 3) {
      return renderPattern8(portraits.shift(), portraits.shift(), portraits.shift());
    }
    if (landscapes.length >= 3) {
      return renderPattern8(landscapes.shift(), landscapes.shift(), landscapes.shift());
    }

    // Если осталось 2 кадра — рендерим их аккуратной парой в 2 колонки
    if (portraits.length + landscapes.length === 2) {
      const p1 = landscapes.shift() || portraits.shift();
      const p2 = landscapes.shift() || portraits.shift();
      return `
        <div class="bento-row bento-tail-2">
          <div class="bento-col-6">${renderMobilePattern(p1)}</div>
          <div class="bento-col-6">${renderMobilePattern(p2)}</div>
        </div>
      `;
    }

    // --- 3. ПОСЛЕДНИЙ 1 КАДР ---
    const lastPhoto = landscapes.shift() || portraits.shift();
    if (lastPhoto) {
      return `
        <div class="bento-row bento-tail-1">
          <div class="bento-col-8">${renderMobilePattern(lastPhoto)}</div>
        </div>
      `;
    }

    return null;
  }
}