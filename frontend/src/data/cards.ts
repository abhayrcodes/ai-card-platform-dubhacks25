export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Card {
  id: string;
  name: string;
  origin: string;
  rarity: Rarity;
  imageUrl: string;
  description: string;
  element: 'starlight' | 'quantum' | 'primal' | 'nebula' | 'ember';
  stats: {
    power: number;
    speed: number;
    resilience: number;
  };
  owner: {
    name: string;
    avatarUrl: string;
  };
  mintedAt: string;
  priceCredits: number;
  likes: number;
}

// All cards are now fetched from the API - no dummy cards needed
export const cards: Card[] = [];
