import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AccessRequest, CallSession, CreatorApplication, MessageKind,
  RichConversation, RichMessage, VaultItem,
} from '../types';
import { DEFAULT_RETENTION_HOURS, MAX_ACCESS_HOURS } from '../types';
import { loadState, saveState } from '../utils/storage';

const HOUR = 3600_000;
const iso = (ms: number) => new Date(ms).toISOString();
const now = () => Date.now();

/* ---------- seeds ---------- */
const SEED_VAULT: VaultItem[] = [
  {
    id: 'v1', creatorHandle: 'quiet_wren_482', title: 'Underpainting, full process reel',
    mediaUrl: 'https://picsum.photos/seed/vault-1/900/1100', mediaType: 'video',
    categoryIds: ['art', 'illustration'], price: 8500, currency: 'MWK',
    accessDurationHours: 72, downloadable: false, watermark: true, burnOnView: false,
    maxGrants: 25, createdAt: iso(now() - 3 * 24 * HOUR),
  },
  {
    id: 'v2', creatorHandle: 'ember_lynx_119', title: 'Fog series — unreleased frames',
    mediaUrl: 'https://picsum.photos/seed/vault-2/900/1100', mediaType: 'image',
    categoryIds: ['nature-photo'], price: 5, currency: 'USD',
    accessDurationHours: 24, downloadable: true, watermark: true, burnOnView: false,
    maxGrants: null, createdAt: iso(now() - 1 * 24 * HOUR),
  },
  {
    id: 'v3', creatorHandle: 'north_moss_775', title: 'Ambient loop, studio session',
    mediaUrl: '', mediaType: 'audio',
    categoryIds: ['music'], price: 3000, currency: 'MWK',
    accessDurationHours: 168, downloadable: false, watermark: false, burnOnView: true,
    maxGrants: 10, createdAt: iso(now() - 6 * HOUR),
  },
];

const ANNOUNCEMENTS: RichConversation = {
  id: 'conv_hunter', kind: 'announcement', name: 'Hunter',
  participantHandles: [], retentionHours: 0, burnOnRead: false,
  readOnly: true, pinned: true,
  messages: [
    {
      id: 'a1', senderHandle: 'Hunter', kind: 'system',
      text: 'Welcome to Hunter. Your key is the only way back into this account — keep it somewhere safe.',
      createdAt: iso(now() - 5 * 24 * HOUR), expiresAt: null,
    },
    {
      id: 'a2', senderHandle: 'Hunter', kind: 'system',
      text: 'Chats now clear themselves after 48 hours by default. You can shorten that, or switch a thread to burn on read, from the thread menu.',
      createdAt: iso(now() - 2 * 24 * HOUR), expiresAt: null,
    },
    {
      id: 'a3', senderHandle: 'Hunter', kind: 'system',
      text: 'Creator accounts are open. Apply from your profile — approval is manual and usually takes a day.',
      createdAt: iso(now() - 6 * HOUR), expiresAt: null,
    },
  ],
};

/* ---------- context ---------- */
interface CreatorContextValue {
  vault: VaultItem[];
  addVaultItem: (v: Omit<VaultItem, 'id' | 'createdAt'>) => void;
  removeVaultItem: (id: string) => void;

  applications: CreatorApplication[];
  applyForCreator: (handle: string, pitch: string) => void;
  decideApplication: (id: string, approve: boolean) => void;

  requests: AccessRequest[];
  requestAccess: (item: VaultItem, requester: string, message: string) => void;
  decideRequest: (id: string, approve: boolean) => void;
  /** Live access check — false once the grant window closes. */
  hasAccess: (itemId: string, handle: string) => boolean;
  grantCount: (itemId: string) => number;

  threads: RichConversation[];
  setThreads: React.Dispatch<React.SetStateAction<RichConversation[]>>;
  postMessage: (threadId: string, msg: Partial<RichMessage> & { kind: MessageKind; senderHandle: string }) => void;
  consumeMessage: (threadId: string, msgId: string) => void;
  setRetention: (threadId: string, hours: number) => void;
  setBurnOnRead: (threadId: string, on: boolean) => void;
  openDirect: (a: string, b: string) => string;

  call: CallSession;
  startCall: (kind: 'voice' | 'video', peerName: string) => void;
  endCall: () => void;
}

const Ctx = createContext<CreatorContextValue | null>(null);

export function CreatorProvider({ children }: { children: React.ReactNode }) {
  const [vault, setVault] = useState<VaultItem[]>(() => loadState('vault', SEED_VAULT));
  const [applications, setApplications] = useState<CreatorApplication[]>(() => loadState('applications', []));
  const [requests, setRequests] = useState<AccessRequest[]>(() => loadState('requests', []));
  const [threads, setThreads] = useState<RichConversation[]>(() => loadState('threads', [ANNOUNCEMENTS]));
  const [call, setCall] = useState<CallSession>({ kind: 'voice', state: 'idle', peerName: '', startedAt: null });
  const [, forceTick] = useState(0);

  useEffect(() => saveState('vault', vault), [vault]);
  useEffect(() => saveState('applications', applications), [applications]);
  useEffect(() => saveState('requests', requests), [requests]);
  useEffect(() => saveState('threads', threads), [threads]);

  /* Retention sweep. Expired messages are dropped from state, not hidden —
     the whole point is that they stop existing. */
  useEffect(() => {
    const sweep = setInterval(() => {
      const t = now();
      setThreads((prev) =>
        prev.map((c) => {
          const kept = c.messages.filter((m) => !m.expiresAt || new Date(m.expiresAt).getTime() > t);
          return kept.length === c.messages.length ? c : { ...c, messages: kept };
        })
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.status === 'approved' && r.expiresAt && new Date(r.expiresAt).getTime() <= t
            ? { ...r, status: 'expired' as const }
            : r
        )
      );
      forceTick((n) => n + 1);
    }, 15_000);
    return () => clearInterval(sweep);
  }, []);

  const addVaultItem: CreatorContextValue['addVaultItem'] = (v) =>
    setVault((prev) => [{
      ...v,
      accessDurationHours: Math.min(v.accessDurationHours, MAX_ACCESS_HOURS),
      id: `v_${now()}`,
      createdAt: new Date().toISOString(),
    }, ...prev]);

  const removeVaultItem = (id: string) => setVault((p) => p.filter((v) => v.id !== id));

  const applyForCreator = (handle: string, pitch: string) =>
    setApplications((p) => [
      { id: `app_${now()}`, handle, pitch, status: 'pending', createdAt: new Date().toISOString() },
      ...p.filter((a) => a.handle !== handle),
    ]);

  const decideApplication = (id: string, approve: boolean) =>
    setApplications((p) => p.map((a) => (a.id === id ? { ...a, status: approve ? 'approved' : 'rejected' } : a)));

  const openDirect = (a: string, b: string) => {
    const found = threads.find(
      (t) => t.kind === 'direct' && t.participantHandles.includes(a) && t.participantHandles.includes(b)
    );
    if (found) return found.id;
    const id = `conv_${now()}_${Math.floor(Math.random() * 999)}`;
    setThreads((prev) => [...prev, {
      id, kind: 'direct', name: b, participantHandles: [a, b], messages: [],
      retentionHours: DEFAULT_RETENTION_HOURS, burnOnRead: false,
    }]);
    return id;
  };

  const postMessage: CreatorContextValue['postMessage'] = (threadId, msg) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const expiresAt = t.retentionHours > 0 ? iso(now() + t.retentionHours * HOUR) : null;
        const full: RichMessage = {
          id: `m_${now()}_${Math.floor(Math.random() * 999)}`,
          text: '', createdAt: new Date().toISOString(), expiresAt, ...msg,
        };
        return { ...t, messages: [...t.messages, full] };
      })
    );
  };

  const consumeMessage = (threadId: string, msgId: string) =>
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== threadId ? t : { ...t, messages: t.messages.map((m) => (m.id === msgId ? { ...m, consumed: true } : m)) }
      )
    );

  const setRetention = (threadId: string, hours: number) =>
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, retentionHours: hours } : t)));

  const setBurnOnRead = (threadId: string, on: boolean) =>
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, burnOnRead: on } : t)));

  /** Filing a request also drops a card into the creator's DM thread. */
  const requestAccess: CreatorContextValue['requestAccess'] = (item, requester, message) => {
    const id = `req_${now()}`;
    setRequests((p) => [{
      id, vaultItemId: item.id, requesterHandle: requester, creatorHandle: item.creatorHandle,
      message, status: 'requested', createdAt: new Date().toISOString(), expiresAt: null,
    }, ...p]);
    const threadId = openDirect(item.creatorHandle, requester);
    setTimeout(() => {
      postMessage(threadId, {
        kind: 'accessRequest', senderHandle: requester, accessRequestId: id,
        text: message || `Requested access to "${item.title}"`,
      });
    }, 0);
  };

  const decideRequest = (id: string, approve: boolean) =>
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const item = vault.find((v) => v.id === r.vaultItemId);
        const hours = item?.accessDurationHours ?? 24;
        return approve
          ? { ...r, status: 'approved' as const, expiresAt: iso(now() + hours * HOUR) }
          : { ...r, status: 'denied' as const };
      })
    );

  const hasAccess = (itemId: string, handle: string) =>
    requests.some(
      (r) =>
        r.vaultItemId === itemId &&
        r.requesterHandle === handle &&
        r.status === 'approved' &&
        (!r.expiresAt || new Date(r.expiresAt).getTime() > now())
    );

  const grantCount = (itemId: string) =>
    requests.filter((r) => r.vaultItemId === itemId && r.status === 'approved').length;

  const startCall = (kind: 'voice' | 'video', peerName: string) => {
    setCall({ kind, state: 'connecting', peerName, startedAt: null });
    setTimeout(() => setCall((c) => (c.state === 'connecting' ? { ...c, state: 'active', startedAt: now() } : c)), 1200);
  };
  const endCall = () => setCall((c) => ({ ...c, state: 'idle', startedAt: null }));

  const value = useMemo(
    () => ({
      vault, addVaultItem, removeVaultItem,
      applications, applyForCreator, decideApplication,
      requests, requestAccess, decideRequest, hasAccess, grantCount,
      threads, setThreads, postMessage, consumeMessage, setRetention, setBurnOnRead, openDirect,
      call, startCall, endCall,
    }),
    [vault, applications, requests, threads, call]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCreator() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCreator must be used within CreatorProvider');
  return c;
}
