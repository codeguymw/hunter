interface InterestChipProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
}

export default function InterestChip({ label, emoji, selected, onClick }: InterestChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
        selected
          ? 'border-paper bg-paper text-void'
          : 'border-line bg-transparent text-fog hover:border-fog hover:text-paper'
      }`}
    >
      {emoji && <span className="text-base leading-none">{emoji}</span>}
      {label}
    </button>
  );
}
