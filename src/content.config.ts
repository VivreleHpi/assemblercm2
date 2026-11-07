import { defineCollection } from 'astro:content';

export const collections = {
  etapes: defineCollection({ loader: async () => [] }),
  photos: defineCollection({ loader: async () => [] }),
  glossaire: defineCollection({ loader: async () => [] }),
  badges: defineCollection({ loader: async () => [] })
};

