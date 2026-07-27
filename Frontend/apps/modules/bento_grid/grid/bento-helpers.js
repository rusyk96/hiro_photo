// bento-helpers.js
export function createCardHtml(photoObj) {
  if (!photoObj) return '';

  const srcUrl = photoObj.thumbUrl || photoObj;
  const originalIdx = photoObj.originalIndex ?? 0;

  return `
    <div class="gallery-card skeleton-active" onclick="openLightbox(${originalIdx})">
      <img 
        data-original-src="${srcUrl}" 
        alt="Кадр ${originalIdx + 1}" 
        class="gallery-img"
        loading="lazy"
        decoding="async"
        onload="this.parentElement.classList.remove('skeleton-active'); this.classList.add('is-loaded');"
        onerror="this.parentElement.classList.remove('skeleton-active'); this.closest('.gallery-card').style.display='none';"
      />
    </div>
  `;
}