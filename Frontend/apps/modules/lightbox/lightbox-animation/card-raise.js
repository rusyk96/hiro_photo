/**
 * 🎬 Модуль выдвижения карточки Polaroid
 * Режиссура: Сброс шлейфа -> Выдвижение -> Определение ориентации (3:2 / 2:3) -> Химическая проявка.
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 🛫 Выдвижение и проявка кадра
   */
  animateRaise(polaroidCard, backdropEl, imgUrl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');

    // 🧹 ФАЗА 1: Полный сброс (Reset)
    if (imgElement) {
      imgElement.classList.remove('developed');
      imgElement.style.opacity = '0';
      imgElement.src = ''; // Очищаем старый src, чтобы убрать шлейф
    }

    // 2. Включаем затемнение фона
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 3. Выдвигаем чистую карточку снизу экрана
    const startY = window.innerHeight;
    Object.assign(polaroidCard.style, {
      transition: 'none',
      transform: `translateY(${startY}px) scale(0.92)`,
      opacity: '0'
    });

    requestAnimationFrame(() => {
      Object.assign(polaroidCard.style, {
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
        transform: 'translateY(0) scale(1)',
        opacity: '1'
      });
    });

    // 📐 Вспомогательная функция переключения формата паспарту
    const applyCardFormat = (imageWidth, imageHeight) => {
      polaroidCard.classList.remove('landscape', 'portrait');

      if (imageHeight > imageWidth) {
        // Вертикальный кадр
        polaroidCard.classList.add('portrait');
      } else {
        // Горизонтальный кадр
        polaroidCard.classList.add('landscape');
      }
    };

    // 🧪 ФАЗА 2: Подгрузка, установка формата и проявка
    const startDeveloping = () => {
      setTimeout(() => {
        if (imgElement) {
          imgElement.style.opacity = '';
          imgElement.classList.add('developed');
        }
      }, 100);
    };

    if (imgElement && imgUrl) {
      const tempImg = new Image();
      tempImg.src = imgUrl;

      const applyNewImage = () => {
        // Задаем ориентацию рамки по реальным габаритам фото
        applyCardFormat(tempImg.naturalWidth, tempImg.naturalHeight);

        imgElement.src = imgUrl;
        startDeveloping();
      };

      if (tempImg.complete && tempImg.naturalWidth !== 0) {
        applyNewImage();
      } else {
        tempImg.onload = applyNewImage;
      }
    }

    const handleEnd = (e) => {
      if (e.target !== polaroidCard) return;
      polaroidCard.removeEventListener('transitionend', handleEnd);
      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }

  /**
   * 🛬 Уход карточки обратно вниз при закрытии
   */
  animateDrop(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');
    if (imgElement) {
      imgElement.classList.remove('developed');
      imgElement.style.opacity = '0';
    }

    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.35s ease';
      backdropEl.style.opacity = '0';
    }

    const endY = window.innerHeight;

    Object.assign(polaroidCard.style, {
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
      transform: `translateY(${endY}px) scale(0.95)`,
      opacity: '0'
    });

    const handleEnd = (e) => {
      if (e.target !== polaroidCard) return;
      polaroidCard.removeEventListener('transitionend', handleEnd);

      // Сбрасываем стили после ухода
      polaroidCard.style.transform = '';
      polaroidCard.style.opacity = '';
      polaroidCard.classList.remove('landscape', 'portrait');

      if (imgElement) {
        imgElement.src = '';
      }

      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}