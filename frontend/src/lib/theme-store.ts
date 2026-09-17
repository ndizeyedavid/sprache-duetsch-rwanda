const KEY = 'sparch.theme';

export const THEMES = [
  { id: 'light', label: 'Light', hint: 'Default bright' },
  { id: 'dark', label: 'Dark', hint: 'Easy on eyes' },
  { id: 'cupcake', label: 'Cupcake', hint: 'Soft pastel' },
  { id: 'bumblebee', label: 'Bumblebee', hint: 'Warm yellow' },
  { id: 'emerald', label: 'Emerald', hint: 'Fresh green' },
  { id: 'corporate', label: 'Corporate', hint: 'Clean pro' },
  { id: 'synthwave', label: 'Synthwave', hint: 'Neon night' },
  { id: 'retro', label: 'Retro', hint: 'Vintage warm' },
  { id: 'valentine', label: 'Valentine', hint: 'Rosy' },
  { id: 'aqua', label: 'Aqua', hint: 'Blue calm' },
  { id: 'night', label: 'Night', hint: 'Deep dark' },
  { id: 'winter', label: 'Winter', hint: 'Icy light' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export function getTheme(): ThemeId {
  const v = localStorage.getItem(KEY) as ThemeId | null;
  if (v && THEMES.some((t) => t.id === v)) return v;
  return 'light';
}

export function setTheme(id: ThemeId) {
  localStorage.setItem(KEY, id);
  document.documentElement.setAttribute('data-theme', id);
}

export function initTheme() {
  setTheme(getTheme());
}
