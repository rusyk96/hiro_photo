// bento-helpers.js
export function createCardHtml(photoObj) {
  if (!photoObj) return '';

  const srcUrl = photoObj.thumbUrl || photoObj;
  const originalIdx = photoObj.originalIndex ?? 0;
  const isPortrait = photoObj.isPortrait ?? false;
  const aspectRatioStyle = isPortrait ? 'aspect-ratio: 3 / 4;' : 'aspect-ratio: 3 / 2;';

  return `
    <div class="gallery-card skeleton-active" style="${aspectRatioStyle}" onclick="openLightbox(${originalIdx})">
      <img 
        src="${srcUrl}" 
        alt="Кадр ${originalIdx + 1}" 
        class="gallery-img"
        loading="lazy"
        decoding="async"
        onload="const card = this.closest('.gallery-card'); if (card) { card.classList.remove('skeleton-active'); card.classList.add('is-loaded'); }"
        onerror="const card = this.closest('.gallery-card'); if (card) { card.classList.remove('skeleton-active'); }"
      />
    </div>
  `;
}