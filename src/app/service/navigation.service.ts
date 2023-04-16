import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {CurrentPage} from "../enumeration/current-page";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  currentPage$ = new BehaviorSubject<CurrentPage>(CurrentPage.MAIN);

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setCurrentPage(event.url);
      }
    });
  }

  setCurrentPage(url: string) {
    if (url == '/') {
      this.currentPage$.next(CurrentPage.MAIN);
    } else if (url == '/premium') {
      this.currentPage$.next(CurrentPage.PREMIUM);
    } else if (url == '/code-block') {
      this.currentPage$.next(CurrentPage.CODE_BLOCK);
    } else if (url == '/profile') {
      this.currentPage$.next(CurrentPage.PROFILE);
    }
  }

  redirectToLastLoadedPage(): void {
    if (this.currentPage$.value == CurrentPage.MAIN) {
      this.redirectToMainPage();
    } else if (this.currentPage$.value == CurrentPage.PREMIUM) {
      this.redirectToPremiumPage();
    } else if (this.currentPage$.value == CurrentPage.CODE_BLOCK) {
      this.redirectToCodeBlockPage();
    } else if (this.currentPage$.value == CurrentPage.PROFILE) {
      this.redirectToProfilePage();
    }
  }

  redirectToMainPage(): void {
    this.router.navigateByUrl('').then();
  }

  redirectToPremiumPage(): void {
    this.router.navigateByUrl('premium').then();
  }

  redirectToCodeBlockPage(): void {
    this.router.navigateByUrl('code-block').then();
  }

  redirectToProfilePage(): void {
    this.router.navigateByUrl('profile').then();
  }

  redirectToModalPage(): void {
    this.router.navigateByUrl('modal').then();
  }
}
