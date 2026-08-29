import { useApp } from '../../context/AppContext';

export default function AdminDashboard() {
  const { users, posts, categories, reports, conversations } = useApp();

  const stats = [
    { label: 'Total members', value: users.length },
    { label: 'Suspended', value: users.filter((u) => u.status === 'suspended').length },
    { label: 'Posts', value: posts.length },
    { label: 'Categories', value: categories.length },
    { label: 'Open reports', value: reports.filter((r) => r.status === 'open').length },
    { label: 'Conversations', value: conversations.length },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-line p-5">
          <p className="font-display text-3xl tracking-tightest text-paper">{s.value}</p>
          <p className="mt-1 text-xs text-smoke">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
