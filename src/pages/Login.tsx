import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { loginWithKey, currentUser } = useApp();
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  if (currentUser) return <Navigate to="/feed" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loginWithKey(key)) {
      navigate('/feed');
    } else {
      setError('That key doesn\u2019t match an account, or it has been suspended.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-void px-6 py-10">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm animate-rise-in">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-line">
          <KeyRound className="h-6 w-6 text-paper" strokeWidth={1.5} />
        </div>
        <h1 className="text-center font-display text-2xl tracking-tightest text-paper">Enter your key</h1>
        <p className="mx-auto mt-2 max-w-[280px] text-center text-sm text-smoke">
          The code you saved when you created your account.
        </p>

        <input
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError('');
          }}
          placeholder="HNT-XXXX-XXXX-XXXX"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="mt-8 w-full rounded-2xl border border-line bg-ink px-5 py-4 text-center font-mono text-lg tracking-wider text-paper placeholder:text-line focus:border-paper focus:outline-none"
        />
        {error && <p className="mt-3 text-center text-sm text-paper/80">{error}</p>}

        <button
          type="submit"
          disabled={!key.trim()}
          className="mt-5 w-full rounded-2xl bg-paper py-4 text-[15px] font-semibold text-void transition disabled:opacity-30"
        >
          Continue
        </button>

        <p className="mt-6 text-center text-sm text-smoke">
          Don't have a key?{' '}
          <Link to="/create" className="text-paper underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
