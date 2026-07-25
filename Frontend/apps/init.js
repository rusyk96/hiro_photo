import { includeComponent } from './modules/api.js';
import { initRouter, initNavigationListeners } from './modules/router.js';

export async function bootstrapApp() {
  try {
    // Подгружаем шапку и подвал
    await Promise.all([
      includeComponent('header-slot', 'Frontend/Global_frames/heder_and_footer/heder.html'),
      includeComponent('footer-slot', 'Frontend/Global_frames/heder_and_footer/footer.html')
    ]);

    // Роутер сам включит и выключит лоудер при рендере первой страницы
    await initRouter();

    // Навешиваем слушатели переходов
    initNavigationListeners();
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
  }
}