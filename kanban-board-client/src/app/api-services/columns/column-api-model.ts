import { CardApi } from "../cards/card-api-model";


export interface ColumnListItemApi {
  id: string;
  title: string;
  order: number;
  boardId: string;
  boardTitle: string;
}

export interface ColumnDetailApi {
  id: string;
  title: string;
  order: number;
  boardId: string;
  boardTitle: string;
  cards: CardApi[];
}

// Ugnježđeno unutar BoardDetailApi.columns — nema boardId/boardTitle, ionako se zna kontekst
export interface ColumnApi {
  id: string;
  title: string;
  order: number;
  cards: CardApi[];
}

export interface CreateColumnRequest {
  title: string;
  boardId: string;
}

export interface UpdateColumnRequest {
  title: string; // Id ide kroz rutu, ne u body (JsonIgnore na backendu)
}