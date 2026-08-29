// Generates the account's recovery / login key and an anonymous display handle.
// Nothing here is derived from or tied to any real-world personal information.

const KEY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
const HANDLE_WORDS = [
  'shadow', 'ember', 'quiet', 'north', 'echo', 'drift', 'onyx', 'slate',
  'vapor', 'ridge', 'lynx', 'raven', 'birch', 'pale', 'dune', 'moss',
  'fern', 'wren', 'cinder', 'frost',
];

function randomInt(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function randomSegment(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += KEY_ALPHABET[randomInt(KEY_ALPHABET.length)];
  return out;
}

/** e.g. HNT-7F3K-QX2M-91LP */
export function generateIdKey(): string {
  return `HNT-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}`;
}

/** e.g. quiet_wren_482 */
export function generateHandle(): string {
  const w1 = HANDLE_WORDS[randomInt(HANDLE_WORDS.length)];
  const w2 = HANDLE_WORDS[randomInt(HANDLE_WORDS.length)];
  const n = 100 + randomInt(900);
  return `${w1}_${w2}_${n}`;
}

export function generateAvatarSeed(): string {
  return randomSegment(8);
}

/** Short, non-reversible-looking fragment of the ID key for watermarking media. Not the full key. */
export function shortKeyFragment(idKey: string): string {
  return idKey.split('-').slice(-1)[0];
}
