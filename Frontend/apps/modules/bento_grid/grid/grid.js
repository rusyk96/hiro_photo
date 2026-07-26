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
    // Если вообще ничего не осталось — выходим
    if (landscapes.length === 0 && portraits.length === 0) {
      return null;
    }

    const total = landscapes.length + portraits.length;
    const step = this.patternStep % 5;

    // --- 1. ПРИОРИТЕТНЫЕ БОЛЬШИЕ ПАТТЕРНЫ (когда кадров много) ---

    // Паттерн 4 / 6: Крупный акцент + 3 мелких
    if (landscapes.length >= 1 && portraits.length >= 3) {
      this.patternStep++;
      return (step % 2 === 0)
        ? renderPattern4(portraits.shift(), portraits.shift(), portraits.shift(), landscapes.shift())
        : renderPattern6(landscapes.shift(), portraits.shift(), portraits.shift(), portraits.shift());
    }

    // Паттерн 1: 2 портрета + 2 горизонтали
    if (portraits.length >= 2 && landscapes.length >= 2) {
      this.patternStep++;
      return renderPattern1(portraits.shift(), landscapes.shift(), landscapes.shift(), portraits.shift());
    }

    // Паттерн 8: Акцент + 2 мелких
    if (landscapes.length >= 1 && portraits.length >= 2) {
      this.patternStep++;
      return renderPattern8(landscapes.shift(), portraits.shift(), portraits.shift());
    }

    // --- 2. МЯГКИЙ ФОЛЛБЭК (когда один из типов фото заканчивается) ---

    // Если остались только портреты (собираем парами)
    if (portraits.length >= 2) {
      return renderPattern8(portraits.shift(), portraits.shift(), portraits.shift());
    }

    // Если остались только горизонтали (собираем парами)
    if (landscapes.length >= 2) {
      return renderPattern1(landscapes.shift(), landscapes.shift(), landscapes.shift(), landscapes.shift());
    }

    // --- 3. ПОСЛЕДНИЙ КАДР (забираем одиночные остатки) ---
    if (landscapes.length > 0) {
      return renderMobilePattern(landscapes.shift());
    }
    if (portraits.length > 0) {
      return renderMobilePattern(portraits.shift());
    }

    return null;
  }
}