import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/Avatar';
import { shortKeyFragment } from '../../utils/idGenerator';

export default function AdminUsers() {
  const { users, setUserStatus, currentUser } = useApp();
  const [query, setQuery] = useState('');

  const filtered = users.filter((u) => u.handle.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by handle"
        className="w-full max-w-xs rounded-xl border border-line bg-ink px-4 py-2.5 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none"
      />

      <div className="mt-4 divide-y divide-line rounded-2xl border border-line">
        {filtered.map((u) => (
          <div key={u.idKey} className="flex items-center gap-3 px-4 py-3">
            <Avatar seed={u.avatarSeed} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-paper">
                {u.handle} {u.idKey === currentUser?.idKey && <span className="text-xs text-smoke">(you)</span>}
              </p>
              <p className="font-mono text-xs text-smoke">key ending {shortKeyFragment(u.idKey)}</p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] ${
                u.status === 'suspended' ? 'border-line text-smoke' : 'border-line text-paper'
              }`}
            >
              {u.status}
            </span>
            <button
              onClick={() => setUserStatus(u.handle, u.status === 'active' ? 'suspended' : 'active')}
              disabled={u.idKey === currentUser?.idKey}
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-paper disabled:opacity-30"
            >
              {u.status === 'active' ? 'Suspend' : 'Reinstate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
