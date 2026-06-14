import { describe, it, expect } from 'vitest';
import { validateSpot, validateReview } from '../utils/validators.js';

describe('validateSpot', () => {
  it('accepts a valid spot', () => {
    const { valid } = validateSpot({ name: 'La Lesse', river: 'Lesse', type: 'RIVER', difficulty: 'Facile', activities: ['Kayak'] });
    expect(valid).toBe(true);
  });

  it('rejects short name', () => {
    const { valid, errors } = validateSpot({ name: 'AB', river: 'X', type: 'RIVER', difficulty: 'Facile', activities: ['Kayak'] });
    expect(valid).toBe(false);
    expect(errors.name).toBeTruthy();
  });

  it('rejects invalid type', () => {
    const { valid, errors } = validateSpot({ name: 'Test', river: 'R', type: 'SWAMP', difficulty: 'Facile', activities: ['Kayak'] });
    expect(valid).toBe(false);
    expect(errors.type).toBeTruthy();
  });

  it('rejects empty activities', () => {
    const { valid, errors } = validateSpot({ name: 'Test', river: 'R', type: 'RIVER', difficulty: 'Facile', activities: [] });
    expect(valid).toBe(false);
    expect(errors.activities).toBeTruthy();
  });
});

describe('validateReview', () => {
  it('accepts valid review', () => {
    const { valid } = validateReview({ rating: 5, comment: 'Super spot !' });
    expect(valid).toBe(true);
  });

  it('rejects rating out of range', () => {
    const { valid } = validateReview({ rating: 6, comment: 'Bien' });
    expect(valid).toBe(false);
  });
});
