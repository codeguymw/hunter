import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Video, Phone, PhoneOff, X, Play } from 'lucide-react';
import { EMOJI_SET, GIF_STUBS } from '../../types';
import type { CallSession } from '../../types';

export function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-14 left-0 z-20 w-64 rounded-2xl border border-line bg-ink p-3 shadow-xl">
      <div className="grid grid-cols-8 gap-1">
        {EMOJI_SET.map((e) => (
          <button key={e} onClick={() => { onPick(e); onClose(); }}
            className="rounded-lg p-1 text-lg leading-none hover:bg-void">{e}</button>
        ))}
      </div>
    </div>
  );
}

/**
 * Placeholder GIF grid. Wire to Tenor or Giphy: both need an API key and a
 * server-side proxy so the key never ships to the client, plus their content
 * rating parameter set to a safe tier.
 */
export function GifPicker({ onPick, onClose }: { onPick: (label: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const list = GIF_STUBS.filter((g) => g.label.includes(q.toLowerCase()));
  return (
    <div className="absolute bottom-14 left-0 z-20 w-72 rounded-2xl border border-line bg-ink p-3 shadow-xl">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search GIFs"
        className="mb-2 w-full rounded-lg border border-line bg-void px-3 py-2 text-xs text-paper placeholder:text-smoke focus:border-paper focus:outline-none" />
      <div className="grid grid-cols-2 gap-2">
        {list.map((g) => (
          <button key={g.id} onClick={() => { onPick(g.label); onClose(); }}
            className="flex aspect-video items-center justify-center rounded-lg border border-line bg-void text-[11px] text-smoke hover:border-fog">
            {g.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-smoke">Connect Tenor or Giphy to load real results.</p>
    </div>
  );
}

/** Records real audio or video via MediaRecorder and hands back a blob URL. */
export function Recorder({ kind, onDone, onCancel }: {
  kind: 'voice' | 'videoNote';
  onDone: (url: string, seconds: number) => void;
  onCancel: () => void;
}) {
  const [secs, setSecs] = useState(0);
  const [err, setErr] = useState('');
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let timer: number;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          kind === 'voice' ? { audio: true } : { audio: true, video: { facingMode: 'user' } }
        );
        streamRef.current = stream;
        if (kind === 'videoNote' && videoRef.current) videoRef.current.srcObject = stream;
        const rec = new MediaRecorder(stream);
        recRef.current = rec;
        rec.ondataavailable = (e) => chunks.current.push(e.data);
        rec.start();
        timer = window.setInterval(() => setSecs((s) => s + 1), 1000);
      } catch {
        setErr(kind === 'voice' ? 'Microphone access was blocked.' : 'Camera access was blocked.');
      }
    })();
    return () => {
      clearInterval(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [kind]);

  function stop() {
    const rec = recRef.current;
    if (!rec) return onCancel();
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: kind === 'voice' ? 'audio/webm' : 'video/webm' });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onDone(URL.createObjectURL(blob), secs);
    };
    rec.stop();
  }

  if (err) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-ink px-4 py-3">
        <p className="flex-1 text-xs text-fog">{err}</p>
        <button onClick={onCancel} className="text-paper"><X className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-ink px-4 py-3">
      {kind === 'videoNote' && (
        <video ref={videoRef} autoPlay muted playsInline className="h-12 w-12 rounded-full object-cover" />
      )}
      <span className="h-2 w-2 animate-pulse-ring rounded-full bg-paper" />
      <span className="font-mono text-sm text-paper">
        {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
      </span>
      <span className="flex-1 text-xs text-smoke">{kind === 'voice' ? 'Recording voice note' : 'Recording video note'}</span>
      <button onClick={onCancel} className="rounded-lg p-1.5 text-smoke hover:text-paper"><X className="h-4 w-4" /></button>
      <button onClick={stop} className="rounded-full bg-paper p-2 text-void"><Square className="h-3.5 w-3.5 fill-void" /></button>
    </div>
  );
}

export function VoiceBubble({ url, seconds, mine }: { url?: string; seconds?: number; mine: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${mine ? 'bg-paper text-void' : 'border border-line text-paper'}`}>
      <button onClick={() => audio.current?.play()} className={`rounded-full p-1.5 ${mine ? 'bg-void text-paper' : 'bg-paper text-void'}`}>
        <Play className="h-3 w-3" />
      </button>
      <div className="flex h-5 items-center gap-0.5">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className={`w-0.5 rounded-full ${mine ? 'bg-void/50' : 'bg-fog'}`}
            style={{ height: `${5 + ((i * 7) % 14)}px` }} />
        ))}
      </div>
      <span className="font-mono text-[11px] tabular-nums">{seconds ?? 0}s</span>
      {url && <audio ref={audio} src={url} />}
    </div>
  );
}

/**
 * Call UI only. Real calls need WebRTC plus a signalling server and TURN relays
 * (peer-to-peer fails behind most mobile carrier NAT). Look at LiveKit or Daily
 * rather than building signalling from scratch.
 */
export function CallOverlay({ call, onEnd }: { call: CallSession; onEnd: () => void }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (call.state !== 'active') return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [call.state]);

  if (call.state === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-void px-6 py-16">
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-widest2 text-smoke">
          {call.state === 'connecting' ? 'Connecting' : call.kind === 'video' ? 'Video call' : 'Voice call'}
        </p>
        <p className="font-display text-2xl tracking-tightest text-paper">{call.peerName}</p>
        {call.state === 'active' && (
          <p className="font-mono text-sm text-fog">
            {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
          </p>
        )}
      </div>

      <div className="flex h-40 w-40 items-center justify-center rounded-full border border-line">
        {call.kind === 'video'
          ? <Video className="h-10 w-10 text-fog" strokeWidth={1.25} />
          : <Phone className="h-10 w-10 text-fog" strokeWidth={1.25} />}
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="max-w-[260px] text-center text-[11px] leading-relaxed text-smoke">
          Interface only. Connect a WebRTC provider to carry real audio and video.
        </p>
        <button onClick={onEnd} className="flex h-14 w-14 items-center justify-center rounded-full bg-paper text-void">
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export { Mic, Video };
