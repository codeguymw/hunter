import type { Category, Post, UserProfile, Conversation } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'nature-photo', label: 'Nature Photography', emoji: '🌿' },
  { id: 'street-photo', label: 'Street Photography', emoji: '📷' },
  { id: 'illustration', label: 'Illustration', emoji: '✏️' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'fashion', label: 'Fashion', emoji: '👕' },
  { id: 'film', label: 'Film & Video', emoji: '🎬' },
  { id: 'writing', label: 'Writing & Poetry', emoji: '✒️' },
  { id: 'design', label: 'Design', emoji: '🧩' },
  { id: 'sculpture', label: 'Sculpture', emoji: '🗿' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'gaming-art', label: 'Gaming Art', emoji: '🎮' },
  { id: 'architecture', label: 'Architecture', emoji: '🏛️' },
  { id: 'crafts', label: 'Crafts', emoji: '🧵' },
  { id: 'tattoo', label: 'Tattoo Art', emoji: '🖋️' },
  { id: 'anime', label: 'Anime & Comics', emoji: '📚' },
];

const SAMPLE_HANDLES = [
  'quiet_wren_482', 'ember_lynx_119', 'north_moss_775', 'onyx_dune_204',
  'vapor_fern_630', 'ridge_raven_357', 'pale_birch_902', 'cinder_frost_016',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function buildSeedUsers(): UserProfile[] {
  return SAMPLE_HANDLES.map((handle, i) => ({
    idKey: `HNT-SEED-${i}000-DEMO`,
    handle,
    bio: 'Making things, sharing quietly.',
    avatarSeed: handle,
    interests: [pick(DEFAULT_CATEGORIES).id, pick(DEFAULT_CATEGORIES).id],
    createdAt: daysAgo(30 - i),
    followerIds: [],
    followingIds: [],
    status: 'active',
    creatorStatus: i < 3 ? 'approved' : 'none',
  }));
}

const PICSUM_SEEDS = [
  'hunter-1', 'hunter-2', 'hunter-3', 'hunter-4', 'hunter-5', 'hunter-6',
  'hunter-7', 'hunter-8', 'hunter-9', 'hunter-10', 'hunter-11', 'hunter-12',
];

const CAPTIONS = [
  'Three days of work on this piece. Finally happy with the light.',
  'Shot on a walk this morning — didn\u2019t expect the fog to hold this long.',
  'First pass on a new character study. More coming this week.',
  'Textures I keep coming back to. Wanted to share the process.',
  'Unfinished, but I like it unfinished.',
  'Reworked the composition after some feedback — much better now.',
];

export function buildSeedPosts(users: UserProfile[]): Post[] {
  return PICSUM_SEEDS.map((seed, i) => {
    const author = users[i % users.length];
    const cats = [pick(DEFAULT_CATEGORIES).id, pick(DEFAULT_CATEGORIES).id];
    return {
      id: `post_${i}`,
      authorHandle: author.handle,
      categoryIds: Array.from(new Set(cats)),
      mediaUrl: `https://picsum.photos/seed/${seed}/900/1100`,
      mediaType: 'image' as const,
      caption: CAPTIONS[i % CAPTIONS.length],
      likedBy: [],
      comments: [],
      createdAt: daysAgo(12 - i),
    };
  });
}

export function buildSeedConversations(_users: UserProfile[]): Conversation[] {
  return [
    {
      id: 'conv_1',
      isGroup: false,
      name: 'quiet_wren_482',
      participantHandles: ['quiet_wren_482'],
      messages: [
        { id: 'm1', senderHandle: 'quiet_wren_482', text: 'loved the piece you posted today', createdAt: daysAgo(1) },
      ],
    },
    {
      id: 'conv_2',
      isGroup: true,
      name: 'Street Photo Circle',
      participantHandles: ['ember_lynx_119', 'onyx_dune_204', 'pale_birch_902'],
      messages: [
        { id: 'm2', senderHandle: 'ember_lynx_119', text: 'anyone shooting this weekend?', createdAt: daysAgo(2) },
        { id: 'm3', senderHandle: 'onyx_dune_204', text: 'i\u2019m in, downtown around 7am', createdAt: daysAgo(2) },
      ],
    },
  ];
}
