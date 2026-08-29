import { useApp } from '../../context/AppContext';
import { timeAgo } from '../../utils/time';

export default function AdminReports() {
  const { reports, resolveReport, posts, deletePost } = useApp();

  return (
    <div className="divide-y divide-line rounded-2xl border border-line">
      {reports.length === 0 && <p className="px-4 py-8 text-center text-sm text-smoke">No reports.</p>}
      {reports.map((r) => {
        const post = r.targetType === 'post' ? posts.find((p) => p.id === r.targetId) : null;
        return (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-paper">
                {r.targetType} <span className="text-smoke">&middot;</span> {r.reason}
              </p>
              <p className="mt-0.5 text-xs text-smoke">
                {timeAgo(r.createdAt)} ago {post ? `— by ${post.authorHandle}` : ''}
              </p>
            </div>
            <span className={`shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-smoke`}>{r.status}</span>
            {r.status === 'open' && (
              <div className="flex shrink-0 gap-2">
                {post && (
                  <button
                    onClick={() => {
                      deletePost(post.id);
                      resolveReport(r.id);
                    }}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-paper"
                  >
                    Remove post
                  </button>
                )}
                <button
                  onClick={() => resolveReport(r.id)}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-paper"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
