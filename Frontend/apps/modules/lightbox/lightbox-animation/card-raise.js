/**
 * 🎬 Модуль выдвижения карточки (True Bottom-Up Engine)
 * Карточка стартует строго за нижней границей Viewport.
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 🛫 Выдвижение снизу экрана в центр
   */
  animateRaise(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    // 1. Плавный наплыв полупрозрачного фона
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 2. Смещаем карточку СТРОГО за нижнюю границу экрана
    // Передаем точное расстояние от центра до самого низа Viewport
    const startY = window.innerHeight; 

    Object.assign(polaroidCard.style, {
      transition: 'none',
      transform: `translateY(${startY}px) scale(0.92)`,
      opacity: '0'
    });

    // 3. На следующем кадре запускаем плавный взлет на родное место (translateY(0))
    requestAnimationFrame(() => {
      Object.assign(polaroidCard.style, {
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
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
  }

  /**
   * 🛬 Уход карточки обратно за нижнюю границу экрана
   */
  animateDrop(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    // Гасим фон
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.35s ease';
      backdropEl.style.opacity = '0';
    }

    const endY = window.innerHeight;

    // Уводим карточку обратно вниз за пределы экрана
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
      
      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}