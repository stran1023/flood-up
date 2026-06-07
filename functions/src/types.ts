import type { Timestamp } from 'firebase-admin/firestore';

export type Depth = 'ankle' | 'knee' | 'waist' | 'chest';
export type ReportStatus = 'pending' | 'confirmed' | 'disputed' | 'expired';

export interface FloodReport {
  id: string;
  lat: number;
  lng: number;
  geohash: string;
  depth: Depth;
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

export interface AppUser {
  uid: string;
  fcmTokens: string[];
  homeLat?: number;
  homeLng?: number;
  homeGeohash?: string;
  reportCount: number;
  trustScore: number;
  createdAt: Timestamp;
  role: 'resident' | 'driver' | 'authority';
}
