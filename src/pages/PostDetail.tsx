import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useState as useS } from 'react';
import { ArrowLeft, Heart, Send, Smile, Image as ImageIcon } from 'lucide-react';
import { EmojiPicker, GifPicker } from '../components/chat/ChatExtras';
import { CreatorBadge } from '../components/creator/CreatorBits';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import ProtectedMedia from '../components/media/ProtectedMedia';
import { timeAgo } from '../utils/time';

export default function PostDetail() {
  const { id } = useParams();
  const { posts, users, categories, currentUser, toggleLike, addComment } = useApp();
  const [comment, setComment] = useState('');
  const [picker, setPicker] = useS<'none' | 'emoji' | 'gif'>('none');

  const post = posts.find((p) => p.id === id);
  if (!post) return <Navigate to="/feed" replace />;

  const author = users.find((u) => u.handle === post.authorHandle);
  const liked = !!currentUser && post.likedBy.includes(currentUser.handle);
  const cats = post.categoryIds.map((cid) => categories.find((c) => c.id === cid)).filter(Boolean);

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    addComment(post!.id, comment);
    setComment('');
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-void/95 px-4 py-3 backdrop-blur">
        <Link to="/feed" className="text-paper">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <p className="font-medium text-paper">Post</p>
      </header>

      <div className="flex items-center gap-2.5 px-4 py-3">
        <Avatar seed={author?.avatarSeed ?? post.authorHandle} size={34} />
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-paper">{post.authorHandle}{author?.creatorStatus === 'approved' && <CreatorBadge size={13} />}</p>
          <p className="text-xs text-smoke">{timeAgo(post.createdAt)} ago</p>
        </div>
      </div>

      <ProtectedMedia src={post.mediaUrl} type={post.mediaType} alt={post.caption} aspect="aspect-square" />

      <div className="px-4 py-3">
        <button onClick={() => toggleLike(post.id)} aria-label="Like">
          <Heart className={`h-6 w-6 ${liked ? 'fill-paper text-paper' : 'text-paper'}`} strokeWidth={1.75} />
        </button>
        <p className="mt-2 text-sm font-semibold text-paper">{post.likedBy.length} likes</p>
        <p className="mt-1 text-sm text-paper">
          <span className="font-semibold">{post.authorHandle}</span> {post.caption}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <span key={c!.id} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-smoke">
              {c!.emoji} {c!.label}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-line px-4 py-3">
        {post.comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-smoke">No comments yet — say something.</p>
        ) : (
          <ul className="space-y-4">
            {post.comments.map((c) => (
              <li key={c.id} className="flex gap-2.5">
                <Avatar seed={c.authorHandle} size={28} />
                <div>
                  <p className="text-sm text-paper">
                    <span className="font-semibold">{c.authorHandle}</span> {c.text}
                  </p>
                  <p className="mt-0.5 text-xs text-smoke">{timeAgo(c.createdAt)} ago</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={submitComment}
        className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-void px-4 py-3"
      >
        <div className="relative flex items-center gap-2">
          {picker === 'emoji' && <EmojiPicker onPick={(e) => setComment((c) => c + e)} onClose={() => setPicker('none')} />}
          {picker === 'gif' && (
            <GifPicker onPick={(label) => { addComment(post!.id, `GIF: ${label}`); setPicker('none'); }} onClose={() => setPicker('none')} />
          )}
          <button type="button" onClick={() => setPicker((p) => (p === 'emoji' ? 'none' : 'emoji'))}
            className="text-smoke hover:text-paper" aria-label="Emoji"><Smile className="h-5 w-5" /></button>
          <button type="button" onClick={() => setPicker((p) => (p === 'gif' ? 'none' : 'gif'))}
            className="text-smoke hover:text-paper" aria-label="GIF"><ImageIcon className="h-5 w-5" /></button>
        </div>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment"
          className="flex-1 rounded-full border border-line bg-ink px-4 py-2.5 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none"
        />
        <button type="submit" disabled={!comment.trim()} className="text-paper disabled:opacity-30" aria-label="Send">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
