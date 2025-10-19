import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../data/user';
import { Card, cards } from '../data/cards';

interface AuthContextType {
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addCardToCollection: (card: Card) => void;
  getUserCards: () => Card[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - in a real app, this would be handled by a backend
const mockUsers: Array<{
  id: string;
  username: string;
  password: string;
  profile: UserProfile;
}> = [
  {
    id: 'user-001',
    username: 'ava.kim',
    password: 'password123',
    profile: {
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
    },
  },
];

// Store user collections in localStorage
const getUserCollectionKey = (userId: string) => `userCollection_${userId}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser(foundUser.profile);
      localStorage.setItem('currentUser', JSON.stringify(foundUser.profile));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (username: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if username already exists
    const existingUser = mockUsers.find(u => u.username === username);
    if (existingUser) {
      setIsLoading(false);
      return false;
    }
    
    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password,
      profile: {
        id: `user-${Date.now()}`,
        name,
        handle: `@${username}`,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
        balanceCredits: 1000, // Starting credits
        badges: ['New Collector'],
        stats: {
          cardsCreated: 0,
          cardsSold: 0,
          auctionWinRate: 0,
          totalEarnings: 0,
        },
        activity: [],
      },
    };
    
    mockUsers.push(newUser);
    setUser(newUser.profile);
    localStorage.setItem('currentUser', JSON.stringify(newUser.profile));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const addCardToCollection = (card: Card) => {
    if (!user) return;
    
    const collectionKey = getUserCollectionKey(user.id);
    const existingCollection = JSON.parse(localStorage.getItem(collectionKey) || '[]') as Card[];
    
    // Add the new card to the collection
    const updatedCollection = [...existingCollection, card];
    localStorage.setItem(collectionKey, JSON.stringify(updatedCollection));
  };

  const getUserCards = (): Card[] => {
    if (!user) return [];
    
    const collectionKey = getUserCollectionKey(user.id);
    const userCollection = JSON.parse(localStorage.getItem(collectionKey) || '[]') as Card[];
    
    // For demo purposes, also include some default cards for the demo user
    if (user.id === 'user-001') {
      const defaultCardIds = ['card-001', 'card-003', 'card-005'];
      const defaultCards = cards.filter((card: Card) => defaultCardIds.includes(card.id));
      return [...defaultCards, ...userCollection];
    }
    
    return userCollection;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, addCardToCollection, getUserCards }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
