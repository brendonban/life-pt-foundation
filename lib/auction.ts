import { ARTWORKS } from './artworks';
import { store } from './store';
import type { AuctionSettings, Bid } from './types';

export interface LotStatus { id: string; highest: number; count: number; sold: boolean }
export interface AuctionSummary { open: boolean; endsAt: string; lots: LotStatus[] }

export const isClosed = (a: AuctionSettings) => !a.open || (!!a.endsAt && Date.now() > Date.parse(a.endsAt));

export function summarise(a: AuctionSettings, bids: Bid[]): AuctionSummary {
  const lots = ARTWORKS.filter((w) => !a.sold.includes(w.id)).map((w) => {
    const mine = bids.filter((b) => b.artworkId === w.id);
    return { id: w.id, highest: mine.reduce((m, b) => Math.max(m, b.amount), 0), count: mine.length, sold: false };
  });
  return { open: !isClosed(a), endsAt: a.endsAt || '', lots };
}

export async function publicSummary(): Promise<AuctionSummary> {
  const [a, bids] = await Promise.all([store.getAuction(), store.listBids()]);
  return summarise(a, bids);
}
