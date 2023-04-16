import { Injectable } from '@angular/core';
import {NavigationService} from "./navigation.service";

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  isAuthenticationFormVisible = false;
  isRegistrationFormVisible = false;
  isSessionExpiredFormVisible = false;
  isShareFormVisible = false;
  isUpdateProfileFormVisible = false;

  constructor(private navigationService: NavigationService) { }

  showAuthenticationForm(): void {
    this.hideForm();
    this.isAuthenticationFormVisible = true;
    this.navigationService.redirectToModalPage();
  }

  showRegistrationForm(): void {
    this.hideForm();
    this.isRegistrationFormVisible = true;
    this.navigationService.redirectToModalPage();
  }

  showSessionExpiredForm(): void {
    this.hideForm();
    this.isSessionExpiredFormVisible = true;
    this.navigationService.redirectToModalPage();
  }

  showShareForm(): void {
    this.hideForm();
    this.isShareFormVisible = true;
    this.navigationService.redirectToModalPage();
  }

  showUpdateProfileForm(): void {
    this.hideForm();
    this.isUpdateProfileFormVisible = true;
    this.navigationService.redirectToModalPage();
  }

  hideForm(): void {
    this.isAuthenticationFormVisible = false;
    this.isRegistrationFormVisible = false;
    this.isSessionExpiredFormVisible = false;
    this.isShareFormVisible = false;
    this.isUpdateProfileFormVisible = false;
  }

  isAnyFormVisible(): boolean {
    return this.isAuthenticationFormVisible ||
      this.isRegistrationFormVisible ||
      this.isSessionExpiredFormVisible ||
      this.isShareFormVisible ||
      this.isUpdateProfileFormVisible;
  }
}
