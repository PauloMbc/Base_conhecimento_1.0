
export enum ThemeMode {
  DARK = 'dark',
  LIGHT = 'light'
}

export interface Manuscript {
  id: string;
  category: string;
  title: string;
  content: string;
  timestamp: string;
  status?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  tags?: string[];
}

export interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
}

export interface Link {
  source: string;
  target: string;
}
