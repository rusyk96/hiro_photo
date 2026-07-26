// bento-helpers.js
export function createCardHtml(photoObj) {
  if (!photoObj) return '';

  const srcUrl = photoObj.thumbUrl || photoObj;
  const originalIdx = photoObj.originalIndex ?? 0;

  return `
    <div class="gallery-card" onclick="openLightbox(${originalIdx})">
      <img 
        data-original-src="${srcUrl}" 
        alt="Кадр ${originalIdx + 1}" 
        class="gallery-img"
        loading="lazy"
        decoding="async"
        onerror="this.closest('.gallery-card').style.display='none';"
      />
    </div>
  `;
}