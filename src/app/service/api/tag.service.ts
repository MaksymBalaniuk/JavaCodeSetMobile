import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorService} from "../error.service";
import {NetworkService} from "../network.service";
import {TagEntity} from "../../entity/tag-entity";
import {catchError, Observable, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private http: HttpClient,
              private errorService: ErrorService,
              private networkService: NetworkService) { }

  createTag(tagEntity: TagEntity, token: string): Observable<TagEntity> {
    return this.http.post<TagEntity>(
      `${this.networkService.getAddress()}/api/tags/create`, tagEntity,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  addTagToCodeBlock(tagId: string, codeBlockId: string, token: string): Observable<any> {
    return this.http.post<any>(
      `${this.networkService.getAddress()}/api/tags/add/tag-to-block/${tagId}/${codeBlockId}`,
      {}, { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  deleteTagFromCodeBlock(tagId: string, codeBlockId: string, token: string): Observable<any> {
    return this.http.delete<any>(
      `${this.networkService.getAddress()}/api/tags/delete/tag-from-block/${tagId}/${codeBlockId}`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllTagsByCodeBlockId(codeBlockId: string): Observable<Array<TagEntity>> {
    return this.http.get<Array<TagEntity>>(
      `${this.networkService.getAddress()}/api/tags/get-all/by-block-id/${codeBlockId}`)
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  private errorHandle(error: HttpErrorResponse): Observable<never> {
    this.errorService.handle(error);
    return throwError(() => error.message);
  }
}
