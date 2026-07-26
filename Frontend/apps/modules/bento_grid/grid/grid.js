import { renderPattern1 } from './grid_pattern/pattern1.js';
import { renderPattern2 } from './grid_pattern/pattern2.js';
// ...импорты остальных паттернов
import { renderMobilePattern } from './grid_pattern/mobilePattern.js';

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