import logo from '../assets/hunter-logo.jpg';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export default function Logo({ size = 32, withWordmark = false, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-paper p-1.5"
        style={{ width: size, height: size }}
      >
        <img src={logo} alt="Hunter" className="h-full w-full object-contain" draggable={false} />
      </div>
      {withWordmark && (
        <span className="font-display text-lg tracking-tightest text-paper">HUNTER</span>
      )}
    </div>
  );
}
