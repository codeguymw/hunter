import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import InterestChip from '../components/InterestChip';

const MIN_INTERESTS = 3;

export default function InterestSelection() {
  const { categories, currentUser, isOnboarded, completeOnboarding } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  if (!currentUser) return <Navigate to="/" replace />;
  if (isOnboarded) return <Navigate to="/feed" replace />;

  const filtered = categories.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function finish() {
    completeOnboarding(selected);
    navigate('/feed');
  }

  return (
    <div className="flex min-h-screen flex-col bg-void px-6 py-10">
      <div className="mx-auto w-full max-w-lg animate-rise-in">
        <p className="text-center font-mono text-xs uppercase tracking-widest2 text-smoke">Step 2 of 2</p>
        <h1 className="mt-3 text-center font-display text-2xl tracking-tightest text-paper">What do you make, or love to see?</h1>
        <p className="mx-auto mt-2 max-w-[340px] text-center text-sm leading-relaxed text-smoke">
          Pick at least {MIN_INTERESTS}. This shapes your feed — Hunter only shows you
          work tagged to what you chose here.
        </p>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories"
            className="w-full rounded-xl border border-line bg-ink py-3 pl-10 pr-4 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none"
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          {filtered.map((c) => (
            <InterestChip
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              selected={selected.includes(c.id)}
              onClick={() => toggle(c.id)}
            />
          ))}
          {filtered.length === 0 && <p className="py-6 text-sm text-smoke">No categories match "{query}"</p>}
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-lg">
        <button
          disabled={selected.length < MIN_INTERESTS}
          onClick={finish}
          className="w-full rounded-2xl bg-paper py-4 text-[15px] font-semibold text-void transition disabled:opacity-30"
        >
          {selected.length < MIN_INTERESTS
            ? `Select ${MIN_INTERESTS - selected.length} more`
            : `Continue with ${selected.length} selected`}
        </button>
      </div>
    </div>
  );
}
