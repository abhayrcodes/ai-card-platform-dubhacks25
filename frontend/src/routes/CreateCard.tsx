import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../data/cards';
import { uploadImage, generateTradingCard, UploadImageResponse, GenerateCardResponse } from '../services/api';
import { 
  trackCardCreationStarted, 
  trackCardGenerationCompleted, 
  trackCardSavedToCollection, 
  trackCardCreationAbandoned,
  trackFormFieldCompleted 
} from '../services/statsig';

export function CreateCardRoute() {
  const navigate = useNavigate();
  const { user, addCardToCollection } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    artist: '',
    venue: '',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<GenerateCardResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasStartedCreation, setHasStartedCreation] = useState(false);

  // Track when user starts creating a card (first form interaction)
  useEffect(() => {
    if (!hasStartedCreation && (formData.name || formData.artist || formData.venue || formData.date || formData.image)) {
      trackCardCreationStarted();
      setHasStartedCreation(true);
    }
  }, [formData, hasStartedCreation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Track form field completion
    if (value.trim()) {
      trackFormFieldCompleted(name);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1: Generate trading card
  const handleGenerateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to create a card');
      return;
    }

    if (!formData.image) {
      alert('Please upload an image');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Convert file to base64 for the API
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(formData.image!);
      });

      // Generate trading card using the process-image API
      const cardResponse: GenerateCardResponse = await generateTradingCard(
        base64Image,
        {
          name: formData.name,
          artist: formData.artist,
          venue: formData.venue,
          date: formData.date,
        }
      );
      
      setGeneratedCard(cardResponse);
      setIsGenerating(false);
      
      // Track successful card generation
      trackCardGenerationCompleted(true, formData.name);
      
    } catch (error) {
      console.error('Error generating card:', error);
      alert(`Failed to generate card: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsGenerating(false);
      
      // Track failed card generation
      trackCardGenerationCompleted(false, formData.name);
    }
  };

  // Step 2: Save generated card to gallery
  const handleSaveToGallery = async () => {
    if (!user || !generatedCard || !formData.image) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Get the generated card base64 data (to avoid CORS issues with S3)
      const generatedImageBase64 = generatedCard.results[0]?.base64;
      if (!generatedImageBase64) {
        throw new Error('No generated card image data found');
      }

      // Convert base64 to blob and then to File for upload
      const byteCharacters = atob(generatedImageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const generatedFile = new File([blob], `generated-${formData.name}.jpg`, { type: 'image/jpeg' });

      // Upload the generated card using existing upload API
      const uploadResponse: UploadImageResponse = await uploadImage(
        generatedFile,
        user.id,
        formData.name,
        formData.artist,
        formData.venue,
        formData.date
      );
      
      // Create a new card object from the upload response
      const newCard: Card = {
        id: uploadResponse.imageId,
        name: uploadResponse.cardName,
        origin: 'AI Generated',
        rarity: uploadResponse.rarity.toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary',
        imageUrl: `https://user-images-storage-2025-dubhacks2025.s3.us-west-2.amazonaws.com/${uploadResponse.s3Key}`,
        description: `An AI-generated trading card created by ${user.name}. Features ${uploadResponse.artist} performing at ${uploadResponse.venue} on ${uploadResponse.eventDate}.`,
        element: 'starlight' as const,
        stats: {
          power: Math.floor(Math.random() * 30) + 70,
          speed: Math.floor(Math.random() * 30) + 70,
          resilience: Math.floor(Math.random() * 30) + 70,
        },
        owner: {
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        mintedAt: 'just now',
        priceCredits: Math.round(uploadResponse.priceEstimate * 100),
        likes: 0,
      };
      
      // Add the card to the user's collection
      addCardToCollection(newCard);
      
      // Track successful card save
      trackCardSavedToCollection(uploadResponse.cardName, uploadResponse.imageId);
      
      alert(`Card "${uploadResponse.cardName}" saved to your collection!`);
      
      // Reset form and state
      setFormData({
        name: '',
        date: '',
        artist: '',
        venue: '',
        image: null
      });
      setImagePreview(null);
      setGeneratedCard(null);
      setIsSaving(false);
      
      // Navigate to collection to show the new card
      navigate('/collection');
      
    } catch (error) {
      console.error('Error saving card:', error);
      alert(`Failed to save card: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSaving(false);
    }
  };

  const isFormValid = formData.name && formData.date && formData.artist && formData.venue && formData.image;

  return (
    <Layout>
      <style>{`
        .thin-border {
          border-width: 0.5px !important;
        }
      `}</style>
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-light tracking-wide mb-2 text-white">CREATE CUSTOM CARD</h1>
          <p className="text-white/60 text-sm font-light">
            DESIGN YOUR OWN TRADING CARD WITH CUSTOM DETAILS AND ARTWORK
          </p>
        </div>

        <div className="flex h-full border-t border-white thin-border">
          {/* Form Section */}
          <div className="flex-1 p-8">
            <form onSubmit={handleGenerateCard} className="max-w-md space-y-6">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black border border-white thin-border text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors font-light text-xs tracking-wider"
                placeholder="CARD NAME"
                required
              />

              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black border border-white thin-border text-white focus:outline-none focus:border-white transition-colors font-light text-xs tracking-wider"
                required
              />

              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black border border-white thin-border text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors font-light text-xs tracking-wider"
                placeholder="ARTIST NAME"
                required
              />

              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black border border-white thin-border text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors font-light text-xs tracking-wider"
                placeholder="VENUE NAME"
                required
              />

              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full px-4 py-3 bg-black border border-white thin-border text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-light file:bg-black file:text-white file:tracking-wider hover:file:bg-white/10 focus:outline-none focus:border-white transition-colors font-light text-xs tracking-wider"
                required
              />

              <button
                type="submit"
                disabled={!isFormValid || isGenerating}
                className="w-full py-3 px-6 bg-black text-white font-light border border-white thin-border hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_white] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all text-xs tracking-wider"
              >
                {isGenerating ? 'GENERATING CARD...' : 'GENERATE CARD'}
              </button>

              {!user && (
                <p className="text-white/60 text-xs text-center font-light tracking-wider">
                  PLEASE LOG IN TO CREATE CUSTOM CARDS
                </p>
              )}
            </form>
          </div>

          {/* Preview Section */}
          <div className="flex-1 p-8 border-l border-white thin-border">
            <h3 className="text-xl font-light text-white mb-6 tracking-wider">
              {generatedCard ? 'GENERATED TRADING CARD' : 'CARD PREVIEW'}
            </h3>
            
            <div className="max-w-sm mx-auto">
              <div className="aspect-[3/4] bg-black border border-white thin-border overflow-hidden relative">
                {/* Show generated card if available */}
                {generatedCard ? (
                  <img
                    src={`data:image/jpeg;base64,${generatedCard.results[0]?.base64}`}
                    alt="Generated trading card"
                    className="w-full h-full object-cover"
                  />
                ) : isGenerating ? (
                  /* Progressive loading animation */
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 relative">
                        <div className="w-full h-full border border-white thin-border"></div>
                        <div 
                          className="absolute top-0 left-0 bg-white transition-all duration-1000 ease-out"
                          style={{
                            width: '100%',
                            height: '100%',
                            animation: 'fillUp 3s ease-out infinite'
                          }}
                        ></div>
                      </div>
                      <p className="text-white/60 text-xs font-light tracking-wider">GENERATING YOUR TRADING CARD...</p>
                    </div>
                  </div>
                ) : imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Card preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    <div className="text-center">
                      <p className="text-xs font-light tracking-wider">UPLOAD AN IMAGE TO SEE PREVIEW</p>
                    </div>
                  </div>
                )}
                
                {/* Card Info Overlay - only show for original preview, not generated card */}
                {!generatedCard && !isGenerating && (formData.name || formData.artist || formData.venue || formData.date) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {formData.name && (
                      <h4 className="text-white font-light text-lg mb-1 tracking-wider">{formData.name}</h4>
                    )}
                    {formData.artist && (
                      <p className="text-white/80 text-sm font-light tracking-wider">{formData.artist}</p>
                    )}
                    {formData.venue && (
                      <p className="text-white/60 text-xs font-light tracking-wider">{formData.venue}</p>
                    )}
                    {formData.date && (
                      <p className="text-white/60 text-xs font-light tracking-wider">{formData.date}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Save to Gallery Button */}
              {generatedCard && (
                <button
                  onClick={handleSaveToGallery}
                  disabled={isSaving}
                  className="w-full mt-4 py-3 px-6 bg-black text-white font-light border border-white thin-border hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_white] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all text-xs tracking-wider"
                >
                  {isSaving ? 'SAVING TO GALLERY...' : 'SAVE TO GALLERY'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
