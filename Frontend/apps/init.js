import { includeComponent } from './modules/api.js';
import { initRouter, initNavigationListeners } from './modules/router.js';
import { mountLoader, hideLoader } from './modules/loader.js';

// Вспомогательная функция задержки
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function bootstrapApp() {
  mountLoader();

  try {
    // Запускаем параллельно загрузку данных И минимальный таймер (например, 1800ms)
    await Promise.all([
      // 1. Все наши сетевые запросы
      Promise.all([
        includeComponent('header-slot', 'Frontend/Global_frames/heder_and_footer/heder.html'),
        includeComponent('footer-slot', 'Frontend/Global_frames/heder_and_footer/footer.html'),
        initRouter()
      ]),
      // 2. Гарантированная пауза (измени 1800 на сколько нужно миллисекунд)
      delay(1800)
    ]);

    initNavigationListeners();
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
  } finally {
    // Скрываем лоудер только после того, как завершилось И то, И другое
    hideLoader();
  }
}