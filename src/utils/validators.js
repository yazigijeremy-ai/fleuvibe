import { z } from 'zod';

export const SpotSubmitSchema = z.object({
  name:        z.string().min(3, 'Nom trop court (min 3 caractères)').max(100),
  river:       z.string().min(1, 'Plan d\'eau requis'),
  type:        z.enum(['RIVER', 'LAKE', 'SEA']),
  difficulty:  z.enum(['Facile', 'Intermédiaire', 'Sportif']),
  description: z.string().max(1000).optional(),
  coords:      z.string().regex(/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/, 'Format: lat, lon (ex: 50.185, 5.002)').or(z.literal('')),
  activities:  z.array(z.string()).min(1, 'Sélectionne au moins une activité'),
});

export const ReviewSchema = z.object({
  rating:  z.number().min(1).max(5),
  comment: z.string().min(1, 'Commentaire requis').max(1000),
});

/**
 * @param {unknown} data
 * @returns {{ valid: boolean, errors: Record<string,string> }}
 */
export const validateSpot = (data) => {
  const result = SpotSubmitSchema.safeParse(data);
  if (result.success) return { valid: true, errors: {} };
  const errors = {};
  result.error.errors.forEach((e) => { errors[e.path[0]] = e.message; });
  return { valid: false, errors };
};

/**
 * @param {unknown} data
 * @returns {{ valid: boolean, errors: Record<string,string> }}
 */
export const validateReview = (data) => {
  const result = ReviewSchema.safeParse(data);
  if (result.success) return { valid: true, errors: {} };
  const errors = {};
  result.error.errors.forEach((e) => { errors[e.path[0]] = e.message; });
  return { valid: false, errors };
};
