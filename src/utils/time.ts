export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, 's'],
    [60, 'm'],
    [24, 'h'],
    [7, 'd'],
    [4.345, 'w'],
    [12, 'mo'],
    [Infinity, 'y'],
  ];
  let value = seconds;
  for (const [step, label] of units) {
    if (value < step) return `${Math.max(1, Math.floor(value))}${label}`;
    value /= step;
  }
  return `${Math.floor(value)}y`;
}
