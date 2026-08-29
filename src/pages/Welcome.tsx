import { Link, Navigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';

export default function Welcome() {
  const { currentUser, isOnboarded } = useApp();

  if (currentUser && isOnboarded) return <Navigate to="/feed" replace />;
  if (currentUser && !isOnboarded) return <Navigate to="/onboarding/interests" replace />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-void px-6 py-10">
      <div />

      <div className="flex w-full max-w-sm flex-col items-center text-center animate-rise-in">
        <div className="mb-8 rounded-3xl bg-paper p-5">
          <Logo size={56} />
        </div>
        <h1 className="font-display text-4xl tracking-tightest text-paper">HUNTER</h1>
        <p className="mt-3 max-w-[280px] text-[15px] leading-relaxed text-smoke">
          A place for creators to show their work — without giving up who they are.
          No email. No phone number. No real name.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Link
          to="/create"
          className="flex w-full items-center justify-center rounded-2xl bg-paper py-4 text-[15px] font-semibold text-void transition active:scale-[0.98]"
        >
          Create anonymous account
        </Link>
        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-2xl border border-line py-4 text-[15px] font-semibold text-paper transition active:scale-[0.98]"
        >
          I already have a key
        </Link>
        <p className="pt-2 text-center text-[11px] leading-relaxed text-smoke">
          By continuing you agree not to redistribute other members' work.
          Every view is watermarked to the viewing account.
        </p>
      </div>
    </div>
  );
}
