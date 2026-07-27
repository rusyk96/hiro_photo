/**
 * 🎬 Модуль выдвижения с жестким сбросом и проявкой Polaroid
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  animateRaise(polaroidCard, backdropEl, imgUrl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');

    // 🧹 ФАЗА 1: Полный сброс (Reset) старого состояния
    if (imgElement) {
      imgElement.classList.remove('developed');
      // Очищаем src, чтобы не было "шлейфа" предыдущего кадра
      imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjwvc3ZnPg==';
    }

    // 2. Включаем затемнение
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 3. Выдвигаем чистую карточку снизу
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

    // 🧪 ФАЗА 2: Подгрузка и проявка нового кадра
    const startDeveloping = () => {
      setTimeout(() => {
        if (imgElement) imgElement.classList.add('developed');
      }, 100);
    };

    if (imgElement && imgUrl) {
      // Загружаем новый кадр
      const tempImg = new Image();
      tempImg.src = imgUrl;

      const applyNewImage = () => {
        imgElement.src = imgUrl;
        startDeveloping();
      };

      if (tempImg.complete) {
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

  animateDrop(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');
    if (imgElement) {
      imgElement.classList.remove('developed');
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
      
      // Сбрасываем стили и очищаем src при закрытии
      polaroidCard.style.transform = '';
      polaroidCard.style.opacity = '';
      if (imgElement) {
        imgElement.src = '';
      }
      
      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}