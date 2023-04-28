import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject, map, Observable, startWith, Subscription} from "rxjs";
import {UserService} from "../../../service/api/user.service";
import {UserEntity} from "../../../entity/user-entity";
import {ErrorService} from "../../../service/error.service";
import {ModalService} from "../../../service/modal.service";
import {ShareService} from "../../../service/api/share.service";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {ShareEntity} from "../../../entity/share-entity";
import {NavigationService} from "../../../service/navigation.service";

@Component({
  selector: 'app-share-form',
  templateUrl: './share-form.component.html',
  styleUrls: ['./../authentication-form/authentication-form.component.scss']
})
export class ShareFormComponent implements OnInit, OnDestroy {

  @Input() title!: string;
  success = true;
  errorMessage = '';
  loading = false;
  userEntity!: UserEntity;
  toUserShares: Array<UserEntity> = [];
  filteredToUserShares!: Observable<string[]>;
  currentCodeBlockShares: Array<ShareEntity> = [];
  currentCodeBlockToUserShares: Array<UserEntity> = [];

  getUserByUsernameSubscription$!: Subscription;
  createShareSubscription$!: Subscription;
  getAllSharesFromUserIdSubscription$!: Subscription;
  countToUsernameSharesSubscription$!: Subscription;
  getAllSharesOfCodeBlockIdSubscription$!: Subscription;
  countCurrentCodeBlockSharesSubscription$!: Subscription;
  deleteShareByIdSubscription$!: Subscription;
  errorSubscription$!: Subscription;

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(255)
    ])
  });

  constructor(private userService: UserService,
              private shareService: ShareService,
              private dataLoadContextService: DataLoadContextService,
              private modalService: ModalService,
              private errorService: ErrorService,
              private navigationService: NavigationService) { }

  ngOnInit(): void {
    this.updateToUserSharesView();
    this.updateCurrentCodeBlockShares();
  }

  ngOnDestroy(): void {
    if (this.getUserByUsernameSubscription$ != undefined) {
      this.getUserByUsernameSubscription$.unsubscribe();
    }
    if (this.createShareSubscription$ != undefined) {
      this.createShareSubscription$.unsubscribe();
    }
    if (this.getAllSharesFromUserIdSubscription$ != undefined) {
      this.getAllSharesFromUserIdSubscription$.unsubscribe();
    }
    if (this.countToUsernameSharesSubscription$ != undefined) {
      this.countToUsernameSharesSubscription$.unsubscribe();
    }
    if (this.getAllSharesOfCodeBlockIdSubscription$ != undefined) {
      this.getAllSharesOfCodeBlockIdSubscription$.unsubscribe();
    }
    if (this.countCurrentCodeBlockSharesSubscription$ != undefined) {
      this.countCurrentCodeBlockSharesSubscription$.unsubscribe();
    }
    if (this.deleteShareByIdSubscription$ != undefined) {
      this.deleteShareByIdSubscription$.unsubscribe();
    }
    if (this.errorSubscription$ != undefined) {
      this.errorSubscription$.unsubscribe();
    }
  }

  updateToUserSharesView(): void {
    const currentUserDetails = this.dataLoadContextService.userDetails;
    if (currentUserDetails.user != null) {
      if (this.getAllSharesFromUserIdSubscription$ != undefined) {
        this.getAllSharesFromUserIdSubscription$.unsubscribe();
      }

      this.getAllSharesFromUserIdSubscription$ = this.shareService
        .getAllSharesFromUserId(currentUserDetails.user.id, currentUserDetails.token)
        .subscribe(shares => {
          this.fillToUserSharesView(this.getToUserIdShares(shares));
        });
    }
  }

  private initUsernameFilter(): void {
    this.filteredToUserShares = this.username.valueChanges.pipe(
      startWith(''),
      map(username => this.usernameFilter(username || ''))
    );
  }

  private usernameFilter(username: string): string[] {
    const filterValue = username.toLowerCase();
    return this.toUserShares
      .filter(user => user.username.toLowerCase().includes(filterValue))
      .map(user => user.username);
  }

  get username(): FormControl {
    return this.form.controls.username;
  }

  get usernameErrorMessage(): string {
    if (this.form.controls.username.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.form.controls.username.hasError('minlength')) {
      return 'Username must contain at least 5 characters';
    }
    return this.form.controls.username
      .hasError('maxlength') ? 'Username must contain no more than 255 characters' : '';
  }

  successValidation(): boolean {
    return this.usernameErrorMessage == '';
  }

  retryInput(): void {
    this.success = true;
  }

  getToUserIdShares(shares: Array<ShareEntity>): Array<string> {
    let result: Array<string> = new Array<string>();
    if (shares.length == 0) {
      return result;
    }
    shares.forEach(shareEntity => {
      if (!result.includes(shareEntity.toUserId)) {
        result.push(shareEntity.toUserId);
      }
    });
    return result;
  }

  fillToUserSharesView(toUserIdShares: Array<string>): void {
    if (toUserIdShares.length == 0) {
      this.toUserShares = [];
      return;
    }

    let countToUsernameShares = new BehaviorSubject<number>(0);
    const tempArray: Array<UserEntity> = [];

    this.countToUsernameSharesSubscription$ = countToUsernameShares.subscribe(() => {
      if (tempArray.length == toUserIdShares.length) {
        this.toUserShares = tempArray.sort(
          (a, b) => a.username.localeCompare(b.username));
        this.initUsernameFilter();
      }
    });
    toUserIdShares.forEach(toUserId => {
      this.userService.getUserById(toUserId).subscribe(userEntity => {
        tempArray.push(userEntity);
        countToUsernameShares.next(countToUsernameShares.value + 1);
      });
    });
  }

  updateCurrentCodeBlockShares(): void {
    const currentUserDetails = this.dataLoadContextService.userDetails;
    const currentCodeBlock = this.dataLoadContextService.getCurrentCodeBlock();
    if (currentUserDetails != null && currentCodeBlock != null) {
      if (this.getAllSharesOfCodeBlockIdSubscription$ != undefined) {
        this.getAllSharesOfCodeBlockIdSubscription$.unsubscribe();
      }

      this.getAllSharesOfCodeBlockIdSubscription$ = this.shareService
        .getAllSharesOfCodeBlockId(currentCodeBlock.id, currentUserDetails.token)
        .subscribe(shares => {
          this.currentCodeBlockShares = shares.slice();
          this.fillCurrentCodeBlockToUserShares(shares.slice());
        });
    }
  }

  fillCurrentCodeBlockToUserShares(shares: Array<ShareEntity>): void {
    if (shares.length == 0) {
      this.currentCodeBlockToUserShares = [];
      return;
    }

    let countCurrentCodeBlockShares = new BehaviorSubject<number>(0);
    const tempArray: Array<UserEntity> = [];

    this.countCurrentCodeBlockSharesSubscription$ = countCurrentCodeBlockShares.subscribe(() => {
      if (tempArray.length == shares.length) {
        this.currentCodeBlockToUserShares = tempArray.sort(
          (a, b) => a.username.localeCompare(b.username));
      }
    });
    shares.forEach(share => {
      this.userService.getUserById(share.toUserId).subscribe(userEntity => {
        tempArray.push(userEntity);
        countCurrentCodeBlockShares.next(countCurrentCodeBlockShares.value + 1);
      });
    });
  }

  removeShare(toUserEntity: UserEntity): void {
    let removeShareId = '';
    this.currentCodeBlockShares.forEach(share => {
      if (share.toUserId == toUserEntity.id) {
        removeShareId = share.id;
      }
    });

    const currentUserDetails = this.dataLoadContextService.userDetails;
    if (removeShareId != '' && currentUserDetails.user != null) {
      if (this.deleteShareByIdSubscription$ != undefined) {
        this.deleteShareByIdSubscription$.unsubscribe();
      }

      this.deleteShareByIdSubscription$ = this.shareService
        .deleteShareById(removeShareId, currentUserDetails.token)
        .subscribe(() => {
          this.updateToUserSharesView();
          this.updateCurrentCodeBlockShares();
        });
    }
  }

  submit() {
    if (this.successValidation()) {
      this.loading = true;
      this.success = true;
      this.errorMessage = '';
      let createShareProcess = true;

      this.getUserByUsernameSubscription$ = this.userService.getUserByUsername(this.username.value)
        .subscribe(userEntity => {
          this.userEntity = userEntity;
          this.errorService.clear();
        });

      this.errorSubscription$ = this.errorService.error$.subscribe(error => {
        this.loading = false;
        if (error != '') {
          this.errorMessage = error;
          this.success = false;
        } else if (createShareProcess) {
          createShareProcess = false;
          const currentUserDetails = this.dataLoadContextService.userDetails;
          const currentCodeBlock = this.dataLoadContextService.getCurrentCodeBlock();
          if (currentUserDetails.user != null && currentCodeBlock != null) {
            const share: ShareEntity = {
              id: '',
              toUserId: this.userEntity.id,
              fromUserId: currentUserDetails.user.id,
              codeBlockId: currentCodeBlock.id
            }
            this.createShareSubscription$ = this.shareService.createShare(share, currentUserDetails.token)
              .subscribe(() => {
                this.errorService.clear();
                this.updateToUserSharesView();
                this.updateCurrentCodeBlockShares();
              });
          }
        }
      });
    }
  }

  back(): void {
    this.navigationService.redirectToLastLoadedPage();
  }
}
