import { cards } from './cards';

type AuctionStage = 'live' | 'scheduled' | 'ended';

export interface AuctionBid {
  id: string;
  bidder: string;
  amount: number;
  placedAt: string;
}

export interface Auction {
  id: string;
  cardId: string;
  stage: AuctionStage;
  startingBid: number;
  currentBid: number;
  instantBuy?: number;
  endsInMinutes: number;
  bids: AuctionBid[];
  watchers: number;
}

// All auctions are now managed through the API - no dummy auctions needed
export const auctions: Auction[] = [];

export const auctionCardsMap = new Map(cards.map((card) => [card.id, card]));
