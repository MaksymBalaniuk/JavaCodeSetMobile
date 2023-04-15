import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserEntity} from "../../../entity/user-entity";
import {Subscription} from "rxjs";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {NavigationService} from "../../../service/navigation.service";
import {UserService} from "../../../service/api/user.service";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit, OnDestroy {

  currentUser!: UserEntity | null;
  currentToken!: string;
  filterQuery = '';
  users: Array<UserEntity> = [];

  currentUserSubscription$!: Subscription;
  searchUsersByUsernameSubscription$!: Subscription;

  constructor(private authenticationContextService: AuthenticationContextService,
              private navigationService: NavigationService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.currentUserSubscription$ = this.authenticationContextService.userDetails$
      .subscribe(userDetails => {
        if (userDetails.user == null) {
          this.navigationService.redirectToMainPage();
        }
        this.currentUser = userDetails.user;
        this.currentToken = userDetails.token;
      });
  }

  ngOnDestroy(): void {
    if (this.currentUserSubscription$ != undefined) {
      this.currentUserSubscription$.unsubscribe();
    }
    if (this.searchUsersByUsernameSubscription$ != undefined) {
      this.searchUsersByUsernameSubscription$.unsubscribe();
    }
  }

  searchProfile(): void {
    const currentUser = this.currentUser;
    if (this.filterQuery != '' && currentUser != null) {
      if (this.searchUsersByUsernameSubscription$ != undefined) {
        this.searchUsersByUsernameSubscription$.unsubscribe();
      }

      this.searchUsersByUsernameSubscription$ = this.userService.searchUsersByUsername(this.filterQuery)
        .subscribe(users => this.users = users.filter(user => user.id != currentUser.id));
    }
  }
}
