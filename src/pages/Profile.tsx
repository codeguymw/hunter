import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, LogOut, RefreshCw, Settings, Shield, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import ProtectedMedia from '../components/media/ProtectedMedia';
import TopBar from '../components/layout/TopBar';
import InterestChip from '../components/InterestChip';
import { CreatorBadge } from '../components/creator/CreatorBits';

export default function Profile() {
  const { handle } = useParams();
  const {
    currentUser,
    users,
    posts,
    categories,
    logout,
    updateProfile,
    rotateKey,
    toggleFollow,
    toggleAdminModeDemo,
    startDirectConversation,
  } = useApp();
  const navigate = useNavigate();

  const isOwn = !handle || handle === currentUser?.handle;
  const profile = isOwn ? currentUser : users.find((u) => u.handle === handle);

  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile?.bio ?? '');
  const [showKey, setShowKey] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [interestDraft, setInterestDraft] = useState<string[]>(profile?.interests ?? []);

  if (!profile) return <Navigate to="/feed" replace />;

  const userPosts = posts.filter((p) => p.authorHandle === profile.handle);
  const following = !!currentUser && currentUser.followingIds.includes(profile.idKey);

  function saveBio() {
    updateProfile({ bio: bioDraft });
    setEditingBio(false);
  }

  function saveInterests() {
    updateProfile({ interests: interestDraft });
    setEditingInterests(false);
  }

  function message() {
    const id = startDirectConversation(profile!.handle);
    navigate(`/messages/${id}`);
  }

  return (
    <div>
      <TopBar
        title={profile.handle}
        right={
          isOwn ? (
            <Link to="#" onClick={(e) => e.preventDefault()} className="text-paper">
              <Settings className="h-5 w-5" />
            </Link>
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:pt-10">
        <div className="flex items-center gap-5">
          <Avatar seed={profile.avatarSeed} size={84} />
          <div className="flex flex-1 gap-6">
            <div>
              <p className="text-lg font-semibold text-paper">{userPosts.length}</p>
              <p className="text-xs text-smoke">posts</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-paper">{profile.followerIds.length}</p>
              <p className="text-xs text-smoke">followers</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-paper">{profile.followingIds.length}</p>
              <p className="text-xs text-smoke">following</p>
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-2 font-display text-lg tracking-tightest text-paper">{profile.handle}{profile.creatorStatus === 'approved' && <CreatorBadge size={16} />}</p>

        {editingBio ? (
          <div className="mt-2 flex gap-2">
            <input
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              className="flex-1 rounded-xl border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-paper focus:outline-none"
            />
            <button onClick={saveBio} className="rounded-xl bg-paper px-3 text-sm font-medium text-void">
              Save
            </button>
          </div>
        ) : (
          <p className="mt-1 text-sm text-smoke">{profile.bio || 'No bio yet.'}</p>
        )}

        <div className="mt-4 flex gap-2">
          {isOwn ? (
            <>
              <button
                onClick={() => setEditingBio((v) => !v)}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-paper"
              >
                Edit bio
              </button>
              <button
                onClick={() => setEditingInterests((v) => !v)}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-paper"
              >
                Edit interests
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => toggleFollow(profile.handle)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium ${
                  following ? 'border border-line text-paper' : 'bg-paper text-void'
                }`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
              <button onClick={message} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-paper">
                Message
              </button>
            </>
          )}
        </div>

        {editingInterests && (
          <div className="mt-4 rounded-2xl border border-line p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <InterestChip
                  key={c.id}
                  label={c.label}
                  emoji={c.emoji}
                  selected={interestDraft.includes(c.id)}
                  onClick={() =>
                    setInterestDraft((prev) => (prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]))
                  }
                />
              ))}
            </div>
            <button onClick={saveInterests} className="mt-4 w-full rounded-xl bg-paper py-2.5 text-sm font-semibold text-void">
              Save interests
            </button>
          </div>
        )}

        {isOwn && profile.creatorStatus !== 'approved' && (
          <button onClick={() => navigate('/creator/apply')}
            disabled={profile.creatorStatus === 'pending'}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3.5 text-left disabled:opacity-60">
            <span>
              <span className="block text-sm text-paper">
                {profile.creatorStatus === 'pending' ? 'Creator application under review' : 'Become a creator'}
              </span>
              <span className="mt-0.5 block text-xs text-smoke">
                {profile.creatorStatus === 'pending'
                  ? 'Hunter will message you when it is decided.'
                  : 'Sell gated work from the vault and get the Hunter mark.'}
              </span>
            </span>
          </button>
        )}

        {isOwn && profile.creatorStatus === 'approved' && (
          <button onClick={() => navigate('/vault/new')}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3.5 text-left">
            <span>
              <span className="flex items-center gap-1.5 text-sm text-paper">Creator account <CreatorBadge size={13} /></span>
              <span className="mt-0.5 block text-xs text-smoke">Publish a new gated item to the vault.</span>
            </span>
          </button>
        )}

        {isOwn && (
          <div className="mt-6 space-y-3 rounded-2xl border border-line p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-paper">
              <Shield className="h-4 w-4" /> Account key
            </p>
            <p className="break-all font-mono text-sm text-smoke">
              {showKey ? profile.idKey : profile.idKey.replace(/[A-Z0-9](?=.{4})/g, '\u2022')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowKey((v) => !v)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-2 text-xs font-medium text-paper"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showKey ? 'Hide' : 'Reveal'}
              </button>
              <button
                onClick={() => confirm('Rotating your key invalidates the old one. Continue?') && rotateKey()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-2 text-xs font-medium text-paper"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Rotate key
              </button>
            </div>
          </div>
        )}

        {isOwn && (
          <button
            onClick={toggleAdminModeDemo}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-line px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-sm text-paper">
              <ShieldCheck className="h-4 w-4" />
              Admin mode
              <span className="text-xs text-smoke">(prototype only)</span>
            </span>
            <span
              className={`h-5 w-9 shrink-0 rounded-full transition-colors ${profile.isAdmin ? 'bg-paper' : 'bg-line'}`}
            >
              <span
                className={`block h-4 w-4 translate-y-0.5 rounded-full bg-void transition-transform ${
                  profile.isAdmin ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
        )}

        <div className="mt-8 grid grid-cols-3 gap-0.5">
          {userPosts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`}>
              <ProtectedMedia src={post.mediaUrl} type={post.mediaType} alt={post.caption} aspect="aspect-square" />
            </Link>
          ))}
        </div>
        {userPosts.length === 0 && <p className="mt-10 text-center text-sm text-smoke">No posts yet.</p>}

        {isOwn && (
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3.5 text-sm font-medium text-paper"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        )}
      </div>
    </div>
  );
}
