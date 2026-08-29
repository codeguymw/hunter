import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCreator } from '../context/CreatorContext';
import { CreatorBadge } from '../components/creator/CreatorBits';
import TopBar from '../components/layout/TopBar';

export default function CreatorApply() {
  const { currentUser, updateProfile } = useApp();
  const { applyForCreator } = useCreator();
  const navigate = useNavigate();
  const [pitch, setPitch] = useState('');

  if (!currentUser) return null;

  function submit() {
    applyForCreator(currentUser!.handle, pitch.trim());
    updateProfile({ creatorStatus: 'pending' } as never);
    navigate('/vault');
  }

  return (
    <div>
      <TopBar title="Become a creator" />
      <div className="mx-auto w-full max-w-lg px-4 py-6 md:pt-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line">
          <ShieldCheck className="h-5 w-5 text-paper" strokeWidth={1.5} />
        </div>
        <h1 className="mt-4 font-display text-2xl tracking-tightest text-paper">Become a creator</h1>
        <p className="mt-2 text-sm leading-relaxed text-smoke">
          Creator accounts can publish gated work to the vault, set their own price and access window,
          and approve who gets to see it. Every creator carries the Hunter mark <CreatorBadge size={13} /> next
          to their handle.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-line p-4">
          <Row n="1" text="A human on the Hunter team reviews your application." />
          <Row n="2" text="If approved, creator tools unlock and your handle gets the mark." />
          <Row n="3" text="Before your first payout you verify your identity with Hunter privately. Other members never see it." />
        </div>

        <p className="mt-6 text-sm font-medium text-paper">Tell us what you make</p>
        <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} rows={4}
          placeholder="A few lines about your work and what you'd put behind the paywall."
          className="mt-2 w-full resize-none rounded-2xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none" />

        <button onClick={submit} disabled={pitch.trim().length < 20}
          className="mt-6 w-full rounded-2xl bg-paper py-4 text-[15px] font-semibold text-void disabled:opacity-30">
          {pitch.trim().length < 20 ? 'Write a little more' : 'Submit application'}
        </button>
      </div>
    </div>
  );
}

function Row({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-xs text-smoke">{n}</span>
      <span className="text-sm text-fog">{text}</span>
    </div>
  );
}
