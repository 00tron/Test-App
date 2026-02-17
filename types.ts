
export interface Session {
  id: string;
  timestamp: number;
  count: number;
  mantra: string;
}

export interface MantraStats {
  totalCount: number;
  targetCount: number;
  currentMantra: string;
  history: Session[];
}

export interface Inspiration {
  quote: string;
  meaning: string;
  loading: boolean;
}
