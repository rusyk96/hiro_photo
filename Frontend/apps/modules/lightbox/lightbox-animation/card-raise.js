/**
 * 🎬 Модуль выдвижения карточки (Bottom Slide-In Engine)
 * Реализует эффект физического выдвижения полароида снизу экрана.
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  /**
   * 🛫 Выдвижение карточки снизу в центр
   */
  animateRaise(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    // 1. Плавно включаем затемнение фона
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 2. Встреливаем карточку из-за нижней границы экрана
    Object.assign(polaroidCard.style, {
      transform: 'translateY(120px) scale(0.92)',
      opacity: '0',
      transition: 'none' // Сбрасываем предыдущие анимации для мгновенной позиционки
    });

    // 3. Запускаем движение на следующем кадре
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
  }

  /**
   * 🛬 Уход карточки обратно вниз при закрытии
   */
  animateDrop(polaroidCard, backdropEl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    // Гасим фон
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.35s ease';
      backdropEl.style.opacity = '0';
    }

    // Убираем карточку вниз
    Object.assign(polaroidCard.style, {
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
      transform: 'translateY(100px) scale(0.95)',
      opacity: '0'
    });

    const handleEnd = (e) => {
      if (e.target !== polaroidCard) return;
      polaroidCard.removeEventListener('transitionend', handleEnd);
      
      // Сбрасываем стили после завершения
      polaroidCard.style.transform = '';
      polaroidCard.style.opacity = '';
      
      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}