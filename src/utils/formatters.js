/**
 * Returns '#000000' or '#FFFFFF' whichever contrasts better against bgColor.
 * @param {string} bgColor - hex color e.g. '#1a9e6e'
 * @returns {string}
 */
export const getContrastColor = (bgColor) => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * @param {string} iso - ISO date string
 * @param {string} [locale='fr-BE']
 * @returns {string}
 */
export const formatDate = (iso, locale = 'fr-BE') =>
  new Date(iso).toLocaleDateString(locale);

/**
 * @param {number} n
 * @returns {string}
 */
export const formatNumber = (n) =>
  typeof n === 'number' ? n.toLocaleString('fr-FR') : '—';
