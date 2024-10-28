import { Category } from '../types';
import { Bone, Heart, Baby, Bath, Cookie, Bed } from 'lucide-react';

export const categories: Category[] = [
  {
    id: 'food',
    name: 'Food & Nutrition',
    description: 'Premium food and dietary supplements',
    icon: 'Cookie'
  },
  {
    id: 'toys',
    name: 'Toys & Entertainment',
    description: 'Engaging toys for mental and physical stimulation',
    icon: 'Bone'
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Healthcare and wellness products',
    icon: 'Heart'
  },
  {
    id: 'grooming',
    name: 'Grooming & Care',
    description: 'Grooming tools and care products',
    icon: 'Bath'
  },
  {
    id: 'training',
    name: 'Training & Behavior',
    description: 'Training aids and behavioral products',
    icon: 'Baby'
  },
  {
    id: 'bedding',
    name: 'Beds & Furniture',
    description: 'Comfortable beds and furniture',
    icon: 'Bed'
  }
];