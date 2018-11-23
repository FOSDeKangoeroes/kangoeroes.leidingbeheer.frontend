import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Leiding } from '../leiding/shared/leiding.model';

import { Observable } from 'rxjs';
import { Role } from '../core/auth/role.model';
import { Tak } from '../tak/shared/tak.model';


@Injectable()
export class DataService {

  private baseUrl = 'http://localhost:4200'

  private _takUrl = `${this.baseUrl}/api/tak`;
  private _leidingUrl = `${this.baseUrl}/api/leiding`;

  constructor(private httpClient: HttpClient) { }


  getTakken(
  sortBy: string = 'volgorde',
  sortOrder: string = 'asc',
  query: string = '',
  pageSize = 25,
  pageNumber = 1): Observable<HttpResponse<Tak[]>> {
    return this
    .httpClient
    .get<Tak[]>(`${this._takUrl}?sortBy=${sortBy}&sortOrder=${sortOrder}&query=${query}&pageSize=${pageSize}&pageNumber=${pageNumber}`,
    {observe: 'response'});

  }

  getTak(id): Observable<Tak> {
    return this.httpClient.get<Tak>(`${this._takUrl}/${id}`);
  }

  getLeidingForTak(id): Observable<Leiding[]> {
    return this.httpClient.get<Leiding[]>(`${this._takUrl}/${id}/leiding`);
  }

  getLeidingForId(id): Observable<Leiding> {
    return this.httpClient.get<Leiding>(`${this._leidingUrl}/${id}`);
  }

  updateTak(tak: Tak, takId: number): Observable<Tak> {
    const takJson = tak;
   return this.httpClient.put<Tak>(`${this._takUrl}/${takId}`, takJson);

  }

  deleteTak(id: number): Observable<boolean> {
    return this.httpClient.delete<Tak>(`${this._takUrl}/${id}`).map(res => {
      if (res) {
        return true;
      }
      return false;
    });

  }

  addTak(tak): Observable<Tak> {
    return this.httpClient.post<Tak>(this._takUrl, tak);
  }

  addLeiding(leiding): Observable<Leiding> {
    return this.httpClient.post<Leiding>(this._leidingUrl, leiding);
  }

  getLeiding(sortBy = '',
            sortOrder = 'asc',
            query = ' ',
            takId: number = 0,
            pageNumber = 0,
            pageSize = 25 ): Observable<HttpResponse<Leiding[]>> {
    return this.httpClient
    .get<Leiding[]>
    // tslint:disable-next-line:max-line-length
    (`${this._leidingUrl}?sortBy=${sortBy}&sortOrder=${sortOrder}&query=${query}&tak=${takId}&pageSize=${pageSize}&pageNumber=${pageNumber}`,
     {observe: 'response'});
  }

  updateLeiding(leiding, leidingId): Observable<Leiding> {
    return this.httpClient.
    put<Leiding>(`${this._leidingUrl}/${leidingId}`, leiding);
  }

  changeTakForLeiding(leidingId, newTakId: number): Observable<Leiding> {
    return this.httpClient.put<Leiding>(`${this._leidingUrl}/${leidingId}/tak`, {newTakId: newTakId});
  }

  createUser(leidingId): Observable<Leiding> {
    return this.httpClient.post<Leiding>(`${this._leidingUrl}/${leidingId}/user`, null);
  }

  getRolesForUser(id) {
    return this.httpClient.get<Role[]>(`${this._leidingUrl}/${id}/roles`);
  }

  removeRoleForUser(leidingId, roleId): Observable<HttpResponse<any>> {
  return  this.httpClient.delete<HttpResponse<any>>(`${this._leidingUrl}/${leidingId}/roles/${roleId}`);
  }

  addRoleForUser(leidingId, roleId): Observable<HttpResponse<any>> {
    return this.httpClient.patch<HttpResponse<any>>(`${this._leidingUrl}/${leidingId}/roles/${roleId}`, null);
  }
  }
