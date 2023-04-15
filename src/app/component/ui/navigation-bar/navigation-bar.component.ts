import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModalService} from "../../../service/modal.service";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {Subscription} from "rxjs";
import {UserPremium} from "../../../enumeration/user-premium";
import {NavigationService} from "../../../service/navigation.service";
import {CurrentPage} from "../../../enumeration/current-page";

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit, OnDestroy {

  username!: string;
  userPremium = false;
  currentPage: CurrentPage = CurrentPage.MAIN;

  userDetailsSubscription$!: Subscription;
  currentPageSubscription$!: Subscription;

  constructor(public modalService: ModalService,
              public authenticationContextService: AuthenticationContextService,
              private navigationService: NavigationService) { }

  ngOnInit(): void {
    this.userDetailsSubscription$ = this.authenticationContextService.userDetails$.subscribe(userDetails => {
      if (userDetails.user == null) {
        this.username = '';
      } else {
        this.username = userDetails.user.username;
        this.userPremium = userDetails.user.premium != UserPremium.NONE;
      }
    });
    this.currentPageSubscription$ = this.navigationService.currentPage$
      .subscribe(page => this.currentPage = page)
  }

  ngOnDestroy(): void {
    if (this.userDetailsSubscription$ != undefined) {
      this.userDetailsSubscription$.unsubscribe();
    }
  }

  isMainPageCurrent(): boolean {
    return this.currentPage == CurrentPage.MAIN;
  }

  isCompilerPageCurrent(): boolean {
    return this.currentPage == CurrentPage.COMPILER;
  }

  isPremiumPageCurrent(): boolean {
    return this.currentPage == CurrentPage.PREMIUM;
  }

  isProfilePageCurrent(): boolean {
    return this.currentPage == CurrentPage.PROFILE;
  }

  redirectToMainPage(): void {
    this.navigationService.redirectToMainPage();
  }

  redirectToCompilerPage(): void {
    this.navigationService.redirectToCompilerPage();
  }

  redirectToPremiumPage(): void {
    this.navigationService.redirectToPremiumPage();
  }

  redirectToProfilePage(): void {
    this.navigationService.redirectToProfilePage();
  }
}
