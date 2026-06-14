import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizeInput } from '../utils/sanitizers.js';

describe('sanitizeHTML', () => {
  it('escapes < and >', () => {
    expect(sanitizeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
  it('escapes ampersand', () => {
    expect(sanitizeHTML('A & B')).toBe('A &amp; B');
  });
  it('returns empty string for null/undefined', () => {
    expect(sanitizeHTML(null)).toBe('');
    expect(sanitizeHTML(undefined)).toBe('');
  });
});

describe('sanitizeInput', () => {
  it('removes dangerous chars', () => {
    expect(sanitizeInput("O'Brien; DROP TABLE")).not.toContain("'");
    expect(sanitizeInput('<bad>')).not.toContain('<');
  });
  it('truncates at 2000 chars', () => {
    expect(sanitizeInput('a'.repeat(3000)).length).toBe(2000);
  });
  it('passes through non-strings unchanged', () => {
    expect(sanitizeInput(42)).toBe(42);
  });
});
