import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Flag } from 'lucide-react';
import type { Post } from '../types';
import { useApp } from '../context/AppContext';
import Avatar from './Avatar';
import ProtectedMedia from './media/ProtectedMedia';
import { CreatorBadge } from './creator/CreatorBits';
import { timeAgo } from '../utils/time';

export default function PostCard({ post }: { post: Post }) {
  const { currentUser, users, categories, toggleLike, reportContent } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const author = users.find((u) => u.handle === post.authorHandle);
  const liked = !!currentUser && post.likedBy.includes(currentUser.handle);
  const cats = post.categoryIds.map((id) => categories.find((c) => c.id === id)).filter(Boolean);

  return (
    <article className="border-b border-line pb-4">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.authorHandle}`} className="flex items-center gap-2.5">
          <Avatar seed={author?.avatarSeed ?? post.authorHandle} size={34} />
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-paper">{post.authorHandle}{author?.creatorStatus === 'approved' && <CreatorBadge size={13} />}</p>
            <p className="text-xs text-smoke">{timeAgo(post.createdAt)} ago</p>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-1.5 text-fog hover:bg-ink"
            aria-label="Post options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border border-line bg-ink shadow-xl">
              <button
                onClick={() => {
                  reportContent('post', post.id, 'reported from feed');
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-paper hover:bg-void"
              >
                <Flag className="h-4 w-4" /> Report post
              </button>
            </div>
          )}
        </div>
      </div>

      <Link to={`/post/${post.id}`}>
        <ProtectedMedia src={post.mediaUrl} type={post.mediaType} alt={post.caption} />
      </Link>

      <div className="px-4 pt-3">
        <div className="flex items-center gap-4">
          <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5" aria-label="Like">
            <Heart className={`h-6 w-6 transition-colors ${liked ? 'fill-paper text-paper' : 'text-paper'}`} strokeWidth={1.75} />
          </button>
          <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 text-paper">
            <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
          </Link>
        </div>

        <p className="mt-2 text-sm font-semibold text-paper">{post.likedBy.length} likes</p>

        <p className="mt-1 text-sm text-paper">
          <span className="font-semibold">{post.authorHandle}</span> {post.caption}
        </p>

        {post.comments.length > 0 && (
          <Link to={`/post/${post.id}`} className="mt-1 block text-sm text-smoke">
            View all {post.comments.length} comments
          </Link>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <span key={c!.id} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-smoke">
              {c!.emoji} {c!.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
