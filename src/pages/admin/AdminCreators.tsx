import { Check, X, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCreator } from '../../context/CreatorContext';
import { CreatorBadge } from '../../components/creator/CreatorBits';
import Avatar from '../../components/Avatar';
import { timeAgo } from '../../utils/time';

export default function AdminCreators() {
  const { users, setUsers } = useApp();
  const { applications, decideApplication, vault } = useCreator();

  function decide(id: string, handle: string, approve: boolean) {
    decideApplication(id, approve);
    setUsers((prev) =>
      prev.map((u) => (u.handle === handle ? { ...u, creatorStatus: approve ? 'approved' : 'rejected' } : u))
    );
  }

  const pending = applications.filter((a) => a.status === 'pending');
  const creators = users.filter((u) => u.creatorStatus === 'approved');

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-widest2 text-smoke">
          {pending.length} application{pending.length === 1 ? '' : 's'} waiting
        </p>
        <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
          {pending.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-smoke">
              Nothing to review. Applications land here when a member applies from their profile.
            </p>
          )}
          {pending.map((a) => (
            <div key={a.id} className="px-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar seed={a.handle} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-paper">{a.handle}</p>
                  <p className="text-xs text-smoke">applied {timeAgo(a.createdAt)} ago</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fog">{a.pitch}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => decide(a.id, a.handle, true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-paper py-2.5 text-xs font-semibold text-void">
                  <Check className="h-3.5 w-3.5" /> Approve as creator
                </button>
                <button onClick={() => decide(a.id, a.handle, false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-xs font-medium text-paper">
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs uppercase tracking-widest2 text-smoke">{creators.length} approved creators</p>
        <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
          {creators.map((u) => (
            <div key={u.idKey} className="flex items-center gap-3 px-4 py-3">
              <Avatar seed={u.avatarSeed} size={34} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-paper">
                  {u.handle} <CreatorBadge size={13} />
                </p>
                <p className="text-xs text-smoke">
                  {vault.filter((v) => v.creatorHandle === u.handle).length} vault items
                </p>
              </div>
              <button onClick={() => setUsers((p) => p.map((x) => (x.handle === u.handle ? { ...x, creatorStatus: 'none' } : x)))}
                className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-paper">
                Revoke
              </button>
            </div>
          ))}
          {creators.length === 0 && (
            <p className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-smoke">
              <ShieldCheck className="h-4 w-4" /> No creators yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
