import { Injectable } from '@angular/core';
import {UserService} from "./api/user.service";
import {AuthorityService} from "./api/authority.service";
import {BehaviorSubject, Subscription} from "rxjs";
import {UserDetails} from "../entity/user-details";
import {PremiumLimits} from "../dto/premium-limits";
import {UserPermissions} from "../dto/user-permissions";
import {AuthenticationResponse} from "../dto/authentication-response";
import {LocalStorageService} from "./local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationContextService {

  isAuthorized$ = new BehaviorSubject<boolean>(false);

  getUserSubscription$!: Subscription;
  getUserPremiumLimitsSubscription$!: Subscription;
  getUserPermissionsSubscription$!: Subscription;

  userDetails$ = new BehaviorSubject<UserDetails>({
    user: null,
    token: ''
  });

  userPremiumLimits$ = new BehaviorSubject<PremiumLimits>({
    codeBlocksLimit: 0,
    codeBlockContentLimit: 0,
    compilerContentLimit: 0
  });

  userPermissions$ = new BehaviorSubject<UserPermissions>({
    publicStorageManagementPermission: false,
    viewProfilePermission: false,
    userBanPermission: false,
    contentHidePermission: false
  });

  constructor(private userService: UserService,
              private authorityService: AuthorityService,
              private localStorageService: LocalStorageService) {
    if (localStorageService.containsAuthorizationData()) {
      this.tryGetLocalAuthorizationData();
    }
  }

  tryGetLocalAuthorizationData(): void {
    const userDetails = this.localStorageService.getUserDetails();
    const userPremiumLimits = this.localStorageService.getPremiumLimits();
    const userPermissions = this.localStorageService.getUserPermissions();
    if (userDetails != null && userPremiumLimits != null && userPermissions != null) {
      this.userDetails$.next(userDetails);
      this.userPremiumLimits$.next(userPremiumLimits);
      this.userPermissions$.next(userPermissions);
      this.isAuthorized$.next(true);
    }
  }

  login(authenticationResponse: AuthenticationResponse): void {
    if (this.getUserSubscription$ != undefined) {
      this.getUserSubscription$.unsubscribe();
    }
    this.getUserSubscription$ = this.userService.getUserById(authenticationResponse.id)
      .subscribe(user => {
        const bearerToken = 'Bearer_' + authenticationResponse.token;
        const userDetails: UserDetails = {
          user: user,
          token: bearerToken
        };
        this.userDetails$.next(userDetails);
        this.updatePremiumLimits(user.id, bearerToken);
        this.updateUserPermissions(user.id, bearerToken);
        this.isAuthorized$.next(true);
        this.localStorageService.setUserDetails(userDetails);
        this.localStorageService.setAuthorized();
      });
  }

  logout(): void {
    this.userDetails$.next({
      user: null,
      token: ''
    });
    this.userPremiumLimits$.next({
      codeBlocksLimit: 0,
      codeBlockContentLimit: 0,
      compilerContentLimit: 0
    });
    this.userPermissions$.next({
      publicStorageManagementPermission: false,
      viewProfilePermission: false,
      userBanPermission: false,
      contentHidePermission: false
    });
    this.isAuthorized$.next(false);
    this.localStorageService.removeAuthorizationData();
  }

  updatePremiumLimits(userId: string, token: string): void {
    if (this.getUserPremiumLimitsSubscription$ != undefined) {
      this.getUserPremiumLimitsSubscription$.unsubscribe();
    }
    this.getUserPremiumLimitsSubscription$ = this.userService.getUserPremiumLimits(userId, token)
      .subscribe(premiumLimits => {
        this.userPremiumLimits$.next(premiumLimits);
        this.localStorageService.setPremiumLimits(premiumLimits);
      });
  }

  updateUserPermissions(userId: string, token: string): void {
    if (this.getUserPermissionsSubscription$ != undefined) {
      this.getUserPermissionsSubscription$.unsubscribe();
    }
    this.getUserPremiumLimitsSubscription$ = this.authorityService.getUserPermissions(userId, token)
      .subscribe(userPermissions => {
        this.userPermissions$.next(userPermissions);
        this.localStorageService.setUserPermissions(userPermissions);
      });
  }
}
