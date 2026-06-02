export const DEPTH_CONFIG = {
  ankle: { label: 'Ankle deep', color: '#EF9F27' },
  knee:  { label: 'Knee deep',  color: '#D85A30' },
  waist: { label: 'Waist deep', color: '#E24B4A' },
  chest: { label: 'Chest deep', color: '#791F1F' },
} as const;

export type Depth = keyof typeof DEPTH_CONFIG;
