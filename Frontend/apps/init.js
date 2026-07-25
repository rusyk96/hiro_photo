import { includeComponent } from './modules/api.js';
import { initRouter, initNavigationListeners } from './modules/router.js';

export async function bootstrapApp() {
  // 1. Подгружаем глобальные шапку и подвал
  await includeComponent('header-slot', 'Frontend/Global_frames/heder_and_footer/heder.html');
  await includeComponent('footer-slot', 'Frontend/Global_frames/heder_and_footer/footer.html');

  // 2. Инициализируем роутинг по текущему URL
  await initRouter();

  // 3. Подключаем глобальный слушатель навигации
  initNavigationListeners();
}