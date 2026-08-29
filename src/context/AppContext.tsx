import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Category, Comment, ChatMessage, Conversation, Post, Report, UserProfile } from '../types';
import { DEFAULT_CATEGORIES, buildSeedConversations, buildSeedPosts, buildSeedUsers } from '../data/seed';
import { generateAvatarSeed, generateHandle, generateIdKey } from '../utils/idGenerator';
import { loadState, saveState } from '../utils/storage';

interface AppContextValue {
  // session
  currentUser: UserProfile | null;
  isOnboarded: boolean;
  createAccount: () => { idKey: string; handle: string };
  loginWithKey: (key: string) => boolean;
  logout: () => void;
  completeOnboarding: (interestIds: string[]) => void;
  updateProfile: (patch: Partial<Pick<UserProfile, 'handle' | 'bio' | 'interests' | 'creatorStatus' | 'isAdmin'>>) => void;
  rotateKey: () => string;
  /** Prototype-only toggle so the admin dashboard is reachable without a real backend role
   *  system. Replace with proper server-side role assignment before shipping. */
  toggleAdminModeDemo: () => void;

  // directory
  categories: Category[];
  addCategory: (label: string, emoji: string) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  setUserStatus: (handle: string, status: UserProfile['status']) => void;
  toggleFollow: (handle: string) => void;

  // content
  posts: Post[];
  addPost: (input: { mediaUrl: string; mediaType: 'image' | 'video'; caption: string; categoryIds: string[] }) => void;
  deletePost: (id: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  feed: Post[]; // ranked for currentUser by interest match
  explorePosts: (activeCategoryIds: string[]) => Post[];

  // messaging
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  startDirectConversation: (handle: string) => string; // returns conversation id
  createGroup: (name: string, memberHandles: string[]) => string;

  // trust & safety
  reports: Report[];
  reportContent: (targetType: Report['targetType'], targetId: string, reason: string) => void;
  resolveReport: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => loadState('categories', DEFAULT_CATEGORIES));
  const [users, setUsers] = useState<UserProfile[]>(() => loadState('users', buildSeedUsers()));
  const [posts, setPosts] = useState<Post[]>(() => loadState('posts', [] as Post[]));
  const [conversations, setConversations] = useState<Conversation[]>(() => loadState('conversations', [] as Conversation[]));
  const [reports, setReports] = useState<Report[]>(() => loadState('reports', [] as Report[]));
  const [sessionKey, setSessionKey] = useState<string | null>(() => loadState('sessionKey', null as string | null));

  // seed posts/conversations once we know the seed users
  useEffect(() => {
    if (posts.length === 0) setPosts(buildSeedPosts(users));
    if (conversations.length === 0) setConversations(buildSeedConversations(users));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => saveState('categories', categories), [categories]);
  useEffect(() => saveState('users', users), [users]);
  useEffect(() => saveState('posts', posts), [posts]);
  useEffect(() => saveState('conversations', conversations), [conversations]);
  useEffect(() => saveState('reports', reports), [reports]);
  useEffect(() => saveState('sessionKey', sessionKey), [sessionKey]);

  const currentUser = useMemo(
    () => users.find((u) => u.idKey === sessionKey) ?? null,
    [users, sessionKey]
  );
  const isOnboarded = !!currentUser && currentUser.interests.length > 0;

  function createAccount() {
    const idKey = generateIdKey();
    const handle = generateHandle();
    const newUser: UserProfile = {
      idKey,
      handle,
      bio: '',
      avatarSeed: generateAvatarSeed(),
      interests: [],
      createdAt: new Date().toISOString(),
      followerIds: [],
      followingIds: [],
      status: 'active',
      creatorStatus: 'none',
    };
    setUsers((prev) => [...prev, newUser]);
    setSessionKey(idKey);
    return { idKey, handle };
  }

  function loginWithKey(key: string) {
    const trimmed = key.trim().toUpperCase();
    const match = users.find((u) => u.idKey === trimmed);
    if (!match) return false;
    if (match.status === 'suspended') return false;
    setSessionKey(match.idKey);
    return true;
  }

  function logout() {
    setSessionKey(null);
  }

  function completeOnboarding(interestIds: string[]) {
    if (!currentUser) return;
    setUsers((prev) => prev.map((u) => (u.idKey === currentUser.idKey ? { ...u, interests: interestIds } : u)));
  }

  function updateProfile(patch: Partial<Pick<UserProfile, 'handle' | 'bio' | 'interests' | 'creatorStatus' | 'isAdmin'>>) {
    if (!currentUser) return;
    setUsers((prev) => prev.map((u) => (u.idKey === currentUser.idKey ? { ...u, ...patch } : u)));
  }

  function rotateKey() {
    if (!currentUser) return '';
    const newKey = generateIdKey();
    setUsers((prev) => prev.map((u) => (u.idKey === currentUser.idKey ? { ...u, idKey: newKey } : u)));
    setSessionKey(newKey);
    return newKey;
  }

  function toggleAdminModeDemo() {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.idKey === currentUser.idKey ? { ...u, isAdmin: !u.isAdmin } : u))
    );
  }

  function addCategory(label: string, emoji: string) {
    const id = label.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!id || categories.some((c) => c.id === id)) return;
    setCategories((prev) => [...prev, { id, label: label.trim(), emoji: emoji || '✨', isCustom: true }]);
  }

  function updateCategory(id: string, patch: Partial<Category>) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  function setUserStatus(handle: string, status: UserProfile['status']) {
    setUsers((prev) => prev.map((u) => (u.handle === handle ? { ...u, status } : u)));
  }

  function toggleFollow(handle: string) {
    if (!currentUser || handle === currentUser.handle) return;
    const target = users.find((u) => u.handle === handle);
    if (!target) return;
    const already = currentUser.followingIds.includes(target.idKey);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.idKey === currentUser.idKey) {
          return {
            ...u,
            followingIds: already
              ? u.followingIds.filter((id) => id !== target.idKey)
              : [...u.followingIds, target.idKey],
          };
        }
        if (u.idKey === target.idKey) {
          return {
            ...u,
            followerIds: already
              ? u.followerIds.filter((id) => id !== currentUser.idKey)
              : [...u.followerIds, currentUser.idKey],
          };
        }
        return u;
      })
    );
  }

  function addPost(input: { mediaUrl: string; mediaType: 'image' | 'video'; caption: string; categoryIds: string[] }) {
    if (!currentUser) return;
    const post: Post = {
      id: `post_${Date.now()}`,
      authorHandle: currentUser.handle,
      categoryIds: input.categoryIds,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      caption: input.caption,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [post, ...prev]);
  }

  function deletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleLike(postId: string) {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likedBy.includes(currentUser.handle);
        return {
          ...p,
          likedBy: liked ? p.likedBy.filter((h) => h !== currentUser.handle) : [...p.likedBy, currentUser.handle],
        };
      })
    );
  }

  function addComment(postId: string, text: string) {
    if (!currentUser || !text.trim()) return;
    const comment: Comment = {
      id: `c_${Date.now()}`,
      authorHandle: currentUser.handle,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)));
  }

  // --- The "algorithm": ranks posts by how many of the viewer's selected
  // interest categories a post matches, then by recency. Purely local /
  // deterministic — no tracking signals, just the categories the user chose.
  const feed = useMemo(() => {
    if (!currentUser) return [] as Post[];
    const interestSet = new Set(currentUser.interests);
    const scored = posts.map((p) => {
      const matches = p.categoryIds.filter((c) => interestSet.has(c)).length;
      return { post: p, score: matches };
    });
    return scored
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime();
      })
      .map((s) => s.post);
  }, [posts, currentUser]);

  function explorePosts(activeCategoryIds: string[]) {
    if (activeCategoryIds.length === 0) return posts;
    return posts.filter((p) => p.categoryIds.some((c) => activeCategoryIds.includes(c)));
  }

  function sendMessage(conversationId: string, text: string) {
    if (!currentUser || !text.trim()) return;
    const message: ChatMessage = {
      id: `m_${Date.now()}`,
      senderHandle: currentUser.handle,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c))
    );
  }

  function startDirectConversation(handle: string) {
    const existing = conversations.find((c) => !c.isGroup && c.participantHandles.includes(handle));
    if (existing) return existing.id;
    const id = `conv_${Date.now()}`;
    setConversations((prev) => [
      ...prev,
      { id, isGroup: false, name: handle, participantHandles: [handle], messages: [] },
    ]);
    return id;
  }

  function createGroup(name: string, memberHandles: string[]) {
    const id = `conv_${Date.now()}`;
    setConversations((prev) => [
      ...prev,
      { id, isGroup: true, name, participantHandles: memberHandles, messages: [] },
    ]);
    return id;
  }

  function reportContent(targetType: Report['targetType'], targetId: string, reason: string) {
    const report: Report = {
      id: `r_${Date.now()}`,
      targetType,
      targetId,
      reason,
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    setReports((prev) => [report, ...prev]);
  }

  function resolveReport(id: string) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
  }

  const value: AppContextValue = {
    currentUser,
    isOnboarded,
    createAccount,
    loginWithKey,
    logout,
    completeOnboarding,
    updateProfile,
    rotateKey,
    toggleAdminModeDemo,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    users,
    setUsers,
    setUserStatus,
    toggleFollow,
    posts,
    addPost,
    deletePost,
    toggleLike,
    addComment,
    feed,
    explorePosts,
    conversations,
    sendMessage,
    startDirectConversation,
    createGroup,
    reports,
    reportContent,
    resolveReport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
