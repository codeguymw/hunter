import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminCategories() {
  const { categories, posts, addCategory, updateCategory, deleteCategory } = useApp();
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    addCategory(label, emoji);
    setLabel('');
    setEmoji('');
  }

  function postCount(id: string) {
    return posts.filter((p) => p.categoryIds.includes(id)).length;
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-line p-4">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-smoke">Category name</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Ceramics"
            className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none"
          />
        </div>
        <div className="w-20">
          <label className="text-xs text-smoke">Emoji</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🏺"
            className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-center text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none"
          />
        </div>
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-paper px-4 py-2.5 text-sm font-semibold text-void">
          <Plus className="h-4 w-4" /> Add category
        </button>
      </form>

      <p className="mt-6 text-xs uppercase tracking-widest2 text-smoke">
        {categories.length} categories — these power the interest-matching feed algorithm
      </p>

      <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
            <input
              value={c.emoji}
              onChange={(e) => updateCategory(c.id, { emoji: e.target.value })}
              className="w-10 rounded-lg border border-transparent bg-transparent text-center text-lg focus:border-line focus:outline-none"
            />
            <input
              value={c.label}
              onChange={(e) => updateCategory(c.id, { label: e.target.value })}
              className="flex-1 rounded-lg border border-transparent bg-transparent px-1 text-sm text-paper focus:border-line focus:outline-none"
            />
            <span className="shrink-0 text-xs text-smoke">{postCount(c.id)} posts</span>
            {c.isCustom !== false && (
              <button
                onClick={() => confirm(`Delete "${c.label}"? Posts keep the tag but it won't be selectable anymore.`) && deleteCategory(c.id)}
                className="shrink-0 rounded-lg p-1.5 text-smoke hover:text-paper"
                aria-label="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
