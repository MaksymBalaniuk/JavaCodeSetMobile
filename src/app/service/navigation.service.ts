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
    } else if (url == '/compiler') {
      this.currentPage$.next(CurrentPage.COMPILER);
    } else if (url == '/premium') {
      this.currentPage$.next(CurrentPage.PREMIUM);
    } else if (url == '/code-block') {
      this.currentPage$.next(CurrentPage.CODE_BLOCK);
    } else if (url == '/profile') {
      this.currentPage$.next(CurrentPage.PROFILE);
    }
  }

  redirectToMainPage(): void {
    this.router.navigateByUrl('').then();
  }

  redirectToCompilerPage(): void {
    this.router.navigateByUrl('compiler').then();
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
}
