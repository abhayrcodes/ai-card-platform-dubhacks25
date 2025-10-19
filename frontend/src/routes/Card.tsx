import { useMemo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { fetchImages, ImageItem } from '../services/api';
import { Card } from '../data/cards';

export function CardRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserCards } = useAuth();
  const [apiCards, setApiCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cards from API on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const imageItems: ImageItem[] = await fetchImages();
        
        // Convert ImageItem[] to Card[] format using ImageID as card name
        const convertedCards: Card[] = imageItems.map((item, index) => ({
          id: item.ImageID,
          name: item.ImageID, // Use ImageID as the card name
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

  const card = useMemo(() => {
    // First check API cards
    const apiCard = apiCards.find((item) => item.id === id);
    if (apiCard) return apiCard;
    
    // Then check user's custom cards
    const userCards = getUserCards();
    return userCards.find((item) => item.id === id);
  }, [id, apiCards, getUserCards]);

  if (isLoading) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Loading card...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Error loading card</p>
            <p className="text-xs text-white/60">{error}</p>
            <button
              type="button"
              className="border border-white thin-border px-6 py-3 text-xs uppercase tracking-[0.3em] text-white hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_white] transition-all"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!card) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Card not found</p>
            <button
              type="button"
              className="border border-white thin-border px-6 py-3 text-xs uppercase tracking-[0.3em] text-white hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_white] transition-all"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={false}>
      <style>{`
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
        .card-face {
          backface-visibility: hidden;
        }
      `}</style>
      
      <div className="overflow-y-auto h-full bg-black">
        {/* Back Button */}
        <button
          type="button"
          className="absolute top-8 left-8 text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors z-20"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {/* Trading Card Layout */}
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Rotating Card */}
            <div className="flex justify-center" style={{ perspective: '1000px' }}>
              <div className="rotating-card w-80 h-96 relative">
                <div className="card-face absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-white/20 rounded-xl p-6 shadow-2xl">
                  <div className="h-full flex flex-col">
                    {/* Card Header */}
                    <div className="text-center mb-4">
                      <h1 className="text-2xl font-bold text-white mb-1">{card.name}</h1>
                      <p className="text-xs text-white/60 uppercase tracking-wider">{card.origin}</p>
                    </div>
                    
                    {/* Card Image */}
                    <div className="flex-1 mb-4">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-48 object-cover rounded-lg border border-white/30"
                      />
                    </div>
                    
                    {/* Card Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-white/10 rounded p-2">
                        <div className="text-lg font-bold text-white">{card.stats.power}</div>
                        <div className="text-xs text-white/60">PWR</div>
                      </div>
                      <div className="bg-white/10 rounded p-2">
                        <div className="text-lg font-bold text-white">{card.stats.speed}</div>
                        <div className="text-xs text-white/60">SPD</div>
                      </div>
                      <div className="bg-white/10 rounded p-2">
                        <div className="text-lg font-bold text-white">{card.stats.resilience}</div>
                        <div className="text-xs text-white/60">RES</div>
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="flex justify-between items-center text-xs text-white/60">
                      <span className="capitalize">{card.rarity}</span>
                      <span className="capitalize">{card.element}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">{card.name}</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              {/* Card Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Card Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Rarity:</span>
                      <span className="text-white capitalize">{card.rarity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Element:</span>
                      <span className="text-white capitalize">{card.element}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Origin:</span>
                      <span className="text-white">{card.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Price:</span>
                      <span className="text-green-400 font-semibold">${(card.priceCredits / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Minted:</span>
                      <span className="text-white">{card.mintedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Owner</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={card.owner.avatarUrl}
                      alt={card.owner.name}
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                    />
                    <div>
                      <div className="text-white font-medium">{card.owner.name}</div>
                      <div className="text-white/60 text-sm">{card.likes.toLocaleString()} likes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="w-full bg-white text-black py-4 px-8 rounded-lg font-semibold text-lg hover:bg-white/90 transition-colors"
              >
                Purchase - ${(card.priceCredits / 100).toFixed(2)}
              </button>

              {/* Card Abilities */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Abilities</h3>
                <p className="text-white/70 leading-relaxed">
                  This {card.rarity} {card.element} card possesses unique abilities that scale with its elemental power. 
                  The {card.element} element grants special bonuses in combat scenarios, while its {card.rarity} rarity ensures 
                  exceptional performance in competitive play.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
