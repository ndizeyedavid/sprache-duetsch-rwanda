export const DATE_PRESETS = [
  { id: '7', label: '7 days' },
  { id: '30', label: '30 days' },
  { id: '90', label: '90 days' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
] as const;

export type PresetId = (typeof DATE_PRESETS)[number]['id'];

export const SCORE_BUCKETS = [
  { label: '0-49', min: 0, max: 49, color: '#FC6B57' },
  { label: '50-59', min: 50, max: 59, color: '#F3B800' },
  { label: '60-69', min: 60, max: 69, color: '#5b8def' },
  { label: '70-79', min: 70, max: 79, color: '#A098AE' },
  { label: '80-89', min: 80, max: 89, color: '#374557' },
  { label: '90-100', min: 90, max: 100, color: '#FB0D00' },
];

export const GRADE_CUT = 50;
