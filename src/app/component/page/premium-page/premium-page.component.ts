import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {UserService} from "../../../service/api/user.service";
import {UserPremium} from "../../../enumeration/user-premium";
import {PremiumLimits} from "../../../dto/premium-limits";
import {Subscription} from "rxjs";
import {UserDetails} from "../../../entity/user-details";
import {NavigationService} from "../../../service/navigation.service";

@Component({
  selector: 'app-premium-page',
  templateUrl: './premium-page.component.html',
  styleUrls: ['./premium-page.component.scss']
})
export class PremiumPageComponent implements OnInit, OnDestroy {

  currentUserDetails: UserDetails | null = null;
  noneUserPremiumLimits: PremiumLimits | null = null;
  ordinaryUserPremiumLimits: PremiumLimits | null = null;
  unlimitedUserPremiumLimits: PremiumLimits | null = null;

  userDetailsSubscription$!: Subscription;
  noneUserPremiumLimitsSubscription$!: Subscription;
  ordinaryUserPremiumLimitsSubscription$!: Subscription;
  unlimitedUserPremiumLimitsSubscription$!: Subscription;

  constructor(public authenticationContextService: AuthenticationContextService,
              private userService: UserService,
              private navigationService: NavigationService) { }

  ngOnInit(): void {
    this.userDetailsSubscription$ = this.authenticationContextService.userDetails$
      .subscribe(userDetails => {
        if (userDetails.user == null) {
          this.navigationService.redirectToMainPage();
        }
        this.currentUserDetails = userDetails;
        this.noneUserPremiumLimitsSubscription$ = this.userService
          .getPremiumLimitsByUserPremium(UserPremium.NONE, userDetails.token)
          .subscribe(premiumLimits => this.noneUserPremiumLimits = premiumLimits);
        this.ordinaryUserPremiumLimitsSubscription$ = this.userService
          .getPremiumLimitsByUserPremium(UserPremium.ORDINARY, userDetails.token)
          .subscribe(premiumLimits => this.ordinaryUserPremiumLimits = premiumLimits);
        this.unlimitedUserPremiumLimitsSubscription$ = this.userService
          .getPremiumLimitsByUserPremium(UserPremium.UNLIMITED, userDetails.token)
          .subscribe(premiumLimits => this.unlimitedUserPremiumLimits = premiumLimits);
      });
  }

  ngOnDestroy(): void {
    if (this.userDetailsSubscription$ != undefined) {
      this.userDetailsSubscription$.unsubscribe();
    }
    if (this.noneUserPremiumLimitsSubscription$ != undefined) {
      this.noneUserPremiumLimitsSubscription$.unsubscribe();
    }
    if (this.ordinaryUserPremiumLimitsSubscription$ != undefined) {
      this.ordinaryUserPremiumLimitsSubscription$.unsubscribe();
    }
    if (this.unlimitedUserPremiumLimitsSubscription$ != undefined) {
      this.unlimitedUserPremiumLimitsSubscription$.unsubscribe();
    }
  }

  isUserPremiumNone(): boolean {
    if (this.currentUserDetails?.user == null) {
      return false;
    } else if (this.currentUserDetails.user.premium == UserPremium.NONE) {
      return true;
    }
    return false;
  }

  isUserPremiumOrdinary(): boolean {
    if (this.currentUserDetails?.user == null) {
      return false;
    } else if (this.currentUserDetails.user.premium == UserPremium.ORDINARY) {
      return true;
    }
    return false;
  }

  isUserPremiumUnlimited(): boolean {
    if (this.currentUserDetails?.user == null) {
      return false;
    } else if (this.currentUserDetails.user.premium == UserPremium.UNLIMITED) {
      return true;
    }
    return false;
  }

  buyOrdinaryPremium(): void {
    const user = this.currentUserDetails?.user;
    const token = this.currentUserDetails?.token;
    if (user != null && token != null) {
      this.userService.updateUserPremiumById(user.id, UserPremium.ORDINARY, token)
        .subscribe(authenticationResponse => {
          this.authenticationContextService.login(authenticationResponse);
          window.location.href = 'https://pay.fondy.eu/s/zK7KgqGDs46UG1b';
        });
    }
  }
}
