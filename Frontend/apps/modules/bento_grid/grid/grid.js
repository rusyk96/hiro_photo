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

  // Определение: Мобилка или Десктоп
  isMobile() {
    return window.innerWidth < 768;
  }

  // Главный метод сборки строки
  buildNextRow(landscapes, portraits) {
    if (this.isMobile()) {
      // На мобилке забираем по 1 кадру подряд
      const photo = landscapes.shift() || portraits.shift();
      return photo ? renderMobilePattern(photo) : '';
    }

    // --- ДЕСКТОП: Умный выбор из 9 паттернов ---
    
    // Проверяем паттерн 1 (требует 2 портрета + 2 горизонтали)
    if (portraits.length >= 2 && landscapes.length >= 2) {
      return renderPattern1(
        portraits.shift(),
        landscapes.shift(),
        landscapes.shift(),
        portraits.shift()
      );
    }

    // Проверяем паттерн 6/7/8 (требует 1 большой акцент + 2-3 мелких)
    if (landscapes.length >= 1 && portraits.length >= 2) {
      // Рандомизируем или чередуем паттерны 6, 7, 8 ради динамики
      return renderPattern6(
        landscapes.shift(),
        portraits.shift(),
        portraits.shift()
      );
    }

    // Если кадров мало/заканчиваются — дефолтный фоллбэк
    // ...
  }
}