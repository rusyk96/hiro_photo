/**
 * 🎬 Модуль выдвижения с эффектом проявки Polaroid
 */

export class CardRaiseAnimation {
  constructor() {
    this.isAnimating = false;
  }

  animateRaise(polaroidCard, backdropEl, imgUrl, onComplete) {
    if (!polaroidCard || this.isAnimating) return;
    this.isAnimating = true;

    const imgElement = document.getElementById('lightbox-img');

    // 1. Сбрасываем проявку на старте (картинка "сырая")
    if (imgElement) {
      imgElement.classList.remove('developed');
    }

    // 2. Включаем затемнение
    if (backdropEl) {
      backdropEl.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      backdropEl.style.opacity = '1';
    }

    // 3. Выдвигаем карточку снизу СРАЗУ
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

    // 4. Запускаем "химическую реакцию" (проявку)
    const startDeveloping = () => {
      // Легкая микро-задержка для ощущения физики
      setTimeout(() => {
        if (imgElement) imgElement.classList.add('developed');
      }, 150);
    };

    if (imgElement && imgUrl) {
      imgElement.src = imgUrl;
      
      if (imgElement.complete) {
        startDeveloping();
      } else {
        imgElement.onload = () => startDeveloping();
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
      
      polaroidCard.style.transform = '';
      polaroidCard.style.opacity = '';
      
      this.isAnimating = false;
      if (onComplete) onComplete();
    };

    polaroidCard.addEventListener('transitionend', handleEnd);
  }
}