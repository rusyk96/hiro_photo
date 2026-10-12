//* --- CREATE-CARD.JS (WITH DETAILED LOGS) --- */

/**
 * Генерирует одну карточку альбома (DOM-элемент)
 * 
 * @param {Object} album Данные альбома из catalog.json
 * @param {Function} onAlbumClick Коллбэк для перехода в SPA
 * @returns {HTMLElement} Ссылка-контейнер .catalog-item
 */
export function createCard(album, onAlbumClick) {
  console.group(`🏷️ [createCard] Старт генерации карточки ID: "${album?.id}"`);
  console.log('📦 Объект альбома:', album);

  const isComingSoon = album.status === 'coming_soon' || !album.hero_url;
  console.log(`🔍 Статус: isComingSoon = ${isComingSoon}`);

  // 1. Корневой элемент-ссылка (.catalog-item)
  const itemLink = document.createElement('a');
  itemLink.href = isComingSoon ? '#' : `?album=${album.id}`;
  itemLink.className = `catalog-item col-4 ${isComingSoon ? 'card-disabled' : ''}`;
  itemLink.dataset.id = album.id;
  console.log('🔗 Создан элемент ссылки (.catalog-item):', itemLink);

  // 2. Блок визуального бокса (.work-card)
  const workCard = document.createElement('div');
  workCard.className = `work-card ${isComingSoon ? '' : 'card-active'}`;

  if (isComingSoon) {
    const badge = document.createElement('span');
    badge.className = 'status-badge';
    badge.textContent = 'COMING SOON';
    workCard.appendChild(badge);
    console.log('⏳ Добавлен бэдж COMING SOON');
  } else {
    // Подставляем кастомную hero-обложку и логируем её
    console.log(`🖼️ Установка background-image для ${album.id}:`, album.hero_url);
    workCard.style.backgroundImage = `url('${album.hero_url}')`;
  }

  // 3. Блок текстовой мета-информации под обложкой (.card-meta)
  const cardMeta = document.createElement('div');
  cardMeta.className = 'card-meta';

  const title = document.createElement('h2');
  title.className = 'meta-title';
  title.textContent = album.title;
  cardMeta.appendChild(title);
  console.log('📝 Заголовок карточки:', album.title);

  if (album.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'meta-subtitle';
    subtitle.textContent = album.subtitle;
    cardMeta.appendChild(subtitle);
    console.log('💬 Подзаголовок карточки:', album.subtitle);
  }

  // Собираем элементы карточки
  itemLink.appendChild(workCard);
  itemLink.appendChild(cardMeta);

  // Навешиваем клик для Native SPA роутинга
  if (!isComingSoon && typeof onAlbumClick === 'function') {
    itemLink.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(`🚀 Клик по карточке альбома: ${album.id}`);
      onAlbumClick(album.id);
    });
  } else if (!isComingSoon) {
    console.warn(`⚠️ Коллбэк onAlbumClick не передан или не является функцией для альбома: ${album.id}`);
  }

  console.log(`✅ Карточка ${album?.id} успешно собрана`);
  console.groupEnd();

  return itemLink;
}

/**
 * Функция-пакет: Рендерит весь массив карточек в указанный контейнер
 * 
 * @param {HTMLElement} container Элемент #catalog-cards-container
 * @param {Array} catalogData Данные из catalog.json
 * @param {Function} onAlbumClick Коллбэк для перехода в альбом
 */
export function renderCatalogGrid(container, catalogData, onAlbumClick) {
  console.group('🏗️ [renderCatalogGrid] Рендеринг сетки каталога');
  console.log('📦 Контейнер:', container);
  console.log('📊 Массив данных каталога:', catalogData);

  if (!container) {
    console.error('❌ Ошибка: Контейнер для каталога не найден!');
    console.groupEnd();
    return;
  }

  if (!Array.isArray(catalogData) || catalogData.length === 0) {
    console.warn('⚠️ Внимание: catalogData пустой или не является массивом!');
  }

  container.innerHTML = '';
  container.classList.add('grid');
  console.log('🧹 Контейнер очищен, добавлен класс .grid');

  catalogData.forEach((album, index) => {
    console.log(`➡️ Рендер карточки #${index + 1}`);
    const cardElement = createCard(album, onAlbumClick);
    container.appendChild(cardElement);
  });

  console.log('🎉 Рендеринг сетки каталога завершён успешно');
  console.groupEnd();
}