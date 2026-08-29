import { useApp } from '../../context/AppContext';
import { shortKeyFragment } from '../../utils/idGenerator';
import { useLeakDeterrence } from '../../utils/useLeakDeterrence';
import { EyeOff } from 'lucide-react';

interface ProtectedMediaProps {
  src: string;
  type: 'image' | 'video';
  alt: string;
  aspect?: string; // tailwind aspect-* class
}

export default function ProtectedMedia({ src, type, alt, aspect = 'aspect-[4/5]' }: ProtectedMediaProps) {
  const { currentUser } = useApp();
  const { isObscured } = useLeakDeterrence();

  const watermarkTag = currentUser
    ? `${currentUser.handle} \u00b7 ${shortKeyFragment(currentUser.idKey)}`
    : 'hunter';

  return (
    <div className={`hn-protected relative w-full overflow-hidden bg-ink ${aspect}`}>
      {type === 'image' ? (
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={`h-full w-full object-cover transition duration-300 ${isObscured ? 'blur-2xl scale-105' : ''}`}
        />
      ) : (
        <video
          src={src}
          className={`h-full w-full object-cover transition duration-300 ${isObscured ? 'blur-2xl scale-105' : ''}`}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
        />
      )}

      {/* Traceable watermark grid — ties any leaked copy back to the viewing account */}
      {!isObscured && (
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-3 place-items-center opacity-[0.16]">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-mono text-[10px] font-medium text-paper"
              style={{ transform: 'rotate(-28deg)' }}
            >
              {watermarkTag}
            </span>
          ))}
        </div>
      )}

      {isObscured && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-void/60 text-center">
          <EyeOff className="h-5 w-5 text-paper" strokeWidth={1.5} />
          <p className="max-w-[70%] font-mono text-[11px] text-fog">content hidden while window is inactive</p>
        </div>
      )}
    </div>
  );
}
