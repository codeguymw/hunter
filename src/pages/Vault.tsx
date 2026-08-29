import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Lock, Download, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCreator } from '../context/CreatorContext';
import { CreatorBadge, LockedPlacard, formatPrice } from '../components/creator/CreatorBits';
import ProtectedMedia from '../components/media/ProtectedMedia';
import TopBar from '../components/layout/TopBar';
import type { VaultItem } from '../types';

export default function Vault() {
  const { currentUser } = useApp();
  const { vault, requests, requestAccess, hasAccess } = useCreator();
  const navigate = useNavigate();
  const [asking, setAsking] = useState<VaultItem | null>(null);
  const [note, setNote] = useState('');

  if (!currentUser) return null;
  const isCreator = currentUser.creatorStatus === 'approved';

  const stateFor = (item: VaultItem): 'locked' | 'requested' | 'denied' => {
    const mine = requests.find((r) => r.vaultItemId === item.id && r.requesterHandle === currentUser.handle);
    if (!mine) return 'locked';
    if (mine.status === 'requested') return 'requested';
    if (mine.status === 'denied') return 'denied';
    return 'locked';
  };

  function submit() {
    if (!asking) return;
    requestAccess(asking, currentUser!.handle, note.trim());
    setAsking(null);
    setNote('');
  }

  return (
    <div>
      <TopBar title="Vault" />
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:pt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="hidden font-display text-2xl tracking-tightest text-paper md:block">Vault</h1>
            <p className="mt-1 text-sm text-smoke">
              Private work from creators. Everyone can see what exists — only approved viewers can open it.
            </p>
          </div>
          {isCreator && (
            <button onClick={() => navigate('/vault/new')}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-paper px-4 py-2.5 text-sm font-semibold text-void">
              <Plus className="h-4 w-4" /> Add
            </button>
          )}
        </div>

        {!isCreator && currentUser.creatorStatus !== 'pending' && (
          <button onClick={() => navigate('/creator/apply')}
            className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-line px-4 py-3.5 text-left">
            <Lock className="h-4 w-4 shrink-0 text-smoke" />
            <span className="flex-1 text-sm text-paper">Want to sell your own work? Apply for a creator account.</span>
          </button>
        )}
        {currentUser.creatorStatus === 'pending' && (
          <p className="mt-5 rounded-2xl border border-line px-4 py-3.5 text-sm text-smoke">
            Your creator application is with the Hunter team. You'll get a message when it's decided.
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {vault.map((item) =>
            hasAccess(item.id, currentUser.handle) || item.creatorHandle === currentUser.handle ? (
              <UnlockedCard key={item.id} item={item} />
            ) : (
              <LockedPlacard key={item.id} item={item} state={stateFor(item)} onRequest={() => setAsking(item)} />
            )
          )}
        </div>
        {vault.length === 0 && <p className="py-16 text-center text-sm text-smoke">Nothing in the vault yet.</p>}
      </div>

      {asking && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-void/80 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-sm rounded-t-3xl border border-line bg-void p-5 md:rounded-3xl">
            <h2 className="font-display text-lg tracking-tightest text-paper">Request access</h2>
            <p className="mt-1 text-sm text-smoke">
              {asking.creatorHandle} decides. If they approve, you get {asking.accessDurationHours}h with
              "{asking.title}" for {formatPrice(asking.price, asking.currency)}.
            </p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder="Say why you'd like access (optional)"
              className="mt-4 w-full resize-none rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none" />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setAsking(null)}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-paper">Cancel</button>
              <button onClick={submit}
                className="flex-1 rounded-xl bg-paper py-3 text-sm font-semibold text-void">Send request</button>
            </div>
            <p className="mt-3 text-center text-[11px] text-smoke">
              No money moves in this prototype. Payment happens after approval, before the media unlocks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function UnlockedCard({ item }: { item: VaultItem }) {
  const { currentUser } = useApp();
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink">
      {item.mediaType === 'audio' ? (
        <div className="flex aspect-[4/5] items-center justify-center bg-void">
          <audio src={item.mediaUrl} controls className="w-4/5" />
        </div>
      ) : (
        <ProtectedMedia src={item.mediaUrl} type={item.mediaType === 'video' ? 'video' : 'image'} alt={item.title} />
      )}
      <div className="px-4 py-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-paper">
          {item.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-smoke">
          by {item.creatorHandle} <CreatorBadge size={12} />
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-smoke">unlocked</span>
          {item.downloadable && (
            <a href={item.mediaUrl} download
              className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[10px] text-smoke">
              <Download className="h-3 w-3" /> download
            </a>
          )}
          {item.burnOnView && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[10px] text-smoke">
              <Flame className="h-3 w-3" /> burns on view
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
