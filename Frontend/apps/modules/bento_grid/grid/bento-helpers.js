// bento-helpers.js

export function createCardHtml(photoObj) {
  if (!photoObj) return '';

  // Берем оригинальный URL без сторонних CDN-прослоек
  const thumbSrc = typeof photoObj === 'string' 
    ? photoObj 
    : (photoObj.thumbUrl || photoObj.thumb_url || photoObj.thumb || photoObj.url || photoObj.src);

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