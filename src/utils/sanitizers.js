/**
 * Encodes HTML entities to prevent XSS.
 * @param {string} input
 * @returns {string}
 */
export const sanitizeHTML = (input) => {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Strips dangerous chars and limits length for user-submitted strings.
 * @param {string} input
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/['";\\<>]/g, '').trim().slice(0, 2000);
};
