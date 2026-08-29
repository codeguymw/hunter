# Hunter

A creator-showcase social platform prototype: React + TypeScript + Tailwind, black &
white, Telegram/Instagram/X-inspired UI. Anonymous account creation, interest-based
feed filtering, posts/comments, DMs + group chat, and an admin dashboard for managing
categories, members, and reports.

This is a **frontend prototype**. There is no backend — all data (accounts, posts,
messages) lives in the browser's `localStorage` so it persists across reloads on one
device, but nothing syncs between devices or users. Wiring it to a real backend is the
main thing left before this is production-ready (see "Going to production" below).

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
```

## How the pieces fit together

- `src/context/AppContext.tsx` — single source of truth for the whole prototype:
  session/auth, categories, users, posts, conversations, reports. This is the file
  you'd split apart into real API calls first.
- `src/utils/idGenerator.ts` — generates the recovery/login **ID key** and the
  anonymous handle. No email, phone, or name is ever collected.
- `src/utils/avatar.ts` + `components/Avatar.tsx` — a deterministic, non-photographic
  identicon. Hunter never asks for or stores a real photo as an identity avatar,
  by design.
- `src/pages/CreateAccount.tsx` — shows the generated key once, requires the person to
  confirm they've saved it before continuing (there's no email fallback to recover it).
- `src/pages/InterestSelection.tsx` + the `feed` memo in `AppContext.tsx` — the
  interest-matching "algorithm": posts are scored by how many of the viewer's chosen
  categories they're tagged with, then sorted by recency. Purely local and
  deterministic — no engagement/tracking signals feed into it.
- `src/pages/admin/AdminCategories.tsx` — add, rename, re-emoji, or remove the
  categories that drive that filtering. This is your admin taxonomy dashboard.
- `src/pages/admin/*` — user suspension and a reports queue. Reachable from Profile →
  "Admin mode (prototype only)" toggle, since there's no backend role system yet
  (see below).

## The safety features — what's real and what isn't

**Leak deterrence (`utils/useLeakDeterrence.ts`, `components/media/ProtectedMedia.tsx`):**
Every post and shared media file is watermarked, in a repeating tiled pattern, with the
*viewing* account's handle and a key fragment, plus blurred whenever the browser tab
loses focus, with right-click/drag-save disabled. This is real and shipped.

**What this is not:** a way to block screenshots or screen recording. No website, in
any browser, on any device, can detect or prevent an OS-level screenshot or a phone
pointed at the screen — there is no browser API for that. The watermark is the
actual protection: it doesn't stop a leak, but it makes any leaked copy traceable
back to the account that viewed it, which is the same approach streaming and banking
apps use on the web.

**What was deliberately left out:** using a user's camera to watch for someone
recording the screen with another device and auto-blocking them. That's a form of
biometric surveillance of a person's physical surroundings, carries real legal
exposure (BIPA, GDPR biometric data rules, wiretap-adjacent statutes depending on
jurisdiction), and — separate from the legal question — would misfire constantly
(anything from a person adjusting their glasses to a pet walking by could look like
"someone with a phone"), punishing real users for false positives. If you later ship
native iOS/Android apps, those platforms have OS-level primitives that actually work
for this class of problem (Android `FLAG_SECURE` blocks screenshots/recording
outright; iOS exposes `UIScreen.capturedDidChangeNotification` to detect screen
recording) — that's the direction to build in if leak prevention needs to get
stronger than watermarking, not client-side camera monitoring.

## Going to production

- Replace `AppContext.tsx`'s local state with real API calls (REST/GraphQL) and swap
  `localStorage` for httpOnly session cookies or a token store.
- Hash/derive nothing client-visible from the ID key when storing it server-side —
  treat it like a password, not a username.
- Replace the "Admin mode (prototype only)" toggle in `Profile.tsx` with a real
  server-side role check; right now anyone can flip it on themselves in devtools.
- Move file uploads off `URL.createObjectURL` (local-only preview) to real object
  storage with server-side validation/transcoding.
- Add rate limiting and moderation queues server-side; the current report/suspend
  flow has no server enforcement behind it yet.

---

## Creator accounts, the vault, and rich chat

### Creator flow
`pages/CreatorApply.tsx` → `context/CreatorContext.tsx` → `pages/admin/AdminCreators.tsx`.
A member applies, an admin approves, and only then does `creatorStatus === 'approved'`
unlock the vault upload route and attach the Hunter mark (`components/creator/CreatorBits.tsx`)
next to their handle everywhere it appears.

### The vault
`pages/Vault.tsx` lists every gated item to every member. Without a grant you get
`LockedPlacard` — title, price, media type, access window, and the option flags, over a
blurred backdrop. Requesting access files an `AccessRequest` and drops an approve/deny
card straight into the creator's DM thread. Approval starts a countdown; `hasAccess()`
re-checks the expiry on every read, and a sweep marks lapsed grants `expired`.

`pages/VaultUpload.tsx` sets price (MWK or USD), access window (capped at 168 hours),
categories, and the toggles for downloads, viewer watermarking, burn-after-view, and a
cap on total viewers.

**The blur is not the security boundary.** In this prototype the file is already on the
client, so blurring is cosmetic. In production the server must refuse to serve the media
at all until a live grant exists for that viewer, and must re-check on every request.
Treat the locked state as "the bytes never left the server", not "the bytes are here but
hidden".

### Chat
`pages/ChatRoom.tsx` handles text, emoji, GIFs, voice notes, video notes, one-time
messages, and the access-request cards. Voice and video notes record for real through
`MediaRecorder` in `components/chat/ChatExtras.tsx`.

- **Retention**: threads default to 48 hours. Expired messages are deleted from state by
  a sweep in `CreatorContext`, not hidden from view.
- **Burn on read**: per-thread toggle; every message in the thread dies once opened.
- **One-time media**: the flame button in the composer marks a single message
  self-destructing regardless of thread setting.

### Announcement channel
`conv_hunter` is seeded pinned into every account, `readOnly: true`, and only renders a
composer when `currentUser.isAdmin`. It has no retention — announcements persist.

### What still needs a backend
- **Payments.** Nothing charges anyone. MWK realistically means Airtel Money or TNM
  Mpamba; USD means Stripe or PayPal. All of them require KYC on the creator receiving
  payout — keep that server-side so other members still only ever see a handle.
- **Calls.** `CallOverlay` is interface only. Real calls need WebRTC plus signalling and
  TURN relays; LiveKit or Daily will save you weeks over rolling your own.
- **GIFs.** `GIF_STUBS` is placeholder. Tenor and Giphy both need an API key proxied
  server-side and a content rating parameter pinned to a safe tier.
- **Retention.** Client-side deletion is a UI promise, not a guarantee. The server has to
  hold the same TTL, or the data simply persists.
- **Moderation.** Private, expiring, creator-controlled media can't be reviewed after the
  fact. Creator approval is the real gate; also make reports preserve the reported item
  server-side even after it has expired for everyone else.
