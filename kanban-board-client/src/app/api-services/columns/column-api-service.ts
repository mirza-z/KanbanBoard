import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


import { PageResultApi } from '../shared/page-result.model';
import { environment } from '../../../environments/environments';
import { ColumnDetailApi, ColumnListItemApi, CreateColumnRequest, UpdateColumnRequest } from './column-api-model';

@Injectable({ providedIn: 'root' })
export class ColumnApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/columns`;

  getAll(page = 1, pageSize = 10, boardId?: string, search?: string): Observable<PageResultApi<ColumnListItemApi>> {
    let url = `${this.baseUrl}?currentPage=${page}&pageSize=${pageSize}`;
    if (boardId) url += `&boardId=${boardId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<PageResultApi<ColumnListItemApi>>(url);
  }

  getById(id: string): Observable<ColumnDetailApi> {
    return this.http.get<ColumnDetailApi>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateColumnRequest): Observable<string> {
    return this.http.post<string>(this.baseUrl, request); // backend vraća Guid
  }

  update(id: string, request: UpdateColumnRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request); // handler vraća Unit
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}