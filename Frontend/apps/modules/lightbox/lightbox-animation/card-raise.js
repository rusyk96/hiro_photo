/**
 * 🎬 Модуль выдвижения карточки (Preload & Lift Engine)
 * Карточка ждёт полной загрузки изображения за краем экрана, а затем вылетает в кадр.
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 🛫 Ожидание загрузки + Выдвижение снизу
   */
  animateRaise(polaroidCard, backdropEl, imgUrl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');

    // 1. Сразу включаем затемнение фона
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 2. Прячем карточку глубоко за нижний край экрана (готовим к вылету)
    const startY = window.innerHeight;
    Object.assign(polaroidCard.style, {
      transition: 'none',
      transform: `translateY(${startY}px) scale(0.92)`,
      opacity: '0'
    });

    // 3. Функция запуска взлета (вызывается ТОЛЬКО когда картинка готова)
    const launchCard = () => {
      requestAnimationFrame(() => {
        Object.assign(polaroidCard.style, {
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
          transform: 'translateY(0) scale(1)',
          opacity: '1'
        });
      });

      const handleEnd = (e) => {
        if (e.target !== polaroidCard) return;
        polaroidCard.removeEventListener('transitionend', handleEnd);
        this.isAnimating = false;
        if (onComplete) onComplete();
      };

      polaroidCard.addEventListener('transitionend', handleEnd);
    };

    // 4. Предзагрузка изображения
    if (imgUrl) {
      const loaderImg = new Image();
      loaderImg.src = imgUrl;

      // Если картинка уже закеширована браузером — взлетаем мгновенно
      if (loaderImg.complete) {
        if (imgElement) imgElement.src = imgUrl;
        launchCard();
      } else {
        // Если грузится из сети — ждём окончания загрузки за кадром
        loaderImg.onload = () => {
          if (imgElement) imgElement.src = imgUrl;
          launchCard();
        };
      }
    } else {
      launchCard();
    }
  }

  /**
   * 🛬 Уход карточки обратно вниз при закрытии
   */
  animateDrop(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

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
      
      polaroidCard.style.transform = '';
      polaroidCard.style.opacity = '';
      
      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}