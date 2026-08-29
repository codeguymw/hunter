import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { UploadCloud, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCreator } from '../context/CreatorContext';
import { HOUR_OPTIONS } from '../types';
import type { Currency } from '../types';
import InterestChip from '../components/InterestChip';
import TopBar from '../components/layout/TopBar';

export default function VaultUpload() {
  const { currentUser, categories } = useApp();
  const { addVaultItem } = useCreator();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<'image' | 'video' | 'audio'>('image');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('MWK');
  const [hours, setHours] = useState(24);
  const [cats, setCats] = useState<string[]>([]);
  const [downloadable, setDownloadable] = useState(false);
  const [watermark, setWatermark] = useState(true);
  const [burnOnView, setBurnOnView] = useState(false);
  const [limited, setLimited] = useState(false);
  const [maxGrants, setMaxGrants] = useState('25');

  if (!currentUser) return null;
  if (currentUser.creatorStatus !== 'approved') return <Navigate to="/vault" replace />;

  const ready = !!url && !!title.trim() && !!price && cats.length > 0;

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setKind(f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : 'image');
    setUrl(URL.createObjectURL(f));
  }

  function publish() {
    if (!ready) return;
    addVaultItem({
      creatorHandle: currentUser!.handle,
      title: title.trim(),
      mediaUrl: url!,
      mediaType: kind,
      categoryIds: cats,
      price: Number(price),
      currency,
      accessDurationHours: hours,
      downloadable,
      watermark,
      burnOnView,
      maxGrants: limited ? Number(maxGrants) || 1 : null,
    });
    navigate('/vault');
  }

  return (
    <div>
      <TopBar title="New vault item" />
      <div className="mx-auto w-full max-w-lg px-4 py-6 md:pt-10">
        <h1 className="hidden font-display text-2xl tracking-tightest text-paper md:block">New vault item</h1>

        {!url ? (
          <button onClick={() => fileRef.current?.click()}
            className="mt-6 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line text-smoke hover:border-fog hover:text-paper">
            <UploadCloud className="h-8 w-8" strokeWidth={1.25} />
            <span className="text-sm">Upload image, video, or audio</span>
          </button>
        ) : (
          <div className="relative mt-6 overflow-hidden rounded-2xl bg-ink">
            {kind === 'image' && <img src={url} alt="" className="aspect-video w-full object-cover" />}
            {kind === 'video' && <video src={url} controls className="aspect-video w-full object-cover" />}
            {kind === 'audio' && <div className="flex aspect-video items-center justify-center"><audio src={url} controls /></div>}
            <button onClick={() => setUrl(null)} className="absolute right-3 top-3 rounded-full bg-void/80 p-1.5 text-paper">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={pick} />

        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is this piece?"
            className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none" />
        </Field>

        <Field label="Price" hint="Buyers stay anonymous. Payouts need your identity verified with Hunter privately.">
          <div className="flex gap-2">
            <div className="flex overflow-hidden rounded-xl border border-line">
              {(['MWK', 'USD'] as Currency[]).map((c) => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={`px-4 py-3 text-sm font-medium ${currency === c ? 'bg-paper text-void' : 'text-fog'}`}>
                  {c}
                </button>
              ))}
            </div>
            <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal" placeholder={currency === 'MWK' ? '8500' : '5.00'}
              className="flex-1 rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none" />
          </div>
        </Field>

        <Field label="Access window" hint="How long a viewer keeps access once you approve them. Seven days is the ceiling.">
          <div className="flex flex-wrap gap-2">
            {HOUR_OPTIONS.map((o) => (
              <button key={o.hours} onClick={() => setHours(o.hours)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  hours === o.hours ? 'border-paper bg-paper text-void' : 'border-line text-fog'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Categories">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <InterestChip key={c.id} label={c.label} emoji={c.emoji} selected={cats.includes(c.id)}
                onClick={() => setCats((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))} />
            ))}
          </div>
        </Field>

        <div className="mt-6 divide-y divide-line rounded-2xl border border-line">
          <Toggle label="Allow downloads" hint="Once downloaded, you cannot pull it back." on={downloadable} set={setDownloadable} />
          <Toggle label="Watermark viewers" hint="Burns the viewer's handle into the media." on={watermark} set={setWatermark} />
          <Toggle label="Burn after viewing" hint="Access ends the moment they close it." on={burnOnView} set={setBurnOnView} />
          <Toggle label="Limit total viewers" on={limited} set={setLimited} />
          {limited && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-paper">Maximum viewers</span>
              <input value={maxGrants} onChange={(e) => setMaxGrants(e.target.value.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
                className="w-20 rounded-lg border border-line bg-ink px-3 py-1.5 text-right text-sm text-paper focus:border-paper focus:outline-none" />
            </div>
          )}
        </div>

        <button onClick={publish} disabled={!ready}
          className="mt-8 w-full rounded-2xl bg-paper py-4 text-[15px] font-semibold text-void disabled:opacity-30">
          Publish to vault
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-paper">{label}</p>
      {hint && <p className="mb-2 mt-0.5 text-xs text-smoke">{hint}</p>}
      <div className={hint ? '' : 'mt-2'}>{children}</div>
    </div>
  );
}

function Toggle({ label, hint, on, set }: { label: string; hint?: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
      <span className="min-w-0">
        <span className="block text-sm text-paper">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-smoke">{hint}</span>}
      </span>
      <span className={`h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-paper' : 'bg-line'}`}>
        <span className={`block h-4 w-4 translate-y-0.5 rounded-full bg-void transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}
