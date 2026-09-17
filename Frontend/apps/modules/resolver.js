// modules/resolver.js

let resourceMap = null;
let resolverPromise = null; // Промис для предотвращения race condition
const loadedStyles = new Set();

/**
 * Загружает карту ресурсов из structure.json из корня сайта
 */
export async function initResolver() {
  if (resourceMap) return resourceMap;

  // Если загрузка уже началась, возвращаем существующий промис
  if (resolverPromise) return resolverPromise;

  resolverPromise = (async () => {
    try {
      const response = await fetch(`/structure.json?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки structure.json (Статус: ${response.status})`);
      }
      resourceMap = await response.json();
      console.log('🗺️ Resource Discovery карта успешно загружена:', resourceMap);
      return resourceMap;
    } catch (err) {
      console.error('❌ Resolver Error:', err);
      resolverPromise = null; // Сбрасываем при ошибке для повторной попытки
      return null;
    }
  })();

  return resolverPromise;
}

/**
 * Гарантированно подключает массив CSS-файлов по их коротким именам
 * @param {string[]} filenames - Массив имён файлов, например ['Header.css', 'galerey.css']
 */
export async function loadStyles(filenames = []) {
  // 1. Строго ждем инициализации карты перед поисками!
  const map = await initResolver();
  
  if (!map) {
    console.error('❌ Нельзя загрузить стили: structure.json не был загружен.');
    return;
  }

  filenames.forEach(name => {
    if (loadedStyles.has(name)) return; // Исключаем дубликаты

    const relativePath = map[name];
    if (!relativePath) {
      console.warn(`⚠️ Стили для "${name}" не найдены в structure.json`);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    // Прямой инжект от корня с анти-кэшем
    link.href = `/${relativePath}?v=${Date.now()}`;
    link.dataset.styleName = name;

    document.head.appendChild(link);
    loadedStyles.add(name);
    console.log(`🎨 Подключен стиль: ${name} -> /${relativePath}`);
  });
}

export default {
  init: initResolver,
  load: loadStyles
};
