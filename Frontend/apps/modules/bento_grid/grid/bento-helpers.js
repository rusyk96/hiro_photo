// bento-helpers.js
const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export function createCardHtml(photoObj) {
  if (!photoObj) return '';

  const thumbSrc = typeof photoObj === 'string' 
    ? photoObj 
    : (photoObj.thumbUrl || photoObj.thumb_url || photoObj.thumb || photoObj.url || photoObj.src);

  const originalIdx = photoObj.originalIndex ?? 0;
  const isPortrait = photoObj.isPortrait ?? false;
  
  // Пропорции карточки
  const aspectRatioStyle = isPortrait ? 'aspect-ratio: 2 / 3;' : 'aspect-ratio: 3 / 2;';

  return `
    <div class="gallery-card" style="${aspectRatioStyle}" onclick="openLightbox(${originalIdx})">
      <img 
        src="${EMPTY_PIXEL}" 
        data-original-src="${thumbSrc}" 
        alt="Кадр ${originalIdx + 1}" 
        class="gallery-img"
        decoding="async"
      />
    </div>
  `;
}