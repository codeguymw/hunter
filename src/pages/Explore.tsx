import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TopBar from '../components/layout/TopBar';
import ProtectedMedia from '../components/media/ProtectedMedia';

export default function Explore() {
  const { categories, explorePosts } = useApp();
  const [active, setActive] = useState<string[]>([]);

  const posts = useMemo(() => explorePosts(active), [active, explorePosts]);

  function toggle(id: string) {
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div>
      <TopBar title="Explore" />

      <div className="mx-auto w-full max-w-4xl md:pt-8">
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-4 md:px-8" style={{ scrollbarWidth: 'none' }}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                active.includes(c.id)
                  ? 'border-paper bg-paper text-void'
                  : 'border-line text-fog hover:border-fog hover:text-paper'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-0.5 px-0.5 md:gap-1 md:px-8">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="block">
              <ProtectedMedia src={post.mediaUrl} type={post.mediaType} alt={post.caption} aspect="aspect-square" />
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="px-6 py-16 text-center text-sm text-smoke">No posts match this filter yet.</p>
        )}
      </div>
    </div>
  );
}
