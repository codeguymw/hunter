import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Send, Users, Smile, Image as ImageIcon, Mic, Video, Phone,
  Flame, Clock, Timer, Check, X, Eye, Megaphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCreator } from '../context/CreatorContext';
import { useLeakDeterrence } from '../utils/useLeakDeterrence';
import { CallOverlay, EmojiPicker, GifPicker, Recorder, VoiceBubble } from '../components/chat/ChatExtras';
import { CreatorBadge } from '../components/creator/CreatorBits';
import Avatar from '../components/Avatar';
import { timeAgo } from '../utils/time';
import type { RichMessage } from '../types';

const RETENTION_CHOICES = [
  { label: '1 hour', hours: 1 },
  { label: '12 hours', hours: 12 },
  { label: '48 hours', hours: 48 },
  { label: '7 days', hours: 168 },
];

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, users } = useApp();
  const {
    threads, postMessage, consumeMessage, setRetention, setBurnOnRead,
    requests, decideRequest, vault, call, startCall, endCall,
  } = useCreator();
  const isObscured = useLeakDeterrence();

  const [text, setText] = useState('');
  const [picker, setPicker] = useState<'none' | 'emoji' | 'gif'>('none');
  const [recording, setRecording] = useState<'voice' | 'videoNote' | null>(null);
  const [settings, setSettings] = useState(false);
  const [oneTime, setOneTime] = useState(false);

  const thread = threads.find((t) => t.id === id);
  if (!thread || !currentUser) return <Navigate to="/messages" replace />;

  const isAnnouncement = thread.kind === 'announcement';
  const canSend = !thread.readOnly || currentUser.isAdmin;
  const peer = thread.participantHandles.find((h) => h !== currentUser.handle) ?? thread.name;
  const peerUser = users.find((u) => u.handle === peer);

  function send(kind: RichMessage['kind'], payload: Partial<RichMessage> = {}) {
    postMessage(thread!.id, {
      kind,
      senderHandle: currentUser!.handle,
      selfDestruct: oneTime || thread!.burnOnRead,
      ...payload,
    });
    setText('');
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-void/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate('/messages')} className="text-paper"><ArrowLeft className="h-5 w-5" /></button>
        {isAnnouncement
          ? <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper"><Megaphone className="h-4 w-4 text-void" /></div>
          : <Avatar seed={peerUser?.avatarSeed ?? thread.name} size={34} />}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-paper">
            {thread.name}
            {peerUser?.creatorStatus === 'approved' && <CreatorBadge size={13} />}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-smoke">
            {isAnnouncement ? 'Official channel · read only'
              : thread.burnOnRead
                ? <><Flame className="h-3 w-3" /> burns on read</>
                : <><Clock className="h-3 w-3" /> clears after {thread.retentionHours}h</>}
          </p>
        </div>
        {!isAnnouncement && (
          <>
            <button onClick={() => startCall('voice', thread.name)} className="text-paper" aria-label="Voice call">
              <Phone className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button onClick={() => startCall('video', thread.name)} className="text-paper" aria-label="Video call">
              <Video className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button onClick={() => setSettings((v) => !v)} className="text-paper" aria-label="Thread settings">
              <Timer className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </>
        )}
      </header>

      {settings && !isAnnouncement && (
        <div className="border-b border-line bg-ink px-4 py-4">
          <p className="text-xs uppercase tracking-widest2 text-smoke">Disappearing messages</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {RETENTION_CHOICES.map((c) => (
              <button key={c.hours} onClick={() => setRetention(thread.id, c.hours)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  thread.retentionHours === c.hours ? 'border-paper bg-paper text-void' : 'border-line text-fog'}`}>
                {c.label}
              </button>
            ))}
          </div>
          <button onClick={() => setBurnOnRead(thread.id, !thread.burnOnRead)}
            className="mt-4 flex w-full items-center justify-between text-left">
            <span>
              <span className="block text-sm text-paper">Burn on read</span>
              <span className="mt-0.5 block text-xs text-smoke">Each message disappears once it's opened.</span>
            </span>
            <span className={`h-5 w-9 shrink-0 rounded-full ${thread.burnOnRead ? 'bg-paper' : 'bg-line'}`}>
              <span className={`block h-4 w-4 translate-y-0.5 rounded-full bg-void transition-transform ${thread.burnOnRead ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
          </button>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ filter: isObscured ? 'blur(16px)' : 'none' }}>
        {thread.messages.map((m) => {
          const mine = m.senderHandle === currentUser.handle;
          const req = m.accessRequestId ? requests.find((r) => r.id === m.accessRequestId) : null;

          if (m.kind === 'accessRequest' && req) {
            const item = vault.find((v) => v.id === req.vaultItemId);
            const iAmCreator = req.creatorHandle === currentUser.handle;
            return (
              <div key={m.id} className="mx-auto w-full max-w-sm rounded-2xl border border-line bg-ink p-4">
                <p className="text-xs uppercase tracking-widest2 text-smoke">Access request</p>
                <p className="mt-2 text-sm text-paper">
                  <span className="font-semibold">{req.requesterHandle}</span> asked to view "{item?.title ?? 'an item'}".
                </p>
                {m.text && <p className="mt-1 text-sm text-fog">{m.text}</p>}
                {req.status === 'requested' && iAmCreator && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => decideRequest(req.id, true)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-paper py-2.5 text-xs font-semibold text-void">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button onClick={() => decideRequest(req.id, false)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-xs font-medium text-paper">
                      <X className="h-3.5 w-3.5" /> Deny
                    </button>
                  </div>
                )}
                {req.status !== 'requested' && (
                  <p className="mt-3 text-xs text-smoke">
                    {req.status === 'approved'
                      ? `Approved · access until ${req.expiresAt ? new Date(req.expiresAt).toLocaleString() : '—'}`
                      : req.status === 'expired' ? 'Access window closed' : 'Denied'}
                  </p>
                )}
                {req.status === 'requested' && !iAmCreator && (
                  <p className="mt-3 text-xs text-smoke">Waiting on {req.creatorHandle}.</p>
                )}
              </div>
            );
          }

          if (m.kind === 'system') {
            return (
              <div key={m.id} className="mx-auto w-full max-w-md rounded-2xl border border-line px-4 py-3">
                <p className="text-sm leading-relaxed text-fog">{m.text}</p>
                <p className="mt-1.5 text-[10px] text-smoke">{timeAgo(m.createdAt)} ago</p>
              </div>
            );
          }

          const destroyed = m.selfDestruct && m.consumed;

          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[78%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                {!mine && thread.kind === 'group' && (
                  <p className="mb-1 px-1 text-xs text-smoke">{m.senderHandle}</p>
                )}

                {destroyed ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-line px-4 py-2.5">
                    <Flame className="h-3.5 w-3.5 text-smoke" />
                    <span className="text-xs italic text-smoke">Opened once. Gone.</span>
                  </div>
                ) : m.kind === 'voice' ? (
                  <VoiceBubble url={m.mediaUrl} seconds={m.durationSec} mine={mine} />
                ) : m.kind === 'videoNote' ? (
                  <video src={m.mediaUrl} controls
                    onPlay={() => m.selfDestruct && consumeMessage(thread.id, m.id)}
                    className="h-40 w-40 rounded-full object-cover" />
                ) : m.kind === 'gif' ? (
                  <div className="flex h-24 w-40 items-center justify-center rounded-2xl border border-line bg-ink text-xs text-smoke">
                    GIF · {m.text}
                  </div>
                ) : m.selfDestruct && !mine ? (
                  <button onClick={() => consumeMessage(thread.id, m.id)}
                    className="flex items-center gap-2 rounded-2xl border border-line px-4 py-2.5">
                    <Eye className="h-3.5 w-3.5 text-paper" />
                    <span className="text-xs text-paper">Tap to view once</span>
                  </button>
                ) : (
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-paper text-void' : 'border border-line text-paper'}`}>
                    {m.text}
                  </div>
                )}

                <p className="mt-1 flex items-center gap-1 px-1 text-[10px] text-smoke">
                  {timeAgo(m.createdAt)}
                  {m.selfDestruct && !destroyed && <Flame className="h-2.5 w-2.5" />}
                </p>
              </div>
            </div>
          );
        })}

        {thread.messages.length === 0 && (
          <p className="py-16 text-center text-sm text-smoke">
            {isAnnouncement ? 'No announcements yet.' : 'Say hello — this is the start of your conversation.'}
          </p>
        )}
      </div>

      {recording && (
        <div className="px-4 pb-3">
          <Recorder kind={recording}
            onCancel={() => setRecording(null)}
            onDone={(url, secs) => {
              send(recording === 'voice' ? 'voice' : 'videoNote', { mediaUrl: url, durationSec: secs });
              setRecording(null);
            }} />
        </div>
      )}

      {canSend && !recording && (
        <div className="relative border-t border-line px-4 py-3">
          {picker === 'emoji' && <EmojiPicker onPick={(e) => setText((t) => t + e)} onClose={() => setPicker('none')} />}
          {picker === 'gif' && <GifPicker onPick={(label) => send('gif', { text: label })} onClose={() => setPicker('none')} />}

          <div className="flex items-center gap-2">
            <button onClick={() => setPicker((p) => (p === 'emoji' ? 'none' : 'emoji'))} className="text-fog hover:text-paper" aria-label="Emoji">
              <Smile className="h-5 w-5" />
            </button>
            <button onClick={() => setPicker((p) => (p === 'gif' ? 'none' : 'gif'))} className="text-fog hover:text-paper" aria-label="GIF">
              <ImageIcon className="h-5 w-5" />
            </button>
            <button onClick={() => setOneTime((v) => !v)}
              className={oneTime ? 'text-paper' : 'text-fog hover:text-paper'} aria-label="Send as one-time view">
              <Flame className="h-5 w-5" />
            </button>

            <input value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) send('text', { text: text.trim() }); }}
              placeholder={oneTime ? 'One-time message' : 'Message'}
              className="min-w-0 flex-1 rounded-full border border-line bg-ink px-4 py-2.5 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none" />

            {text.trim() ? (
              <button onClick={() => send('text', { text: text.trim() })} className="text-paper" aria-label="Send">
                <Send className="h-5 w-5" />
              </button>
            ) : (
              <>
                <button onClick={() => setRecording('voice')} className="text-fog hover:text-paper" aria-label="Voice note">
                  <Mic className="h-5 w-5" />
                </button>
                <button onClick={() => setRecording('videoNote')} className="text-fog hover:text-paper" aria-label="Video note">
                  <Video className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {oneTime && <p className="mt-2 text-[11px] text-smoke">This message disappears after it's opened once.</p>}
        </div>
      )}

      {!canSend && (
        <div className="border-t border-line px-4 py-4 text-center">
          <p className="text-xs text-smoke">Only Hunter can post in this channel.</p>
        </div>
      )}

      <CallOverlay call={call} onEnd={endCall} />
    </div>
  );
}
