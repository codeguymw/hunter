import { useEffect, useState } from 'react';

/**
 * useLeakDeterrence
 * ------------------
 * A set of best-effort deterrents against casual media capture, applied
 * wherever <ProtectedMedia> is used.
 *
 * IMPORTANT — read before relying on this:
 * No web page, in any browser, on any OS, can detect or block a real
 * screenshot or an external device (e.g. a phone) recording the screen.
 * There is no such browser API. Anything claiming otherwise is not
 * telling the truth. What this hook DOES do:
 *
 *  1. Blurs protected content the instant the browser tab/window loses
 *     focus or visibility — this covers screen-recording tools that
 *     capture a specific window, and quick alt-tab capture attempts.
 *  2. Disables right-click-to-save and drag-to-save on protected media.
 *  3. Intercepts the PrintScreen key where the OS permits — again, best
 *     effort only, many OS/browser combinations ignore this entirely.
 *
 * The durable protection is the visible watermark in <ProtectedMedia>,
 * which ties any leaked copy back to the viewing account. If you later
 * ship native iOS/Android apps, use the OS-level primitives instead
 * (Android FLAG_SECURE, iOS UIScreen.capturedDidChangeNotification) —
 * those can actually block/detect capture, unlike anything on the web.
 */
export function useLeakDeterrence() {
  const [isObscured, setIsObscured] = useState(false);

  useEffect(() => {
    const obscure = () => setIsObscured(true);
    const reveal = () => setIsObscured(false);

    const handleVisibility = () => (document.hidden ? obscure() : reveal());
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleDragStart = (e: DragEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        obscure();
        window.setTimeout(reveal, 800);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', obscure);
    window.addEventListener('focus', reveal);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', obscure);
      window.removeEventListener('focus', reveal);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return { isObscured };
}
