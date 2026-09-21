import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { CardDetailApi, CreateCardRequest, MoveCardRequest, UpdateCardRequest } from './card-api-model';


@Injectable({ providedIn: 'root' })
export class CardApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/cards`;

  getById(id: string): Observable<CardDetailApi> {
    return this.http.get<CardDetailApi>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateCardRequest): Observable<string> {
    return this.http.post<string>(this.baseUrl, request); // backend vraća Guid
  }

  update(id: string, request: UpdateCardRequest): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${id}`, request); // vraća novu Version
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  move(id: string, request: MoveCardRequest): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/${id}/move`, request); // vraća novu Version
  }
}