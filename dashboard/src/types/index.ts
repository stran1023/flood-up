import type { Timestamp } from 'firebase/firestore';

export type Depth = 'ankle' | 'knee' | 'waist' | 'chest';
export type ReportStatus = 'pending' | 'confirmed' | 'disputed' | 'expired';

export interface FloodReport {
  id: string;
  lat: number;
  lng: number;
  geohash: string;
  depth: Depth;
  photoUrl?: string;
  photoVerified?: boolean | null;
  reportedAt: Timestamp;
  expiresAt: Timestamp;
  userId: string;
  accountAgeDays: number;
  upvotes: number;
  downvotes: number;
  status: ReportStatus;
  corroborationCount: number;
  weatherRainfallMm?: number;
  trustScore: number;
}

export const DEPTH_LABEL: Record<Depth, string> = {
  ankle: 'Ankle',
  knee:  'Knee',
  waist: 'Waist',
  chest: 'Chest',
};

export const DEPTH_COLOR: Record<Depth, string> = {
  ankle: '#EF9F27',
  knee:  '#D85A30',
  waist: '#E24B4A',
  chest: '#791F1F',
};

export const STATUS_COLOR: Record<ReportStatus, string> = {
  pending:   '#94a3b8',
  confirmed: '#22c55e',
  disputed:  '#f59e0b',
  expired:   '#475569',
};
