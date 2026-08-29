import { Link } from 'react-router-dom';
import Logo from '../Logo';

interface TopBarProps {
  title?: string;
  right?: React.ReactNode;
}

export default function TopBar({ title, right }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-void/95 px-4 py-3 backdrop-blur md:hidden">
      {title ? (
        <h1 className="font-display text-base tracking-tightest text-paper">{title}</h1>
      ) : (
        <Link to="/feed">
          <Logo withWordmark size={28} />
        </Link>
      )}
      <div className="flex items-center gap-3">{right}</div>
    </header>
  );
}
