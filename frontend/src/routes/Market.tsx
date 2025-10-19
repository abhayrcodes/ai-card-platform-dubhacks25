import { useNavigate } from 'react-router-dom';
import { cards } from '../data/cards';

export function MarketRoute() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 text-white">
      <header className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Marketplace</p>
        <h1 className="text-4xl font-semibold tracking-[0.04em] uppercase">Set your price. List your drop.</h1>
        <p className="max-w-2xl text-sm text-white/60">
          Creators upload generated cards, assign a price, and publish them instantly. Explore the latest listings and tap into
          the Collecify economy before the full payment rail launches.
        </p>
      </header>

      <section className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <article key={card.id} className="space-y-4 border border-white/10 bg-black/50 p-6">
            <div className="aspect-[4/5] overflow-hidden">
              <img src={card.imageUrl} alt={card.name} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.3em] text-white/40">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{card.rarity}</span>
              <span>{card.element}</span>
            </div>
            <h2 className="text-xl font-medium tracking-[0.02em]">{card.name}</h2>
            <p className="text-sm text-white/60">{card.description}</p>
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/60">
              <span>{card.priceCredits.toLocaleString()} Credits</span>
              <button
                type="button"
                className="text-white hover:opacity-70"
                onClick={() => navigate(`/card/${card.id}`)}
              >
                View Card →
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
