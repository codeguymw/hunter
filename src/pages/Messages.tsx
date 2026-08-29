import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Megaphone, Flame, Clock, Pin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCreator } from '../context/CreatorContext';
import { CreatorBadge } from '../components/creator/CreatorBits';
import Avatar from '../components/Avatar';
import TopBar from '../components/layout/TopBar';
import { timeAgo } from '../utils/time';
import type { RichConversation } from '../types';

export default function Messages() {
  const { currentUser, users } = useApp();
  const { threads, setThreads } = useCreator();
  const navigate = useNavigate();
  const [groupOpen, setGroupOpen] = useState(false);

  if (!currentUser) return null;

  const mine = threads.filter(
    (t) => t.kind === 'announcement' || t.participantHandles.includes(currentUser.handle)
  );
  const ordered = [...mine].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  function preview(t: RichConversation) {
    const last = t.messages[t.messages.length - 1];
    if (!last) return 'No messages yet';
    if (last.kind === 'voice') return 'Voice note';
    if (last.kind === 'videoNote') return 'Video note';
    if (last.kind === 'gif') return 'GIF';
    if (last.kind === 'accessRequest') return 'Access request';
    if (last.selfDestruct && last.consumed) return 'Message removed';
    return last.text;
  }

  return (
    <div>
      <TopBar title="Messages" right={
        <button onClick={() => setGroupOpen(true)} className="text-paper" aria-label="New group"><Users className="h-5 w-5" /></button>
      } />

      <div className="mx-auto w-full max-w-xl md:pt-8">
        <div className="hidden items-center justify-between px-4 py-4 md:flex">
          <h1 className="font-display text-2xl tracking-tightest text-paper">Messages</h1>
          <button onClick={() => setGroupOpen(true)}
            className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-paper">New group</button>
        </div>

        {ordered.map((t) => {
          const peer = t.participantHandles.find((h) => h !== currentUser.handle) ?? t.name;
          const peerUser = users.find((u) => u.handle === peer);
          const last = t.messages[t.messages.length - 1];
          return (
            <button key={t.id} onClick={() => navigate(`/messages/${t.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ink">
              {t.kind === 'announcement'
                ? <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper"><Megaphone className="h-5 w-5 text-void" /></div>
                : <Avatar seed={peerUser?.avatarSeed ?? t.name} size={48} />}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-paper">
                  {t.name}
                  {peerUser?.creatorStatus === 'approved' && <CreatorBadge size={13} />}
                  {t.pinned && <Pin className="h-3 w-3 shrink-0 text-smoke" />}
                  {t.kind === 'group' && <span className="text-xs font-normal text-smoke">group</span>}
                </p>
                <p className="truncate text-sm text-smoke">{preview(t)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {last && <span className="text-xs text-smoke">{timeAgo(last.createdAt)}</span>}
                {t.kind !== 'announcement' && (
                  <span className="flex items-center gap-1 text-[10px] text-smoke">
                    {t.burnOnRead ? <><Flame className="h-2.5 w-2.5" />burn</> : <><Clock className="h-2.5 w-2.5" />{t.retentionHours}h</>}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {groupOpen && (
        <NewGroup onClose={() => setGroupOpen(false)}
          onCreate={(name, members) => {
            const id = `conv_${Date.now()}`;
            setThreads((p) => [...p, {
              id, kind: 'group', name, participantHandles: [currentUser.handle, ...members],
              messages: [], retentionHours: 48, burnOnRead: false,
            }]);
            setGroupOpen(false);
            navigate(`/messages/${id}`);
          }} />
      )}
    </div>
  );
}

function NewGroup({ onClose, onCreate }: { onClose: () => void; onCreate: (n: string, m: string[]) => void }) {
  const { users, currentUser } = useApp();
  const [name, setName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const others = users.filter((u) => u.handle !== currentUser?.handle);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-void/80 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-sm rounded-t-3xl border border-line bg-void p-5 md:rounded-3xl">
        <h2 className="font-display text-lg tracking-tightest text-paper">New group</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name"
          className="mt-4 w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none" />
        <p className="mt-4 text-xs text-smoke">Add members</p>
        <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
          {others.map((u) => (
            <button key={u.handle}
              onClick={() => setMembers((p) => (p.includes(u.handle) ? p.filter((h) => h !== u.handle) : [...p, u.handle]))}
              className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${members.includes(u.handle) ? 'bg-ink' : ''}`}>
              <Avatar seed={u.avatarSeed} size={32} />
              <span className="flex items-center gap-1.5 text-sm text-paper">
                {u.handle}{u.creatorStatus === 'approved' && <CreatorBadge size={12} />}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-line py-3 text-sm font-medium text-paper">Cancel</button>
          <button onClick={() => name.trim() && members.length && onCreate(name.trim(), members)}
            className="flex-1 rounded-2xl bg-paper py-3 text-sm font-semibold text-void disabled:opacity-30"
            disabled={!name.trim() || !members.length}>Create</button>
        </div>
      </div>
    </div>
  );
}
