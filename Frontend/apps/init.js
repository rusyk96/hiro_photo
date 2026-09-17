// init.js

import { includeComponent } from './modules/api.js';
import { initRouter, initNavigationListeners } from './modules/router.js';
import { loadStyles } from './modules/resolver.js';



export async function bootstrapApp() {
  try {
    // 1. Первым делом загружаем ключевые стили ДО рендера HTML-дерева!
    await loadStyles([
      'Global_style_canvas.css',
      'fonts_faces.css',
      'Header.css',
      'footer.css',
      'louder.css'
    ]);

    // 2. Теперь спокойно монтируем шапку и подвал — они сразу встанут с готовыми CSS-правилами
    await Promise.all([
      includeComponent('header-slot', 'Frontend/Global_frames/heder_and_footer/heder.html'),
      includeComponent('footer-slot', 'Frontend/Global_frames/heder_and_footer/footer.html')
    ]);

    // 3. Запускаем роутер для заполнения фокус-зоны
    await initRouter();

    // 4. Вешаем события
    initNavigationListeners();
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
  }

  document.body.classList.add('ready');
}
