import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { fetchImages, ImageItem, swapOwnership } from '../services/api';
import { Card } from '../data/cards';

// Initialize Stripe with a test publishable key
const stripePromise = loadStripe('pk_test_51234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function PaymentForm({ targetCard, randomUserCard, priceToPayCents, onSwapComplete }: {
  targetCard: Card;
  randomUserCard: Card;
  priceToPayCents: number;
  onSwapComplete: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setPaymentError('Card element not found');
      setIsProcessing(false);
      return;
    }

    // Since this is just for show, we'll simulate the payment process
    // In a real app, you'd create a payment intent on your backend
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      onSwapComplete();
    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-black border border-white thin-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <svg width="60" height="25" viewBox="0 0 60 25" fill="none">
            <path d="M59.5 12.5c0 6.904-5.596 12.5-12.5 12.5S34.5 19.404 34.5 12.5 40.096 0 47 0s12.5 5.596 12.5 12.5z" fill="#635bff"/>
            <path d="M47 7.5c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5z" fill="white"/>
          </svg>
          <h3 className="text-xl font-light text-white">Secure Payment</h3>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-light text-white mb-3">
            Card Information
          </label>
          <div className="border border-white thin-border p-4 bg-white">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-light text-white mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full border border-white thin-border px-4 py-3 text-white bg-black focus:border-white focus:outline-none placeholder-white/40"
          />
        </div>

        {paymentError && (
          <div className="mb-4 p-3 bg-black border border-red-400 thin-border">
            <p className="text-red-400 text-sm font-light">{paymentError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="clickable-item w-full bg-black text-white py-3 px-6 border border-white thin-border font-light hover:bg-white hover:text-black disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors tracking-wider"
        >
          {isProcessing ? 'PROCESSING...' : `PAY $${(priceToPayCents / 100).toFixed(2)}`}
        </button>

        <div className="mt-4 text-center">
          <p className="text-xs text-white/60 flex items-center justify-center gap-1 font-light">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 0C2.686 0 0 2.686 0 6s2.686 6 6 6 6-2.686 6-6S9.314 0 6 0zm0 1.5c2.485 0 4.5 2.015 4.5 4.5S8.485 10.5 6 10.5 1.5 8.485 1.5 6 3.515 1.5 6 1.5zM5.25 3v1.5H3.75v1.5h1.5V7.5h1.5V6h1.5V4.5h-1.5V3h-1.5z"/>
            </svg>
            SECURED BY STRIPE
          </p>
        </div>
      </div>
    </form>
  );
}

export function PaymentRoute() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [apiCards, setApiCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swapComplete, setSwapComplete] = useState(false);

  const targetCardId = searchParams.get('cardId');

  // Fetch cards from API on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const imageItems: ImageItem[] = await fetchImages();
        
        // Convert ImageItem[] to Card[] format
        const convertedCards: Card[] = imageItems.map((item, index) => ({
          id: item.ImageID,
          name: item.CardName || item.ImageID,
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
  }, []);

  // Get target card and user's cards
  const targetCard = useMemo(() => {
    return apiCards.find(card => card.id === targetCardId) || null;
  }, [apiCards, targetCardId]);

  const userCards = useMemo(() => {
    return apiCards.filter(card => card.owner.name === user?.id);
  }, [apiCards, user?.id]);

  // Randomly select a card from user's collection to trade
  const randomUserCard = useMemo(() => {
    if (userCards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * userCards.length);
    return userCards[randomIndex];
  }, [userCards]);

  // Calculate the price to pay
  const priceToPayCents = useMemo(() => {
    if (!targetCard || !randomUserCard) return 0;
    return Math.max(0, targetCard.priceCredits - randomUserCard.priceCredits);
  }, [targetCard, randomUserCard]);

  // Redirect if user is not logged in
  if (!user) {
    navigate('/collection');
    return null;
  }

  // Redirect if no target card specified
  if (!targetCardId) {
    navigate('/collection');
    return null;
  }

  // Redirect if user has no cards to trade
  if (!isLoading && userCards.length === 0) {
    navigate('/collection');
    return null;
  }

  // Redirect if user already owns the target card
  if (!isLoading && targetCard && targetCard.owner.name === user.id) {
    navigate('/collection');
    return null;
  }

  const handleSwapComplete = () => {
    setSwapComplete(true);
    // Redirect back to collection after 3 seconds
    setTimeout(() => {
      navigate('/collection');
    }, 3000);
  };

  const handleSwapCards = async () => {
    if (!user || !targetCard || !randomUserCard) {
      setError('Missing required information for swap');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting to swap cards:', {
        userID1: user.id,
        userID2: targetCard.owner.name,
        imageID1: randomUserCard.id,
        imageID2: targetCard.id
      });

      // Call the swap API
      await swapOwnership(
        user.id, // Current user ID
        targetCard.owner.name, // Target card owner ID
        randomUserCard.id, // User's card to give away
        targetCard.id // Target card to receive
      );

      // If successful, complete the swap
      handleSwapComplete();
    } catch (err) {
      console.error('Error swapping cards:', err);
      
      // Check if it's a CORS error
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('CORS Error: The API endpoint needs to be configured to allow requests from this domain. Please check the Lambda function CORS settings.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to swap cards');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center" style={{ fontFamily: 'Funnel Display, sans-serif' }}>
        <div className="text-center">
          <p className="text-white/60 font-light uppercase tracking-wider">LOADING PAYMENT DETAILS...</p>
        </div>
      </div>
    );
  }

  if (error || !targetCard || !randomUserCard) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center" style={{ fontFamily: 'Funnel Display, sans-serif' }}>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-medium mb-4 tracking-wide">PAYMENT ERROR</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            {error || 'Unable to process payment. Please try again.'}
          </p>
          <NavLink 
            to="/collection"
            className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors font-medium tracking-wider"
          >
            BACK TO COLLECTION
          </NavLink>
        </div>
      </div>
    );
  }

  if (swapComplete) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center" style={{ fontFamily: 'Funnel Display, sans-serif' }}>
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-medium mb-4 tracking-wide text-green-400">SWAP COMPLETE!</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            You have successfully traded <strong>{randomUserCard.name}</strong> for <strong>{targetCard.name}</strong>.
          </p>
          <p className="text-white/40 text-sm">
            Redirecting to collection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
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
              <span className="text-sm tracking-wider">PAYMENT PORTAL</span>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <NavLink to="/">
                  <text x="0" y="45" fontFamily="serif" fontSize="256" fontWeight="bold">COLLECTIFY</text>
              </NavLink>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-medium mb-4 tracking-wide">CARD SWAP PAYMENT</h2>
                <p className="text-white/60 leading-relaxed">
                  Complete your card trade transaction below
                </p>
              </div>

              {/* Purchase Summary */}
              <div className="bg-black border border-white thin-border p-6 mb-8">
                <h3 className="text-xl font-light mb-4 tracking-wide">PURCHASE SUMMARY</h3>
                
                <div className="flex justify-center">
                  {/* Target Card */}
                  <div className="text-center">
                    <div className="mb-3">
                      <img
                        src={targetCard.imageUrl}
                        alt={targetCard.name}
                        className="w-40 h-52 object-cover mx-auto border border-white thin-border"
                      />
                    </div>
                    <h4 className="text-sm font-light text-green-400 mb-1">YOU RECEIVE</h4>
                    <p className="text-white font-light text-lg">{targetCard.name}</p>
                    <p className="text-white/60 text-sm font-light">${(targetCard.priceCredits / 100).toFixed(2)} value</p>
                  </div>
                </div>

                {/* Price Calculation */}
                <div className="mt-6 pt-6 border-t border-white thin-border">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-white/80 font-light">Total Payment Required:</span>
                    <span className="text-green-400 font-light">
                      ${(priceToPayCents / 100).toFixed(2)}
                    </span>
                  </div>
                  {priceToPayCents === 0 && (
                    <p className="text-white/60 text-sm mt-2 font-light">
                      No additional payment needed!
                    </p>
                  )}
                </div>
              </div>

              {/* Stripe Payment Form */}
              <PaymentForm 
                targetCard={targetCard}
                randomUserCard={randomUserCard}
                priceToPayCents={priceToPayCents}
                onSwapComplete={handleSwapComplete}
              />

              {/* Swap Button */}
              <button
                onClick={handleSwapCards}
                disabled={isLoading}
                className="clickable-item w-full bg-white text-black py-4 px-8 text-xl font-light tracking-wider hover:bg-black hover:text-white border border-white thin-border transition-colors mt-6 disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                {isLoading ? 'SWAPPING...' : 'SWAP'}
              </button>
              
              <div className="text-center mt-4">
                <NavLink 
                  to="/collection"
                  className="text-white/60 hover:text-white text-sm tracking-wider transition-colors font-light"
                >
                  ← CANCEL AND RETURN TO COLLECTION
                </NavLink>
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

          {/* Payment Details */}
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0 p-4">
            <h3 className="text-sm font-medium mb-4 tracking-wider">PAYMENT BREAKDOWN</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Target Card Value:</span>
                <span className="text-white">${(targetCard.priceCredits / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Your Card Value:</span>
                <span className="text-white">-${(randomUserCard.priceCredits / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between font-medium">
                <span className="text-white">Total Due:</span>
                <span className="text-green-400">${(priceToPayCents / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <h4 className="text-xs font-medium mb-2 tracking-wider">TRANSACTION SECURITY</h4>
              <div className="space-y-2 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span>PCI Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Verified Merchant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Footer */}
          <div className="p-4 border-t border-white thin-border">
            <div className="text-center">
              <div className="text-xs text-white/40 tracking-wider">
                READY TO SWAP
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}
