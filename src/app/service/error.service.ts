import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ErrorType} from "../type/error-type";
import { ErrorResponse } from '../dto/error-response';
import {ModalService} from "./modal.service";

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private modalService: ModalService) { }

  error$ = new Subject<string>();

  handle(error: HttpErrorResponse): void {
    if (this.determineErrorType(error.error)) {
      if (error.error.message == 'JWT is expired' ||
        error.error.message == 'JWT is invalid, user is locked' ||
        error.error.message == 'JWT is invalid, user access rights are incorrect') {
        this.modalService.hideForm();
        this.modalService.showSessionExpiredForm();
      } else {
        this.error$.next(error.error.message);
      }
    } else {
      this.error$.next('Unknown error');
    }
  }

  clear(): void {
    this.error$.next('');
  }

  determineErrorType(type: ErrorType): type is ErrorResponse {
    return !!(type as ErrorResponse).message;
  }
}
