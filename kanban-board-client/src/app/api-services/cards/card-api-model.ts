export interface CardApi {
  id: string;
  title: string;
  description: string | null;
  order: number;
  version: number;
  columnId: string;
}

// GetById vraća i ColumnTitle, ostalo je isto kao CardApi
export interface CardDetailApi extends CardApi {
  columnTitle: string;
}

export interface CreateCardRequest {
  title: string;
  description: string | null;
  columnId: string;
}

export interface UpdateCardRequest {
  title: string;
  description: string | null;
  version: number;
}

export interface MoveCardRequest {
  targetColumnId: string;
  targetIndex: number;
  version: number;
}