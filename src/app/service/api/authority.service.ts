import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorService} from "../error.service";
import {NetworkService} from "../network.service";
import {catchError, Observable, throwError} from "rxjs";
import {UserPermissions} from "../../dto/user-permissions";

@Injectable({
  providedIn: 'root'
})
export class AuthorityService {

  constructor(private http: HttpClient,
              private errorService: ErrorService,
              private networkService: NetworkService) { }

  isUserHasAdminAuthority(userId: string, token: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.networkService.getAddress()}/api/authorities/get/${userId}/is-admin`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  getUserPermissions(userId: string, token: string): Observable<UserPermissions> {
    return this.http.get<UserPermissions>(
      `${this.networkService.getAddress()}/api/authorities/get/${userId}/permissions`,
      { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  addAdminAuthorityToUser(userId: string, token: string): Observable<any> {
    return this.http.post<any>(
      `${this.networkService.getAddress()}/api/authorities/add/authority-to-user/admin/${userId}`,
      {}, { headers: { Authorization: token }})
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  private errorHandle(error: HttpErrorResponse): Observable<never> {
    this.errorService.handle(error);
    return throwError(() => error.message);
  }
}
