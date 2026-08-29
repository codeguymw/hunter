export interface Category {
  id: string;
  label: string;
  emoji: string;
  /** Categories added from the admin dashboard vs. the launch set */
  isCustom?: boolean;
}

export * from './creator';
export * from './chat';

export interface UserProfile {
  /** The recovery / login key. Shown once at creation. Never a real-world identifier. */
  idKey: string;
  /** Auto-generated anonymous handle. Editable, never required to be a real name. */
  handle: string;
  bio: string;
  /** Deterministic seed used to render a generated (non-photographic) avatar glyph */
  avatarSeed: string;
  interests: string[]; // Category ids
  createdAt: string;
  followerIds: string[];
  followingIds: string[];
  isAdmin?: boolean;
  status: 'active' | 'suspended';
  /** Gated behind admin approval. Only 'approved' unlocks creator tools. */
  creatorStatus: import('./creator').CreatorStatus;
}

export interface Comment {
  id: string;
  authorHandle: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorHandle: string;
  categoryIds: string[];
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderHandle: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name: string;
  participantHandles: string[];
  messages: ChatMessage[];
}

export interface Report {
  id: string;
  targetType: 'post' | 'user';
  targetId: string;
  reason: string;
  createdAt: string;
  status: 'open' | 'resolved';
}
