// grid-engine.js
import { createCardHtml } from './bento-helpers.js';
import { MOBILE_PRESETS, DESKTOP_PRESETS } from './bento-presets.js';
import { BentoSelector } from './bento-selector.js';

export class GridEngine {
  /**
   * @param {string|number} albumSeed - Идентификатор альбома для фиксации порядка
   */
  constructor(albumSeed = 'bento-default-session') {
    this.lastPreset = null;
    this.initialSeed = this._hashString(String(albumSeed));
    this.currentSeed = this.initialSeed;
  }

  /**
   * 🧱 Генерирует массив готовых HTML-рядов для альбома
   */
  generateFullGrid(items, isMobile = false) {
    // Сбрасываем состояния перед каждой генерацией
    this.currentSeed = this.initialSeed;
    this.lastPreset = null;

    const landscapes = items
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter(item => !item.isPortrait);

    const portraits = items
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter(item => item.isPortrait);

    const rowsHtml = [];
    let isFirstRow = true;

    while (landscapes.length > 0 || portraits.length > 0) {
      const rowHtml = this._buildNextRow(landscapes, portraits, isMobile, isFirstRow);
      
      if (!rowHtml) break;
      rowsHtml.push(rowHtml);
      isFirstRow = false;
    }

    return rowsHtml.join('');
  }

  _buildNextRow(landscapes, portraits, isMobile, isFirstRow) {
    const total = landscapes.length + portraits.length;
    if (total === 0) return null;

    // Рендер Главного Hero-кадра
    if (isFirstRow && landscapes.length > 0) {
      if (!portraits.length || landscapes[0].originalIndex < portraits[0].originalIndex) {
        const hero = landscapes.splice(0, 1)[0];
        const modeClass = isMobile ? 'mode-mobile' : 'mode-desktop';
        const spanAttr = isMobile ? '' : 'style="grid-column: span 12;"';
        
        return `
          <div class="bento-atom-grid ${modeClass} mode-hero">
            <div class="atom-hl" ${spanAttr}>${createCardHtml(hero)}</div>
          </div>`;
      }
    }

    // Выбор пресета
    const presetsMap = isMobile ? MOBILE_PRESETS : DESKTOP_PRESETS;
    const available = isMobile 
      ? BentoSelector.getAvailableMobile(landscapes.length, portraits.length)
      : BentoSelector.getAvailableDesktop(landscapes.length, portraits.length);

    let candidates = available;
    if (candidates.length > 1 && this.lastPreset) {
      candidates = candidates.filter(p => p !== this.lastPreset);
    }

    if (candidates.length > 0) {
      // 🚀 Замена Math.random() на детерминированный выбор
      const selectedIndex = this._nextRandomInt(candidates.length);
      const selected = candidates[selectedIndex];

      this.lastPreset = selected;
      return presetsMap[selected](landscapes, portraits);
    }

    // Рендер нераспределенного остатка (Tail)
    return this._renderTail(landscapes, portraits);
  }

_renderTail(landscapes, portraits) {
    const remain = [...landscapes, ...portraits].sort((a, b) => a.originalIndex - b.originalIndex);
    landscapes.length = 0;
    portraits.length = 0;

    if (remain.length === 0) return null;

    // Генерируем адаптивные слоты под остаток
    const cards = remain.map(item => {
      // Для альбомных кадрируем на 6 колонок (50% ширины), для портретных — 3/4 колонки
      const colSpanStyle = item.isPortrait ? 'grid-column: span 3;' : 'grid-column: span 6;';
      const spanClass = item.isPortrait ? 'atom-vs' : 'atom-hl';
      
      return `<div class="${spanClass}" style="${colSpanStyle}">${createCardHtml(item)}</div>`;
    }).join('');

    // Добавляем режим `mode-tail` с принудительным заполнением пустот
    return `<div class="bento-atom-grid mode-tail" style="grid-auto-flow: dense;">${cards}</div>`;
  }

  // 🎯 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЕТЕРМИНИРОВАННОГО PRNG

  /**
   * Преобразует строковый ID альбома в числовой сид
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) || 12345;
  }

  /**
   * Линейный конгруэнтный генератор (LCG)
   * Возвращает случайное целое число в диапазоне [0, max - 1]
   */
  _nextRandomInt(max) {
    if (max <= 1) return 0;
    
    // Константы LCG (Numerical Recipes)
    this.currentSeed = (1664525 * this.currentSeed + 1013904223) % 4294967296;
    return Math.floor((this.currentSeed / 4294967296) * max);
  }
}
