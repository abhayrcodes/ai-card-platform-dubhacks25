import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { fetchImages, ImageItem } from '../services/api';
import { Card } from '../data/cards';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const [activeTab, setActiveTab] = useState('monthly');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [apiCards, setApiCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();

  // Fetch cards from API on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        const imageItems: ImageItem[] = await fetchImages();
        
        // Convert ImageItem[] to Card[] format using CardName from API
        const convertedCards: Card[] = imageItems.map((item, index) => ({
          id: item.ImageID,
          name: item.CardName || item.ImageID, // Use CardName from API, fallback to ImageID
          origin: 'API Generated',
          rarity: 'rare' as const,
          imageUrl: item.imageUrl,
          description: `Trading card ${item.ImageID}. Original file: ${item.FileName}. File size: ${item.FileSize} bytes.`,
          element: 'starlight' as const,
          stats: {
            power: Math.floor(Math.random() * 30) + 70,
            speed: Math.floor(Math.random() * 30) + 70,
            resilience: Math.floor(Math.random() * 30) + 70,
          },
          owner: {
            name: item.UserID || 'Unknown Creator',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.UserID || 'default'}`,
          },
          mintedAt: new Date(item.UploadDate).toLocaleDateString() || 'recently',
          priceCredits: Math.floor(Math.random() * 500) + 300,
          likes: Math.floor(Math.random() * 1000),
        }));
        
        setApiCards(convertedCards);
      } catch (err) {
        console.error('Error loading cards from API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden" style={{ fontFamily: 'Funnel Display, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500&display=swap');
        .thin-border {
          border-width: 0.5px !important;
        }
        .arrow-container {
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
        .arrow-tail {
          width: 12px;
          height: 1px;
          background-color: currentColor;
          transition: width 0.2s ease;
        }
        .arrow-head {
          width: 4px;
          height: 4px;
          border-right: 1px solid currentColor;
          border-top: 1px solid currentColor;
          transform: rotate(45deg);
        }
        .clickable-item:hover .arrow-tail {
          width: 6px;
        }
      `}</style>
      
      {/* Left Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-white thin-border">
          <div className="flex items-center gap-4">
            <span className="text-sm tracking-wider">C10 MEMBERSHIP</span>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <NavLink to="/">
                <text x="0" y="45" fontFamily="serif" fontSize="256" fontWeight="bold">COLLECTIFY</text>
            </NavLink>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Right Sidebar */}
      {showSidebar && (
        <div className="w-72 flex-shrink-0 flex flex-col border-l border-white thin-border min-w-0 h-screen">
          {/* Top Buttons */}
          <div className="flex">
            <NavLink 
              to="/"
              className="clickable-item flex-1 py-3 px-2 text-xs tracking-wider hover:bg-gray-900 flex items-center justify-center gap-1"
              style={{ borderRight: '0.5px solid white', borderBottom: '0.5px solid white' }}
            >
              <span>HOME</span>
              <div className="arrow-container">
                <div className="arrow-tail"></div>
                <div className="arrow-head"></div>
              </div>
            </NavLink>
            <NavLink 
              to="/collection"
              className="clickable-item flex-1 py-3 px-2 text-xs tracking-wider hover:bg-gray-900 flex items-center justify-center gap-1"
              style={{ borderRight: '0.5px solid white', borderBottom: '0.5px solid white' }}
            >
              <span>COLLECTION</span>
              <div className="arrow-container">
                <div className="arrow-tail"></div>
                <div className="arrow-head"></div>
              </div>
            </NavLink>
            {user ? (
              <button 
                onClick={logout}
                className="clickable-item flex-1 py-3 px-2 text-xs tracking-wider hover:bg-gray-900 flex items-center justify-center gap-1"
                style={{ borderBottom: '0.5px solid white' }}
              >
                <span>LOGOUT</span>
                <div className="arrow-container">
                  <div className="arrow-tail"></div>
                  <div className="arrow-head"></div>
                </div>
              </button>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="clickable-item flex-1 py-3 px-2 text-xs tracking-wider hover:bg-gray-900 flex items-center justify-center gap-1"
                style={{ borderBottom: '0.5px solid white' }}
              >
                <span>LOGIN</span>
                <div className="arrow-container">
                  <div className="arrow-tail"></div>
                  <div className="arrow-head"></div>
                </div>
              </button>
            )}
          </div>

          {/* User Info Section (when logged in) */}
          {user && (
            <div className="p-4 border-b border-white thin-border">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium tracking-wide">{user.name}</p>
                  <p className="text-xs text-white/60">{user.handle}</p>
                </div>
                <NavLink 
                  to="/create-card"
                  className="text-xs tracking-wider text-white hover:text-white/80 transition-colors border border-white/20 px-2 py-1 hover:bg-white/10"
                >
                  CREATE CARD
                </NavLink>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-wide">CREDITS</span>
                <span className="text-xs font-medium">{user.balanceCredits.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Benefits List */}
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            <div className="p-3" style={{ borderBottom: '0.5px solid white' }}>
              <input
                type="text"
                placeholder="SEARCH CARDS..."
                className="w-full bg-transparent text-xs tracking-wider font-light text-white placeholder-gray-400 outline-none border-none"
                style={{ background: 'transparent', border: 'none' }}
              />
            </div>
            
            <div className="flex-1 min-h-0">
              {apiCards.slice(0, 10).map((card, index) => (
                <NavLink
                  key={card.id}
                  to={`/collection?cardId=${card.id}`}
                  className="clickable-item px-3 py-2 hover:bg-gray-900 cursor-pointer flex items-center justify-between"
                  style={{ borderBottom: index < 9 ? '0.5px solid white' : 'none' }}
                >
                  <span className="text-xs font-light text-gray-400">{String(index + 1).padStart(2, '0')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-wider truncate">{card.name.toUpperCase().substring(0, 15)}</span>
                    <div className="arrow-container">
                      <div className="arrow-tail"></div>
                      <div className="arrow-head"></div>
                    </div>
                  </div>
                </NavLink>
              ))}
              {apiCards.length === 0 && !isLoading && (
                <div className="px-3 py-4 text-center">
                  <span className="text-xs text-white/40 tracking-wider">NO CARDS AVAILABLE</span>
                </div>
              )}
              {isLoading && (
                <div className="px-3 py-4 text-center">
                  <span className="text-xs text-white/40 tracking-wider">LOADING...</span>
                </div>
              )}
            </div>
          </div>

          {/* Buy Button - Disabled in Layout component since no card is selected */}
          <div className="buy-button-container relative bg-white text-black p-10 flex items-center justify-center cursor-not-allowed overflow-hidden">
            <style>{`
              .buy-button-container {
                transition: background-color 0.3s ease, color 0.3s ease;
              }
              .buy-button-container:hover {
                background-color: black;
                color: white;
              }
              .buy-text {
                transition: transform 0.3s ease;
              }
              .buy-button-container:hover .buy-text {
                transform: translateY(-100%);
              }
              .price-text {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                transition: transform 0.3s ease;
              }
              .buy-button-container:hover .price-text {
                transform: translateY(-100%);
              }
            `}</style>
            <h2 className="buy-text text-5xl font-medium">BUY</h2>
            <div className="price-text">
              <div className="flex items-start justify-center">
                <span className="text-3xl mt-2">$</span>
                <span className="text-6xl font-medium">9</span>
                <div className="flex flex-col items-start ml-2">
                  <span className="text-3xl">.99</span>
                  <span className="text-xs font-light mt-1 text-gray-400">/MONTH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}
