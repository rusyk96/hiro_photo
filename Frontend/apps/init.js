import { includeComponent } from './modules/api.js';
import { initRouter, initNavigationListeners } from './modules/router.js';
import { mountLoader, hideLoader } from './modules/loader.js';

export async function bootstrapApp() {
  // 1. Показываем лоудер сразу при старте
  mountLoader();

  try {
    // 2. Параллельно или последовательно подгружаем компоненты
    await Promise.all([
      includeComponent('header-slot', 'Frontend/Global_frames/heder_and_footer/heder.html'),
      includeComponent('footer-slot', 'Frontend/Global_frames/heder_and_footer/footer.html')
    ]);

    // 3. Загружаем нужную страницу и рендерим Bento-галерею
    await initRouter();

    // 4. Навешиваем слушатели навигации
    initNavigationListeners();
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
  } finally {
    // 5. Красиво скрываем лоудер, когда всё готово
    hideLoader();
  }
}