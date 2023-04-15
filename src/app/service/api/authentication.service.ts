import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorService} from "../error.service";
import {NetworkService} from "../network.service";
import {LoginRequest} from "../../dto/login-request";
import {catchError, Observable, throwError} from "rxjs";
import {AuthenticationResponse} from "../../dto/authentication-response";
import {RegisterRequest} from "../../dto/register-request";
import {RegisterResponse} from "../../dto/register-response";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient,
              private errorService: ErrorService,
              private networkService: NetworkService) { }

  login(loginRequest: LoginRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.networkService.getAddress()}/api/auth/login`, loginRequest)
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.networkService.getAddress()}/api/auth/register`, registerRequest)
      .pipe(
        catchError(error => this.errorHandle(error))
      );
  }

  private errorHandle(error: HttpErrorResponse): Observable<never> {
    this.errorService.handle(error);
    return throwError(() => error.message);
  }
}
