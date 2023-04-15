import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorService} from "../error.service";
import {NetworkService} from "../network.service";
import {CodeBlockEntity} from "../../entity/code-block-entity";
import {catchError, Observable, throwError} from "rxjs";
import {FilterCodeBlock} from "../../dto/filter-code-block";
import {EstimateType} from "../../enumeration/estimate-type";

@Injectable({
  providedIn: 'root'
})
export class CodeBlockService {

  constructor(private http: HttpClient,
              private errorService: ErrorService,
              private networkService: NetworkService) { }

  createCodeBlock(codeBlockEntity: CodeBlockEntity, token: string): Observable<CodeBlockEntity> {
    return this.http.post<CodeBlockEntity>(
      `${this.networkService.getAddress()}/api/blocks/create`, codeBlockEntity,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  updateCodeBlock(codeBlockEntity: CodeBlockEntity, token: string): Observable<CodeBlockEntity> {
    return this.http.patch<CodeBlockEntity>(
      `${this.networkService.getAddress()}/api/blocks/update`, codeBlockEntity,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  deleteCodeBlock(codeBlockId: string, token: string): Observable<any> {
    return this.http.delete<any>(
      `${this.networkService.getAddress()}/api/blocks/delete/${codeBlockId}`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllCodeBlocksByUserId(userId: string, token: string): Observable<Array<CodeBlockEntity>> {
    return this.http.get<Array<CodeBlockEntity>>(
      `${this.networkService.getAddress()}/api/blocks/get-all/by-user-id/${userId}`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllFilteredCodeBlocks(filterCodeBlock: FilterCodeBlock): Observable<Array<CodeBlockEntity>> {
    return this.http.post<Array<CodeBlockEntity>>(
      `${this.networkService.getAddress()}/api/blocks/get-all/filtered`, filterCodeBlock)
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllFilteredCodeBlocksByUserId(
    userId: string, token: string, filterCodeBlock: FilterCodeBlock): Observable<Array<CodeBlockEntity>> {
    return this.http.post<Array<CodeBlockEntity>>(
      `${this.networkService.getAddress()}/api/blocks/get-all/by-user-id/${userId}/filtered`,
      filterCodeBlock, { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllFilteredCodeBlocksByUserIdAndEstimateType(
    userId: string, token: string, estimateType: EstimateType, filterCodeBlock: FilterCodeBlock): Observable<Array<CodeBlockEntity>> {
    return this.http.post<Array<CodeBlockEntity>>(
      `${this.networkService.getAddress()}/api/blocks/get-all/by-user-id-and-estimate-type/${userId}/${estimateType}/filtered`,
      filterCodeBlock, { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getAllFilteredCodeBlocksSharedFromUserIdToUserId(
    fromUserId: string, toUserId: string, token: string, filterCodeBlock: FilterCodeBlock): Observable<Array<CodeBlockEntity>> {
    return this.http.post<Array<CodeBlockEntity>>(
      `${this.networkService.getAddress()}/api/blocks/get-all/shared-from-user-id-to-user-id/${fromUserId}/${toUserId}/filtered`,
      filterCodeBlock, { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  private errorHandle(error: HttpErrorResponse): Observable<never> {
    this.errorService.handle(error);
    return throwError(() => error.message);
  }
}
