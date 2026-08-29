import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import InterestChip from '../components/InterestChip';
import TopBar from '../components/layout/TopBar';

export default function Upload() {
  const { categories, addPost } = useApp();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    setPreview(URL.createObjectURL(file));
  }

  function toggleCat(id: string) {
    setSelectedCats((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function publish() {
    if (!preview || selectedCats.length === 0) return;
    addPost({ mediaUrl: preview, mediaType, caption, categoryIds: selectedCats });
    navigate('/feed');
  }

  return (
    <div>
      <TopBar title="New post" />
      <div className="mx-auto w-full max-w-lg px-4 py-6 md:pt-10">
        <h1 className="hidden font-display text-2xl tracking-tightest text-paper md:block">New post</h1>

        {!preview ? (
          <button
            onClick={() => fileInput.current?.click()}
            className="mt-6 flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line text-smoke hover:border-fog hover:text-paper"
          >
            <ImagePlus className="h-8 w-8" strokeWidth={1.25} />
            <span className="text-sm">Upload a photo or video</span>
          </button>
        ) : (
          <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-2xl bg-ink">
            {mediaType === 'image' ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <video src={preview} className="h-full w-full object-cover" controls />
            )}
            <button
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 rounded-full bg-void/80 p-1.5 text-paper"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <input ref={fileInput} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={3}
          className="mt-5 w-full resize-none rounded-2xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-smoke focus:border-paper focus:outline-none"
        />

        <p className="mt-5 text-sm font-medium text-paper">Tag categories</p>
        <p className="text-xs text-smoke">This decides who sees it in their feed.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <InterestChip
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              selected={selectedCats.includes(c.id)}
              onClick={() => toggleCat(c.id)}
            />
          ))}
        </div>

        <button
          onClick={publish}
          disabled={!preview || selectedCats.length === 0}
          className="mt-8 w-full rounded-2xl bg-paper py-4 text-[15px] font-semibold text-void transition disabled:opacity-30"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
