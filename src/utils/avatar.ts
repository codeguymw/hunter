// Deterministic, non-photographic avatar glyph derived from a seed string.
// Deliberately geometric — Hunter never asks for or stores a real photo as an identity avatar.

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function avatarCells(seed: string, gridSize = 5): boolean[][] {
  const h = hash(seed);
  const cells: boolean[][] = [];
  const cols = Math.ceil(gridSize / 2);
  for (let row = 0; row < gridSize; row++) {
    const rowCells: boolean[] = [];
    for (let col = 0; col < cols; col++) {
      const bit = (h >> (row * cols + col)) & 1;
      rowCells.push(bit === 1);
    }
    cells.push(rowCells);
  }
  return cells;
}
