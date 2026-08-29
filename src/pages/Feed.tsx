import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PostCard from '../components/PostCard';
import TopBar from '../components/layout/TopBar';

export default function Feed() {
  const { feed } = useApp();

  return (
    <div>
      <TopBar
        right={
          <Link to="/messages" className="text-paper">
            <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-xl md:pt-8">
        {feed.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-24 text-center">
            <p className="font-display text-lg tracking-tightest text-paper">Nothing here yet</p>
            <p className="mt-2 max-w-[280px] text-sm text-smoke">
              Posts tagged to your interests will show up here as people share them.
              Try widening your interests in your profile, or explore everything.
            </p>
            <Link to="/explore" className="mt-5 rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-paper">
              Go to Explore
            </Link>
          </div>
        ) : (
          feed.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
