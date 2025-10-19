import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from '../components/LoginModal';
import { fetchImages, ImageItem } from '../services/api';
import { Card } from '../data/cards';
import psychedelicBackground from '../assets/psychedelic-distorted-lines-seamless-texture-moire-effect-abstract-striped-pattern-curves-stripes-background-illustration-252414496.webp';

export function CollectionRoute() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [apiCards, setApiCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userIdFilter = searchParams.get('userId');

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  // Handle search input clear
  const handleSearchClear = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  // Fetch cards from API on component mount and when search changes
  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch images from API with search query if provided
        const searchTerm = searchQuery.trim() || null;
        const imageItems: ImageItem[] = await fetchImages(userIdFilter, searchTerm);
        console.log(imageItems);
        
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
        setError(err instanceof Error ? err.message : 'Failed to load cards');
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [userIdFilter, searchQuery]);
  
  // Use API cards directly since API already includes user cards
  const displayCards = apiCards;

  // Get the selected card details
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    
    // Check API cards (which already includes user cards)
    return apiCards.find((item: Card) => item.id === selectedCardId) || null;
  }, [selectedCardId, apiCards]);

  if (!user) {
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-medium mb-4 tracking-wide">YOUR COLLECTION</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Please log in to view and manage your personal card collection. 
                Each user has their own unique collection of trading cards.
              </p>
              <div className="text-white/40 text-sm">
                Click the LOGIN button in the sidebar to access your collection.
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
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
          </div>

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
              {[
                { num: '01', text: 'MOVIE TICKETS' },
                { num: '02', text: 'MONTHLY CREDITS' },
                { num: '03', text: 'BIRTHDAY GIFT' },
                { num: '04', text: '10% DISCOUNT' },
                { num: '05', text: 'ZINE SUBSCRIPTION' },
                { num: '06', text: 'MERCH PERKS' },
                { num: '07', text: 'EXCLUSIVE CONTENT' },
                { num: '08', text: 'VIP TREATMENT' },
              ].map((benefit, index) => (
                <div 
                  key={benefit.num} 
                  className="clickable-item px-3 py-2 hover:bg-gray-900 cursor-pointer flex items-center justify-between"
                  style={{ borderBottom: index < 7 ? '0.5px solid white' : 'none' }}
                >
                  <span className="text-xs font-light text-gray-400">{benefit.num}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-wider">{benefit.text}</span>
                    <div className="arrow-container">
                      <div className="arrow-tail"></div>
                      <div className="arrow-head"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Button */}
          <div className="buy-button-container relative bg-white text-black p-10 flex items-center justify-center cursor-pointer overflow-hidden">
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
        
        {/* Login Modal */}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      </div>
    );
  }

  if (apiCards.length === 0 && !isLoading) {
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-medium mb-4 tracking-wide">YOUR COLLECTION</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Welcome {user.name}! Your collection is empty. 
                Start building your collection by purchasing cards from the market.
              </p>
              <div className="text-white/40 text-sm">
                Visit the market to discover and collect amazing AI-generated trading cards.
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
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
          </div>

          {/* User Info Section */}
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
              {[
                { num: '01', text: 'MOVIE TICKETS' },
                { num: '02', text: 'MONTHLY CREDITS' },
                { num: '03', text: 'BIRTHDAY GIFT' },
                { num: '04', text: '10% DISCOUNT' },
                { num: '05', text: 'ZINE SUBSCRIPTION' },
                { num: '06', text: 'MERCH PERKS' },
                { num: '07', text: 'EXCLUSIVE CONTENT' },
                { num: '08', text: 'VIP TREATMENT' },
              ].map((benefit, index) => (
                <div 
                  key={benefit.num} 
                  className="clickable-item px-3 py-2 hover:bg-gray-900 cursor-pointer flex items-center justify-between"
                  style={{ borderBottom: index < 7 ? '0.5px solid white' : 'none' }}
                >
                  <span className="text-xs font-light text-gray-400">{benefit.num}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-wider">{benefit.text}</span>
                    <div className="arrow-container">
                      <div className="arrow-tail"></div>
                      <div className="arrow-head"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Button */}
          <div className="buy-button-container relative bg-white text-black p-10 flex items-center justify-center cursor-pointer overflow-hidden">
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
        
        {/* Login Modal */}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      </div>
    );
  }

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
        @keyframes cardRotate {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
        .rotating-card {
          animation: cardRotate 8s linear infinite;
          transform-style: preserve-3d;
        }
        .rotating-card:hover {
          animation-play-state: paused;
          transform-style: flat;
          transform: rotateY(0deg) !important;
        }
        .card-face {
          backface-visibility: hidden;
        }
        .card-front {
          transform: rotateY(0deg);
        }
        .card-back {
          transform: rotateY(180deg);
        }
        .card-front-enhanced {
          position: relative;
          overflow: visible;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .card-front-enhanced .card-image {
          filter: blur(2px);
          transition: all 0.3s ease;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          position: relative;
          z-index: 1;
        }
        .card-front-enhanced:hover .card-image {
          filter: blur(1px);
          transform: translateY(30px);
        }
        .noise-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.15;
          transition: opacity 0.3s ease;
          z-index: 2;
        }
        .card-front-enhanced:hover .noise-overlay {
          opacity: 0.08;
        }
        .card-info-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          padding: 12px;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 3;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-front-enhanced:hover .card-info-overlay {
          opacity: 1;
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
        <div className="flex-1 overflow-hidden">
          {selectedCard ? (
            // Selected Card View with Rotating Card
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="flex justify-center items-center w-full h-full" style={{ perspective: '1200px' }}>
                <div className="rotating-card w-96 h-[32rem] relative">
                  {/* Front Face */}
                  <div className="card-face card-front card-front-enhanced absolute inset-0 shadow-2xl">
                    {/* Background Image */}
                    <img
                      src={selectedCard.imageUrl}
                      alt={selectedCard.name}
                      className="card-image absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Noise Overlay */}
                    <div className="noise-overlay"></div>
                    
                    {/* Hover Info Overlay */}
                    <div className="card-info-overlay">
                      <div className="flex items-center justify-between w-full text-white font-light text-sm drop-shadow-lg">
                        <span className="flex-shrink-0">${(selectedCard.priceCredits / 100).toFixed(2)}</span>
                        <span className="truncate px-2 flex-1 text-center">{selectedCard.name}</span>
                        <span className="flex-shrink-0">{selectedCard.owner.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="card-face card-back absolute inset-0 border-2 border-white shadow-2xl overflow-hidden">
                    {/* Psychedelic Background Image */}
                    <img
                      src={psychedelicBackground}
                      alt="Psychedelic Background"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Collection Grid
            <div className="flex-1 flex flex-col">
              <div className="p-6">
                <h2 className="text-2xl font-medium tracking-wide mb-2">
                  {userIdFilter ? `${userIdFilter}'s Collection` : 'All Cards Collection'}
                </h2>
                <p className="text-white/60 text-sm">
                  {isLoading ? (
                    'Loading cards from API...'
                  ) : error ? (
                    `Error: ${error}`
                  ) : searchQuery ? (
                    <>
                      {displayCards.length} cards match "{searchQuery}" • ${(user.balanceCredits / 100).toFixed(2)} available
                    </>
                  ) : userIdFilter ? (
                    <>
                      {displayCards.length} cards by {userIdFilter} • ${(user.balanceCredits / 100).toFixed(2)} available
                    </>
                  ) : (
                    <>
                      {displayCards.length} total cards • ${(user.balanceCredits / 100).toFixed(2)} available
                    </>
                  )}
                </p>
              </div>
              
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white/60 font-light uppercase tracking-wider">LOADING CARDS FROM API...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <h3 className="text-xl font-light mb-2 uppercase tracking-wider">FAILED TO LOAD CARDS</h3>
                    <p className="text-white/60 mb-4 font-light uppercase tracking-wider">{error.toUpperCase()}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors font-light uppercase tracking-wider"
                    >
                      RETRY
                    </button>
                  </div>
                </div>
              ) : displayCards.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <h3 className="text-xl font-light mb-2 uppercase tracking-wider">NO CARDS FOUND</h3>
                    <p className="text-white/60 font-light uppercase tracking-wider">
                      {searchQuery ? `NO CARDS MATCH "${searchQuery.toUpperCase()}"` : 'NO CARDS AVAILABLE AT THE MOMENT.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-8 h-full w-full overflow-y-auto" style={{ gap: '0px' }}>
                  {displayCards.map((card, index) => (
                    <div
                      key={card.id}
                      className="relative aspect-[3/4] cursor-pointer card-item group border-0"
                      onClick={() => {
                        setSelectedCardId(card.id);
                      }}
                    >
                      <div className="w-full h-full overflow-hidden">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-full h-full object-cover card-image"
                          loading="lazy"
                        />
                      </div>
                      {/* Owned indicator - only show if current user owns this card */}
                      {card.owner.name === user.id && (
                        <div className="absolute top-2 right-2 bg-black text-white border border-white px-2 py-1 text-xs font-medium">
                          OWNED
                        </div>
                      )}
                      {/* Card info overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <div className="bg-black/90 text-white px-6 py-4 rounded-xl backdrop-blur-sm text-center border border-white/20 shadow-2xl">
                          <div className="text-xl font-bold mb-1">{card.name}</div>
                          <div className="text-sm text-white/70 capitalize mb-2">{card.rarity} • {card.element}</div>
                          <div className="text-lg font-semibold text-green-400">${(card.priceCredits / 100).toFixed(2)}</div>
                          <div className="text-xs text-white/50 mt-1">Click to view details</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
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
        </div>

        {/* User Info Section */}
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

        {/* Card Details or Benefits List */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {selectedCard ? (
            // Card Details View
            <div className="flex flex-col h-full">
              {/* Close Button */}
              <div className="p-4 border-b border-white thin-border">
                <button
                  onClick={() => setSelectedCardId(null)}
                  className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors"
                >
                  ← Close Details
                </button>
              </div>

              {/* Card Details */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{selectedCard.name}</h3>
                    <p className="text-white/80 text-sm leading-relaxed mb-4">
                      {selectedCard.description}
                    </p>
                  </div>

                  {/* Card Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-white">Card Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Rarity:</span>
                        <span className="text-white capitalize">{selectedCard.rarity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Element:</span>
                        <span className="text-white capitalize">{selectedCard.element}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Origin:</span>
                        <span className="text-white">{selectedCard.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Price:</span>
                        <span className="text-green-400 font-semibold">${(selectedCard.priceCredits / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Minted:</span>
                        <span className="text-white">{selectedCard.mintedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="space-y-3">
                    <h4 className="text-md font-semibold text-white">Owner</h4>
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedCard.owner.avatarUrl}
                        alt={selectedCard.owner.name}
                        className="w-10 h-10 rounded-full border-2 border-white/20"
                      />
                      <div>
                        <div className="text-white font-medium text-sm">{selectedCard.owner.name}</div>
                        <div className="text-white/60 text-xs">{selectedCard.likes.toLocaleString()} likes</div>
                      </div>
                    </div>
                  </div>


                  {/* Card Abilities */}
                  <div className="space-y-3">
                    <h4 className="text-md font-semibold text-white">Abilities</h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      This {selectedCard.rarity} {selectedCard.element} card possesses unique abilities that scale with its elemental power. 
                      The {selectedCard.element} element grants special bonuses in combat scenarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Default Benefits List
            <>
              <div className="p-3" style={{ borderBottom: '0.5px solid white' }}>
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="SEARCH CARDS..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 bg-transparent text-xs tracking-wider font-light text-white placeholder-gray-400 outline-none border-none"
                    style={{ background: 'transparent', border: 'none' }}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleSearchClear}
                      className="text-white/40 hover:text-white/80 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </form>
              </div>
              
              <div className="flex-1 min-h-0">
                {displayCards.slice(0, 10).map((card, index) => (
                  <div 
                    key={card.id} 
                    className="clickable-item px-3 py-2 hover:bg-gray-900 cursor-pointer flex items-center justify-between"
                    style={{ borderBottom: index < 9 ? '0.5px solid white' : 'none' }}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <span className="text-xs font-light text-gray-400">{String(index + 1).padStart(2, '0')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tracking-wider truncate">{card.name.toUpperCase().substring(0, 15)}</span>
                      <div className="arrow-container">
                        <div className="arrow-tail"></div>
                        <div className="arrow-head"></div>
                      </div>
                    </div>
                  </div>
                ))}
                {displayCards.length === 0 && !isLoading && (
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
            </>
          )}
        </div>

          {/* Buy Button */}
          <div 
            className={`buy-button-container relative bg-white text-black p-10 flex items-center justify-center overflow-hidden ${selectedCard && selectedCard.owner.name !== user.id ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={() => {
              if (selectedCard && selectedCard.owner.name !== user.id) {
                navigate(`/payment?cardId=${selectedCard.id}`);
              }
            }}
          >
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
            {selectedCard ? (
              selectedCard.owner.name !== user.id ? (
                <>
                  <h2 className="buy-text text-3xl font-medium">PURCHASE</h2>
                  <div className="price-text">
                    <div className="flex items-start justify-center">
                      <span className="text-3xl mt-2">$</span>
                      <span className="text-6xl font-medium">{Math.floor(selectedCard.priceCredits / 100)}</span>
                      <div className="flex flex-col items-start ml-2">
                        <span className="text-3xl">.{(selectedCard.priceCredits % 100).toString().padStart(2, '0')}</span>
                        <span className="text-xs font-light mt-1 text-gray-400">{selectedCard.name.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="buy-text text-3xl font-medium">PURCHASE</h2>
                  <div className="price-text">
                    <h2 className="text-5xl font-medium">OWNED</h2>
                  </div>
                </>
              )
            ) : (
              <>
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
              </>
            )}
          </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
}
