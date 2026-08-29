export type MessageKind =
  | 'text'
  | 'gif'
  | 'voice'
  | 'videoNote'
  | 'photo'
  | 'video'
  | 'accessRequest'
  | 'system';

export interface RichMessage {
  id: string;
  senderHandle: string;
  kind: MessageKind;
  /** Text body, or caption for media kinds. */
  text: string;
  /** Object URL / remote URL for media kinds. */
  mediaUrl?: string;
  /** Seconds, for voice and video notes. */
  durationSec?: number;
  /** Self-destructing media: gone once viewed. */
  selfDestruct?: boolean;
  /** Set once the recipient has opened a self-destructing item. */
  consumed?: boolean;
  /** Links an accessRequest message back to the request record. */
  accessRequestId?: string;
  createdAt: string;
  /** Absolute instant this message disappears. Driven by the thread's retention setting. */
  expiresAt: string | null;
}

export type ConversationKind = 'direct' | 'group' | 'announcement';

export interface RichConversation {
  id: string;
  kind: ConversationKind;
  name: string;
  participantHandles: string[];
  messages: RichMessage[];
  /** Thread retention in hours. Default 48. */
  retentionHours: number;
  /** Messages die as soon as the other party reads them. */
  burnOnRead: boolean;
  /** Announcement channels are read-only for everyone but admins. */
  readOnly?: boolean;
  /** Cannot be left or deleted by the user. */
  pinned?: boolean;
}

export type CallKind = 'voice' | 'video';
export type CallState = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';

export interface CallSession {
  kind: CallKind;
  state: CallState;
  peerName: string;
  startedAt: number | null;
}

export const DEFAULT_RETENTION_HOURS = 48;

export const EMOJI_SET = [
  '😀','😂','🥲','😍','🤩','😎','🤔','🙃','😴','🫠',
  '👍','👎','👏','🙌','🤝','💪','🫶','✌️','🤌','🖤',
  '🔥','✨','⭐','💯','🎉','🎨','📷','🎬','🎵','✏️',
  '❤️','🧡','💛','💚','💙','💜','🤍','🤎','💔','❣️',
];

/** Stand-in GIF set. Swap for a Tenor or Giphy search integration. */
export const GIF_STUBS = [
  { id: 'g1', label: 'applause' },
  { id: 'g2', label: 'mind blown' },
  { id: 'g3', label: 'thumbs up' },
  { id: 'g4', label: 'crying' },
  { id: 'g5', label: 'dancing' },
  { id: 'g6', label: 'thinking' },
  { id: 'g7', label: 'fire' },
  { id: 'g8', label: 'shrug' },
];
