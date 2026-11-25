import type { Metadata } from 'next';
import { ARTWORKS, MIN_STEP } from '@/lib/artworks';
import { publicSummary } from '@/lib/auction';
import AuctionGallery from '@/components/AuctionGallery';

export const metadata: Metadata = {
  title: 'Art auction',
  description: 'Bid on original artworks by the PT Foundation community. Every purchase supports the artists.',
};
export const dynamic = 'force-dynamic';

export default async function Auction() {
  const initial = await publicSummary();
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Art auction · Pameran Seni Visual 2026</div>
        <h1>Take home a piece of the story</h1>
        <p className="lede">From May to October 2026, the PT Foundation community came together to make art as therapy and possibility. These are the original works still looking for a home. Every purchase goes to the artists and their community.</p>
      </div>
      <section style={{ paddingTop: 10 }}><div className="wrap">
        <div className="auc-how">
          <div><b>1</b><span>Pick an artwork and tap <i>Bid</i></span></div>
          <div><b>2</b><span>Enter your bid, name, email and WhatsApp</span></div>
          <div><b>3</b><span>We email you if you&apos;re outbid, and contact the winners when bidding closes</span></div>
        </div>
        <AuctionGallery artworks={ARTWORKS} step={MIN_STEP} initial={initial} />
        <p className="muted" style={{ fontSize: '.9rem', marginTop: 28 }}>Each new bid must be at least RM {MIN_STEP} higher than the current highest. Only the highest amount is shown here; your name and contact details stay private. Questions? WhatsApp or email the LIFE+ team.</p>
      </div></section>
    </>
  );
}
