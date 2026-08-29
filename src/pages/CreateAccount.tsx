import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CreateAccount() {
  const { createAccount, currentUser } = useApp();
  const navigate = useNavigate();
  const [idKey, setIdKey] = useState<string | null>(currentUser?.idKey ?? null);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!idKey) {
      const { idKey: newKey } = createAccount();
      setIdKey(newKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copyKey() {
    if (!idKey) return;
    navigator.clipboard?.writeText(idKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-void px-6 py-10">
      <div className="mx-auto w-full max-w-sm animate-rise-in">
        <p className="text-center font-mono text-xs uppercase tracking-widest2 text-smoke">Step 1 of 2</p>
        <h1 className="mt-3 text-center font-display text-2xl tracking-tightest text-paper">Your key</h1>
        <p className="mx-auto mt-2 max-w-[300px] text-center text-sm leading-relaxed text-smoke">
          This code is your account. There's no email or password to fall back on —
          save it somewhere safe. It's the only way to log in on another device or
          recover this account.
        </p>

        <div className="relative mt-8 overflow-hidden rounded-2xl border border-line bg-ink p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-paper/5 to-transparent animate-scan-line" />
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-smoke">Recovery / login key</p>
          <p className="mt-3 select-all break-all font-mono text-[28px] font-medium leading-tight text-paper sm:text-3xl">
            {idKey ?? '\u2014'}
          </p>
          <button
            onClick={copyKey}
            className="mt-5 flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-paper transition hover:border-fog"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy key'}
          </button>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-line px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-smoke" />
          <p className="text-xs leading-relaxed text-smoke">
            Anyone with this key can access this account. Hunter cannot recover it for
            you if it's lost — there's no personal info tied to this account to verify
            ownership with.
          </p>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 px-1">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="h-5 w-5 shrink-0 rounded border-line accent-paper"
          />
          <span className="text-sm text-paper">I've saved my key somewhere safe</span>
        </label>
      </div>

      <button
        disabled={!confirmed}
        onClick={() => navigate('/onboarding/interests')}
        className="mx-auto w-full max-w-sm rounded-2xl bg-paper py-4 text-[15px] font-semibold text-void transition disabled:opacity-30"
      >
        Continue
      </button>
    </div>
  );
}
