// API configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Types for API responses - Updated to match actual API structure
export interface ImageItem {
  ImageID: string;
  imageUrl: string;
  FileName: string;
  ContentType: string;
  FileSize: number;
  UserID: string;
  UploadDate: string;
  CardName: string;
}

export interface UploadImageResponse {
  message: string;
  imageId: string;
  userId: string;
  cardName: string;
  artist: string;
  venue: string;
  eventDate: string;
  rarity: string;
  rating: number;
  category: string;
  condition: string;
  priceEstimate: number;
  s3Key: string;
}

export interface GenerateCardResponse {
  type: 'image_result';
  count: number;
  results: {
    url: string;
    base64?: string;
  }[];
}

// Image retrieval API
export async function fetchImages(userId: string | null = null, search: string | null = null): Promise<ImageItem[]> {
  const query = new URLSearchParams();
  if (userId) query.append("userId", userId);
  if (search) query.append("search", search);

  const response = await fetch(`${API_BASE}/images/images?${query.toString()}`);
  console.log(response);

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Fetch failed: ${err}`);
  }

  const data = await response.json();
  return data.images || [];
}

// Image upload API - Updated to match Lambda structure
export async function uploadImage(
  file: File, 
  userId: string,
  cardName?: string,
  artist?: string,
  venue?: string,
  date?: string
): Promise<UploadImageResponse> {
  try {
    // Convert file to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const requestBody = {
      userId,
      image: base64Image,
      fileName: file.name,
      contentType: file.type,
      cardName,
      artist,
      venue,
      date
    };

    console.log('Uploading to:', `${API_BASE}/upload`);
    console.log('Request body keys:', Object.keys(requestBody));
    console.log('File size:', file.size, 'bytes');

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const err = await response.text();
      console.error('Upload error response:', err);
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${err}`);
    }

    const result = await response.json();
    console.log('Upload success:', result);
    return result;
    
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
    }
    throw error;
  }
}
// Types for Lambda response
export interface GeneratedImageResult {
  url: string;
  base64?: string;
}

export interface GenerateCardResponse {
  type: 'image_result';
  count: number;
  results: GeneratedImageResult[];
}

// Trading card generation API
export async function generateTradingCard(
  image: string, // base64 or s3:// URL
  cardData: {
    name: string;
    artist?: string;
    venue?: string;
    date?: string;
    description?: string;
    element?: string;
    rarity?: string;
  }
): Promise<GenerateCardResponse> {
  // Build a short, styled prompt for the card
  const promptParts = [
    cardData.name && `Name: ${cardData.name}`,
    cardData.description && `Description: ${cardData.description}`,
    cardData.artist && `Artist: ${cardData.artist}`,
    cardData.venue && `Venue: ${cardData.venue}`,
    cardData.date && `Date: ${cardData.date}`,
    cardData.element && `Element: ${cardData.element}`,
    cardData.rarity && `Rarity: ${cardData.rarity}`,
  ].filter(Boolean);

  const prompt = promptParts.join(' | ');

  const response = await fetch(import.meta.env.VITE_CARD_GENERATION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image,                // base64 image data
      cardName: cardData.name,
      artist: cardData.artist,
      venue: cardData.venue,
      date: cardData.date,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new ApiError(`Card generation failed: ${err}`, response.status);
  }

  return (await response.json()) as GenerateCardResponse;
}

export async function swapOwnership(
  userID1: string,
  userID2: string,
  imageID1: string,
  imageID2: string
) {
  console.log(JSON.stringify({
      UserID1: userID1,
      UserID2: userID2,
      ImageID1: imageID1,
      ImageID2: imageID2,
    }),);
  const response = await fetch(import.meta.env.VITE_SWAP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      UserID1: userID1,
      UserID2: userID2,
      ImageID1: imageID1,
      ImageID2: imageID2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Swap failed: ${err}`);
  }

  return await response.json();
}

// Error handling utility
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}
