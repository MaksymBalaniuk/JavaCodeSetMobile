import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorService} from "../error.service";
import {NetworkService} from "../network.service";
import {catchError, Observable, throwError} from "rxjs";
import {ShareEntity} from "../../entity/share-entity";

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor(private http: HttpClient,
              private errorService: ErrorService,
              private networkService: NetworkService) { }

  createShare(shareEntity: ShareEntity, token: string): Observable<ShareEntity> {
    return this.http.post<ShareEntity>(
      `${this.networkService.getAddress()}/api/shares/create`, shareEntity,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllSharesToUserId(userId: string, token: string): Observable<Array<ShareEntity>> {
    return this.http.get<Array<ShareEntity>>(
      `${this.networkService.getAddress()}/api/shares/get-all/to-user/${userId}`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllSharesFromUserId(userId: string, token: string): Observable<Array<ShareEntity>> {
    return this.http.get<Array<ShareEntity>>(
      `${this.networkService.getAddress()}/api/shares/get-all/from-user/${userId}`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllSharesOfCodeBlockId(codeBlockId: string, token: string): Observable<Array<ShareEntity>> {
    return this.http.get<Array<ShareEntity>>(
      `${this.networkService.getAddress()}/api/shares/get-all/by-block-id/${codeBlockId}`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  deleteShareById(shareId: string, token: string): Observable<any> {
    return this.http.delete<any>(
      `${this.networkService.getAddress()}/api/shares/delete/${shareId}`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  private errorHandle(error: HttpErrorResponse): Observable<never> {
    this.errorService.handle(error);
    return throwError(() => error.message);
  }
}
