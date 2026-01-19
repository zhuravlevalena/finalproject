export interface CardVersion {
  id: number;
  cardId: number;
  version: number;
  canvasData: Record<string, unknown>;
  title?: string;
  description?: string;
  changeDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VersionComparison {
  version1: CardVersion;
  version2: CardVersion;
  differences: Array<{
    key: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
}
