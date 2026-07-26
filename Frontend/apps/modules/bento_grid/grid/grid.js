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
    this.patternStep = 0; // Для красивой очерёдности паттернов
  }

  renderMobile(photo) {
    return renderMobilePattern(photo);
  }

  buildNextDesktopRow(landscapes, portraits) {
    // Выбираем паттерны по циклу, чтобы динамика радовала глаз
    const step = this.patternStep % 6;

    // 1. Паттерн 4 (3 мелких слева + 1 крупный акцент справа)
    if (step === 0 && portraits.length >= 3 && landscapes.length >= 1) {
      this.patternStep++;
      return renderPattern4(portraits.shift(), portraits.shift(), portraits.shift(), landscapes.shift());
    }

    // 2. Паттерн 6 (1 крупный акцент слева + 3 мелких справа)
    if (step === 1 && landscapes.length >= 1 && portraits.length >= 3) {
      this.patternStep++;
      return renderPattern6(landscapes.shift(), portraits.shift(), portraits.shift(), portraits.shift());
    }

    // 3. Паттерн 1 (2 портрета + 2 горизонтали)
    if (step === 2 && portraits.length >= 2 && landscapes.length >= 2) {
      this.patternStep++;
      return renderPattern1(portraits.shift(), landscapes.shift(), landscapes.shift(), portraits.shift());
    }

    // 4. Паттерн 8 (Большой акцент слева + 2 равных справа)
    if (step === 3 && landscapes.length >= 1 && portraits.length >= 2) {
      this.patternStep++;
      return renderPattern8(landscapes.shift(), portraits.shift(), portraits.shift());
    }

    // 5. Паттерн 3 (2 слева + 1 горизонталь справа / 1 горизонталь + 1 портрет)
    if (step === 4 && portraits.length >= 3 && landscapes.length >= 2) {
      this.patternStep++;
      return renderPattern3(portraits.shift(), portraits.shift(), landscapes.shift(), landscapes.shift(), portraits.shift());
    }

    // 6. Паттерн 2 (2 мелких + горизонталь / горизонталь + 2 мелких)
    if (step === 5 && portraits.length >= 4 && landscapes.length >= 2) {
      this.patternStep++;
      return renderPattern2(portraits.shift(), portraits.shift(), landscapes.shift(), landscapes.shift(), portraits.shift(), portraits.shift());
    }

    // --- ФОЛЛБЭК (если остатки кадров не подходят под строгий паттерн) ---
    if (landscapes.length >= 1 && portraits.length >= 2) {
      return renderPattern8(landscapes.shift(), portraits.shift(), portraits.shift());
    }
    if (landscapes.length > 0) {
      return renderMobilePattern(landscapes.shift());
    }
    if (portraits.length > 0) {
      return renderMobilePattern(portraits.shift());
    }

    return null;
  }
}