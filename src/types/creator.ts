export type Currency = 'MWK' | 'USD';

export type CreatorStatus = 'none' | 'pending' | 'approved' | 'rejected';

/** A gated piece of work. Visible to everyone as a blurred placard; openable only with granted access. */
export interface VaultItem {
  id: string;
  creatorHandle: string;
  title: string;
  /** Blurred for everyone without access. */
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio';
  categoryIds: string[];
  price: number;
  currency: Currency;
  /** How long access lasts once granted, in hours. Hard ceiling of 168 (7 days). */
  accessDurationHours: number;
  downloadable: boolean;
  /** Watermark viewer identity into the opened media. */
  watermark: boolean;
  /** Destroy the item for the viewer the moment they close it. */
  burnOnView: boolean;
  /** Cap on total grants; null = unlimited. */
  maxGrants: number | null;
  createdAt: string;
}

export type AccessStatus = 'requested' | 'approved' | 'denied' | 'expired';

export interface AccessRequest {
  id: string;
  vaultItemId: string;
  requesterHandle: string;
  creatorHandle: string;
  message: string;
  status: AccessStatus;
  createdAt: string;
  /** Set when approved. Access dies at this instant. */
  expiresAt: string | null;
}

export interface CreatorApplication {
  id: string;
  handle: string;
  pitch: string;
  status: CreatorStatus;
  createdAt: string;
}

export const HOUR_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '6 hours', hours: 6 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days (max)', hours: 168 },
];

export const MAX_ACCESS_HOURS = 168;
