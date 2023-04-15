import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserEntity} from "../../../entity/user-entity";
import {Subscription} from "rxjs";
import {UserPremium} from "../../../enumeration/user-premium";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {UserDetails} from "../../../entity/user-details";
import {UserPermissions} from "../../../dto/user-permissions";
import {UserService} from "../../../service/api/user.service";
import {AuthorityService} from "../../../service/api/authority.service";
import {ModalService} from "../../../service/modal.service";

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent implements OnInit, OnDestroy {

  @Input() user!: UserEntity | null;
  @Input() marginTop: string = '0px';
  currentUserDetails!: UserDetails;
  currentUserPermissions!: UserPermissions;
  isUserAdmin = false;

  getAuthenticatedUserSubscription$!: Subscription;
  currentUserDetailsSubscription$!: Subscription;
  currentUserPermissionsSubscription$!: Subscription;
  isUserHasAdminAuthoritySubscription$!: Subscription;
  activateUserByIdSubscription$!: Subscription;
  banUserByIdSubscription$!: Subscription;
  addAdminAuthorityToUserSubscription$!: Subscription;

  constructor(private authenticationContextService: AuthenticationContextService,
              private userService: UserService,
              private authorityService: AuthorityService,
              public modalService: ModalService) { }

  ngOnInit(): void {
    this.currentUserDetailsSubscription$ = this.authenticationContextService.userDetails$
      .subscribe(userDetails => {
        this.currentUserDetails = userDetails;
        if (this.user?.id == userDetails.user?.id) {
          this.getAuthenticatedUserSubscription$ = this.userService.getAuthenticatedUser(userDetails.token)
            .subscribe(userEntity => this.user = userEntity);
        }
        this.updateUserRole();
      });
    this.currentUserPermissionsSubscription$ = this.authenticationContextService.userPermissions$
      .subscribe(userPermissions => this.currentUserPermissions = userPermissions);
  }

  ngOnDestroy(): void {
    if (this.currentUserDetailsSubscription$ != undefined) {
      this.currentUserDetailsSubscription$.unsubscribe();
    }
    if (this.currentUserDetailsSubscription$ != undefined) {
      this.currentUserDetailsSubscription$.unsubscribe();
    }
    if (this.getAuthenticatedUserSubscription$ != undefined) {
      this.getAuthenticatedUserSubscription$.unsubscribe();
    }
    if (this.isUserHasAdminAuthoritySubscription$ != undefined) {
      this.isUserHasAdminAuthoritySubscription$.unsubscribe();
    }
    if (this.activateUserByIdSubscription$ != undefined) {
      this.activateUserByIdSubscription$.unsubscribe();
    }
    if (this.banUserByIdSubscription$ != undefined) {
      this.banUserByIdSubscription$.unsubscribe();
    }
    if (this.addAdminAuthorityToUserSubscription$ != undefined) {
      this.addAdminAuthorityToUserSubscription$.unsubscribe();
    }
  }

  getRole(): string {
    return this.isUserAdmin ? 'administrator' : 'user';
  }

  getUserStatus(): string {
    if (this.user != null) {
      return this.user.status.toLowerCase();
    }
    return '';
  }

  getUserPremium(): string {
    if (this.user != null) {
      if (this.user.premium == UserPremium.NONE) {
        return 'no';
      } else if (this.user.premium == UserPremium.ORDINARY) {
        return 'regular';
      } else if (this.user.premium == UserPremium.UNLIMITED) {
        return 'unlimited';
      }
    }
    return '';
  }

  getUserCreated(): number {
    if (this.user != null) {
      return this.user.created;
    }
    return 0;
  }

  isProfileActionsAvailable(): boolean {
    return this.currentUserDetails != null &&
      this.currentUserDetails.user != null &&
      this.user != null &&
      this.currentUserDetails.user.id != this.user.id;
  }

  isChangeActionAvailable(): boolean {
    return this.currentUserDetails != null &&
      this.currentUserDetails.user != null &&
      this.user != null &&
      this.currentUserDetails.user.id == this.user.id;
  }

  isBanActionAvailable(): boolean {
    return this.currentUserPermissions.userBanPermission;
  }

  updateUserRole(): void {
    const currentUserDetails = this.currentUserDetails;
    if (this.user != null) {
      if (this.isUserHasAdminAuthoritySubscription$ != undefined) {
        this.isUserHasAdminAuthoritySubscription$.unsubscribe();
      }

      this.isUserHasAdminAuthoritySubscription$ = this.authorityService
        .isUserHasAdminAuthority(this.user.id, currentUserDetails.token)
        .subscribe(booleanValue => this.isUserAdmin = booleanValue);
    }
  }

  changeProfile(): void {
    this.modalService.showUpdateProfileForm();
  }

  activateUser(): void {
    const currentUserDetails = this.currentUserDetails;
    if (this.user != null) {
      if (this.activateUserByIdSubscription$ != undefined) {
        this.activateUserByIdSubscription$.unsubscribe();
      }

      this.activateUserByIdSubscription$ = this.userService
        .activateUserById(this.user.id, currentUserDetails.token)
        .subscribe(userEntity => this.user = userEntity);
    }
  }

  banUser(): void {
    const currentUserDetails = this.currentUserDetails;
    if (this.user != null) {
      if (this.banUserByIdSubscription$ != undefined) {
        this.banUserByIdSubscription$.unsubscribe();
      }

      this.banUserByIdSubscription$ = this.userService
        .banUserById(this.user.id, currentUserDetails.token)
        .subscribe(userEntity => this.user = userEntity);
    }
  }

  makeUserAdmin(): void {
    const currentUserDetails = this.currentUserDetails;
    if (this.user != null) {
      if (this.addAdminAuthorityToUserSubscription$ != undefined) {
        this.addAdminAuthorityToUserSubscription$.unsubscribe();
      }

      this.addAdminAuthorityToUserSubscription$ = this.authorityService
        .addAdminAuthorityToUser(this.user.id, currentUserDetails.token)
        .subscribe(() => this.updateUserRole());
    }
  }
}
