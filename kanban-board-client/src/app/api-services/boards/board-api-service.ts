import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoardDetailApi, BoardListItemApi, CreateBoardRequest, UpdateBoardRequest } from './board-api.model';
import { PageResultApi } from '../shared/page-result.model';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class BoardApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/boards`;

  getAll(page = 1, pageSize = 10, search?: string): Observable<PageResultApi<BoardListItemApi>> {
    let url = `${this.baseUrl}?currentPage=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<PageResultApi<BoardListItemApi>>(url);
  }

  getById(id: string): Observable<BoardDetailApi> {
    return this.http.get<BoardDetailApi>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateBoardRequest): Observable<string> {
    return this.http.post<string>(this.baseUrl, request); // vraća Guid
  }

  update(id: string, request: UpdateBoardRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request); // vraća Unit
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}