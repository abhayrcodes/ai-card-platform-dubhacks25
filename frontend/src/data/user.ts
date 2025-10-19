export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  balanceCredits: number;
  badges: string[];
  stats: {
    cardsCreated: number;
    cardsSold: number;
    auctionWinRate: number;
    totalEarnings: number;
  };
  activity: Array<{
    id: string;
    type: 'won' | 'listed' | 'created';
    description: string;
    timestamp: string;
  }>;
}

export const currentUser: UserProfile = {
  id: 'user-001',
  name: 'Ava Kim',
  handle: '@nebula.dev',
  avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=AvaKim',
  balanceCredits: 2750,
  badges: ['Founding Creator', 'AI Whisperer', 'Top Seller'],
  stats: {
    cardsCreated: 24,
    cardsSold: 17,
    auctionWinRate: 64,
    totalEarnings: 12840,
  },
  activity: [
    {
      id: 'activity-01',
      type: 'won',
      description: 'Won Aurora Vanguard for 1,240 credits',
      timestamp: '2 minutes ago',
    },
    {
      id: 'activity-02',
      type: 'listed',
      description: 'Listed Circuit Whisperer for live auction',
      timestamp: '1 hour ago',
    },
    {
      id: 'activity-03',
      type: 'created',
      description: 'Generated Quantum Prismatic from demo upload',
      timestamp: 'yesterday',
    },
  ],
};
