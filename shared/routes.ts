import { z } from 'zod';
import { insertProfileSchema, insertCategorySchema, insertLinkSchema } from './schema';

export const api = {
  bio: {
    get: {
      method: 'GET' as const,
      path: '/api/bio',
      responses: {
        200: z.object({
          profile: z.any(), // Using any to avoid circular type issues in simple schema, strict type is BioData
          categories: z.array(z.any())
        }),
      },
    },
  },
};
