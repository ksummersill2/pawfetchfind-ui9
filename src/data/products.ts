import { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: 'Premium Grain-Free Dog Food',
    description: 'All-natural, grain-free formula for optimal nutrition',
    price: 59.99,
    rating: 4.8,
    popularity: 95,
    discount: 10,
    vendor: 'PawNatural',
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    categoryId: 'food',
    tags: ['grain-free', 'natural', 'premium']
  },
  {
    id: 2,
    name: 'Interactive Puzzle Toy',
    description: 'Mental stimulation toy for intelligent play',
    price: 24.99,
    rating: 4.6,
    popularity: 88,
    discount: 0,
    vendor: 'SmartPup',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    categoryId: 'toys',
    tags: ['interactive', 'puzzle', 'mental-stimulation']
  },
  {
    id: 3,
    name: 'Orthopedic Memory Foam Bed',
    description: 'Therapeutic bed for optimal joint support',
    price: 89.99,
    rating: 4.9,
    popularity: 92,
    discount: 15,
    vendor: 'ComfortPets',
    image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    categoryId: 'bedding',
    tags: ['orthopedic', 'memory-foam', 'therapeutic']
  }
];