import { avatarCells } from '../utils/avatar';

interface AvatarProps {
  seed: string;
  size?: number;
  inverted?: boolean; // white glyph on black, for use on dark surfaces
  ring?: boolean;
}

export default function Avatar({ seed, size = 40, inverted = false, ring = false }: AvatarProps) {
  const grid = avatarCells(seed);
  const rows = grid.length;
  const cols = grid[0].length;
  const cell = 100 / (cols * 2);
  const bg = inverted ? '#000000' : '#FFFFFF';
  const fg = inverted ? '#FFFFFF' : '#000000';

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full ${ring ? 'ring-2 ring-paper' : ''}`}
      style={{ width: size, height: size, background: bg, border: inverted ? 'none' : '1px solid #262626' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {grid.map((row, r) =>
          row.map((filled, c) => {
            if (!filled) return null;
            const mirroredC = cols * 2 - 1 - c;
            return (
              <g key={`${r}-${c}`}>
                <rect x={c * cell} y={r * (100 / rows)} width={cell} height={100 / rows} fill={fg} />
                <rect x={mirroredC * cell} y={r * (100 / rows)} width={cell} height={100 / rows} fill={fg} />
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
