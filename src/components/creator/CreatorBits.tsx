import { Lock, Download, Flame, Clock, Music, Video, ImageIcon } from 'lucide-react';
import type { Currency, VaultItem } from '../../types';
import logo from '../../assets/hunter-logo.jpg';

/** The Hunter mark, shown inline after an approved creator's handle. */
export function CreatorBadge({ size = 14 }: { size?: number }) {
  return (
    <span
      title="Verified Hunter creator"
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-paper align-middle"
      style={{ width: size, height: size, padding: size * 0.14 }}
    >
      <img src={logo} alt="Hunter creator" className="h-full w-full object-contain" draggable={false} />
    </span>
  );
}

export function formatPrice(amount: number, currency: Currency) {
  return currency === 'MWK'
    ? `MK ${amount.toLocaleString()}`
    : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export function durationLabel(hours: number) {
  if (hours < 24) return `${hours}h access`;
  const d = Math.round(hours / 24);
  return `${d} day${d > 1 ? '' : ''} access`;
}

const KIND_ICON = { image: ImageIcon, video: Video, audio: Music };

/**
 * The public face of a gated item: everyone sees it exists, nobody sees what it is.
 * The blur is cosmetic here because the real media is still client-side in this
 * prototype. In production the locked state must never receive the file at all —
 * the server withholds it until a grant exists, and blur is only the visual cue.
 */
export function LockedPlacard({ item, onRequest, state }: {
  item: VaultItem;
  onRequest: () => void;
  state: 'locked' | 'requested' | 'denied';
}) {
  const Icon = KIND_ICON[item.mediaType];
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-line">
        {item.mediaUrl ? (
          <img src={item.mediaUrl} alt="" draggable={false}
            className="h-full w-full object-cover" style={{ filter: 'blur(34px)', transform: 'scale(1.15)' }} />
        ) : (
          <div className="h-full w-full bg-ink" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-void/50 px-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-fog/40">
            <Lock className="h-5 w-5 text-paper" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-paper">{item.title}</p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Tag><Icon className="h-3 w-3" /> {item.mediaType}</Tag>
            <Tag><Clock className="h-3 w-3" /> {durationLabel(item.accessDurationHours)}</Tag>
            {item.downloadable && <Tag><Download className="h-3 w-3" /> downloadable</Tag>}
            {item.burnOnView && <Tag><Flame className="h-3 w-3" /> burns on view</Tag>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-paper">{formatPrice(item.price, item.currency)}</p>
          <p className="truncate text-xs text-smoke">by {item.creatorHandle}</p>
        </div>
        <button
          onClick={onRequest}
          disabled={state !== 'locked'}
          className="shrink-0 rounded-xl bg-paper px-4 py-2 text-xs font-semibold text-void disabled:bg-transparent disabled:text-smoke disabled:ring-1 disabled:ring-line"
        >
          {state === 'requested' ? 'Awaiting approval' : state === 'denied' ? 'Declined' : 'Request access'}
        </button>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-fog/30 px-2 py-0.5 text-[10px] text-fog">
      {children}
    </span>
  );
}
