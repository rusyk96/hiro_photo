// bento-helpers.js

/**
 * Автоматически превращает сырые ссылки GitHub в глобальный CDN jsDelivr
 */
function toCdnUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  if (url.includes('raw.githubusercontent.com')) {
    return url
      .replace('https://raw.githubusercontent.com/', 'https://cdn.jsdelivr.net/gh/')
      .replace(/\/main\//, '@main/')
      .replace(/\/master\//, '@master/');
  }
  
  return url;
}

export function createCardHtml(photoObj) {
  if (!photoObj) return '';

  const rawSrc = typeof photoObj === 'string' 
    ? photoObj 
    : (photoObj.thumbUrl || photoObj.thumb_url || photoObj.thumb || photoObj.url || photoObj.src);

  // 🚀 Прогоняем через CDN для мгновенной отдачи по HTTP/3
  const thumbSrc = toCdnUrl(rawSrc);

  const originalIdx = photoObj.originalIndex ?? 0;
  const isPortrait = photoObj.isPortrait ?? false;
  
  // Жесткий эталон пропорций для каркаса-скелета
  const aspectRatioStyle = isPortrait ? 'aspect-ratio: 2 / 3;' : 'aspect-ratio: 3 / 2;';

  return `
    <div class="gallery-card" style="${aspectRatioStyle}" onclick="openLightbox(${originalIdx})">
      <img 
        data-original-src="${thumbSrc}" 
        alt="Кадр ${originalIdx + 1}" 
        class="gallery-img"
        decoding="async"
      />
    </div>
  `;
}