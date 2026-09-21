import { ColumnApi } from "../columns/column-api-model";


export interface BoardListItemApi {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
}

export interface BoardDetailApi {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  columns: ColumnApi[];
}

export interface CreateBoardRequest {
  title: string;
  ownerId: string;
}

export interface UpdateBoardRequest {
  title: string; // Id ide kroz rutu
}