// bento-selector.js
export class BentoSelector {
  static getAvailableMobile(landscapesCount, portraitsCount) {
    const presets = [];
    if (portraitsCount >= 2) presets.push('2VS');
    if (landscapesCount >= 2 && portraitsCount >= 1) presets.push('STACK2HS_VS', 'VS_STACK2HS');
    if (landscapesCount >= 1) presets.push('1HL');
    return presets;
  }

  static getAvailableDesktop(landscapesCount, portraitsCount) {
    const presets = [];
    if (landscapesCount >= 1 && portraitsCount >= 1) presets.push('HL_VS', 'VS_HL');
    if (landscapesCount >= 2 && portraitsCount >= 2) presets.push('STACK2HS_2VL', '2VL_STACK2HS');
    if (landscapesCount >= 3) presets.push('STACK2HS_HL', 'HL_STACK2HS');
    return presets;
  }
}
