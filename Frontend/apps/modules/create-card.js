//* --- CREATE-CARD.JS --- */

/**
 * Генерирует одну карточку альбома (DOM-элемент)
 * @param {Object} album - Данные альбома из catalog.json
 * @param {Function} onAlbumClick - Коллбэк для перехода в SPA
 * @returns {HTMLElement} Ссылка-контейнер .catalog-item
 */
export function createCard(album, onAlbumClick) {
  const isComingSoon = album.status === 'coming_soon' || !album.hero_url;

  // 1. Корневой элемент-ссылка (.catalog-item)
  const itemLink = document.createElement('a');
  itemLink.href = isComingSoon ? '#' : `?album=${album.id}`;
  
  // 🚀 ВАЖНО: Добавляем col-4, чтобы карточка строго занимала 1/3 сетки
  itemLink.className = `catalog-item col-4 ${isComingSoon ? 'card-disabled' : ''}`;
  itemLink.dataset.id = album.id;

  // 2. Блок визуального бокса (.work-card)
  const workCard = document.createElement('div');
  workCard.className = `work-card ${isComingSoon ? '' : 'card-active'}`;

  if (isComingSoon) {
    const badge = document.createElement('span');
    badge.className = 'status-badge';
    badge.textContent = 'COMING SOON';
    workCard.appendChild(badge);
  } else {
    // Подставляем кастомную hero-обложку
    workCard.style.backgroundImage = `url('${album.hero_url}')`;
  }

  // 3. Блок текстовой мета-информации под обложкой (.card-meta)
  const cardMeta = document.createElement('div');
  cardMeta.className = 'card-meta';

  const title = document.createElement('h2');
  title.className = 'meta-title';
  title.textContent = album.title;

  cardMeta.appendChild(title);

  if (album.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'meta-subtitle';
    subtitle.textContent = album.subtitle;
    cardMeta.appendChild(subtitle);
  }

  // Собираем элементы карточки
  itemLink.appendChild(workCard);
  itemLink.appendChild(cardMeta);

  // Навешиваем клик для Native SPA роутинга
  if (!isComingSoon && typeof onAlbumClick === 'function') {
    itemLink.addEventListener('click', (e) => {
      e.preventDefault();
      onAlbumClick(album.id);
    });
  }

  return itemLink;
}

/**
 * Функция-пакет: Рендерит весь массив карточек в указанный контейнер
 * @param {HTMLElement} container - Элемент #catalog-cards-container
 * @param {Array} catalogData - Данные из catalog.json
 * @param {Function} onAlbumClick - Коллбэк для перехода в альбом
 */
export function renderCatalogGrid(container, catalogData, onAlbumClick) {
  if (!container) return;
  container.innerHTML = '';

  // Убеждаемся, что сам контейнер имеет класс .grid
  container.classList.add('grid');

  catalogData.forEach((album) => {
    const cardElement = createCard(album, onAlbumClick);
    container.appendChild(cardElement);
  });
}

