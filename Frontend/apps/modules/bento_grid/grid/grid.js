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
    this.patternHistory = [];
  }

  // 🎯 1. МЕТОД ДЛЯ МОБИЛКИ
  renderMobile(photo) {
    return renderMobilePattern(photo);
  }

  // 🎯 2. МЕТОД ДЛЯ ДЕСКТОПА (именно его ищет bento.js!)
  buildNextDesktopRow(landscapes, portraits) {
    // Паттерн 1: требует 2 портрета + 2 горизонтали
    if (portraits.length >= 2 && landscapes.length >= 2) {
      return renderPattern1(
        portraits.shift(),
        landscapes.shift(),
        landscapes.shift(),
        portraits.shift()
      );
    }

    // Паттерн 6/7/8: 1 большая горизонталь + 2 портрета
    if (landscapes.length >= 1 && portraits.length >= 2) {
      return renderPattern6(
        landscapes.shift(),
        portraits.shift(),
        portraits.shift()
      );
    }

    // Фоллбэк: если остатки кадров не подходят под строгие паттерны
    if (landscapes.length > 0) {
      return renderMobilePattern(landscapes.shift());
    }
    if (portraits.length > 0) {
      return renderMobilePattern(portraits.shift());
    }

    return null;
  }
}