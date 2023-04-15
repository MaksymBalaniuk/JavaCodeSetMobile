import {Component, OnDestroy, OnInit} from '@angular/core';
import {PremiumLimits} from "../../../dto/premium-limits";
import {BehaviorSubject, Subscription} from "rxjs";
import {CodeBlockEntity} from "../../../entity/code-block-entity";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {LoadContext} from "../../../enumeration/load-context";
import {NavigationService} from "../../../service/navigation.service";
import {ShareEntity} from "../../../entity/share-entity";
import {UserService} from "../../../service/api/user.service";
import {UserEntity} from "../../../entity/user-entity";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {

  selectedTabIndex = 0;
  addCodeBlockButtonVisible = false;
  currentUserPremiumLimits!: PremiumLimits;
  codeBlocks: Array<CodeBlockEntity> = [];
  fromUserShares: Array<UserEntity> = [];

  currentUserPremiumLimitsSubscription$!: Subscription;
  codeBlocksSubscription$!: Subscription;
  sharesSubscription$!: Subscription;
  countFromUsernameSharesSubscription$!: Subscription;

  constructor(public authenticationContextService: AuthenticationContextService,
              public dataLoadContextService: DataLoadContextService,
              private navigationService: NavigationService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.codeBlocksSubscription$ = this.dataLoadContextService.codeBlocks$
      .subscribe(codeBlocks => this.codeBlocks = codeBlocks);
    this.sharesSubscription$ = this.dataLoadContextService.shares$
      .subscribe(shares => this.fillFromUserSharesView(this.getFromUserIdShares(shares)));
    this.currentUserPremiumLimitsSubscription$ =
      this.authenticationContextService.userPremiumLimits$.subscribe(premiumLimits => {
        this.currentUserPremiumLimits = premiumLimits;
        if (this.dataLoadContextService.getLoadContext() == LoadContext.CODE_BLOCK_VIEW ||
          this.dataLoadContextService.getLoadContext() == LoadContext.CODE_BLOCK_EDIT) {
          this.setSelectedTabByLoadContext(LoadContext.PUBLIC_CODE_BLOCKS);
          this.loadPubicContext();
        } else {
          this.setSelectedTabByLoadContext(this.dataLoadContextService.getLoadContext());
          this.dataLoadContextService.loadLastFilteredCodeBlocksContext();
        }
      });
    if (this.dataLoadContextService.getLoadContext() == LoadContext.PRIVATE_CODE_BLOCKS) {
      this.addCodeBlockButtonVisible = this.isAddCodeBlockButtonAvailable();
    }
  }

  ngOnDestroy(): void {
    if (this.currentUserPremiumLimitsSubscription$ != undefined) {
      this.currentUserPremiumLimitsSubscription$.unsubscribe();
    }
    if (this.codeBlocksSubscription$ != undefined) {
      this.codeBlocksSubscription$.unsubscribe();
    }
    if (this.sharesSubscription$ != undefined) {
      this.sharesSubscription$.unsubscribe();
    }
    if (this.countFromUsernameSharesSubscription$ != undefined) {
      this.countFromUsernameSharesSubscription$.unsubscribe();
    }
  }

  setSelectedTabByLoadContext(loadContext: LoadContext) {
    if (loadContext == LoadContext.PUBLIC_CODE_BLOCKS) {
      this.selectedTabIndex = 0;
    } else if (loadContext == LoadContext.PRIVATE_CODE_BLOCKS) {
      this.selectedTabIndex = 1;
    } else if (loadContext == LoadContext.FAVORITES_CODE_BLOCKS) {
      this.selectedTabIndex = 2;
    } else if (loadContext == LoadContext.SHARED_CODE_BLOCKS) {
      this.selectedTabIndex = 3;
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    if (tabChangeEvent.index == 0) {
      this.loadPubicContext();
    } else if (tabChangeEvent.index == 1) {
      this.loadPrivateContext();
    } else if (tabChangeEvent.index == 2) {
      this.loadFavoritesContext();
    } else if (tabChangeEvent.index == 3) {
      this.loadSharedContext();
    }
  }

  isAddCodeBlockButtonAvailable(): boolean {
    if (this.currentUserPremiumLimits != undefined) {
      return this.codeBlocks.length < this.currentUserPremiumLimits.codeBlocksLimit;
    }
    return false;
  }

  loadPubicContext(): void {
    this.addCodeBlockButtonVisible = false;
    this.loadContext(LoadContext.PUBLIC_CODE_BLOCKS);
  }

  loadPrivateContext(): void {
    this.addCodeBlockButtonVisible = true;
    this.loadContext(LoadContext.PRIVATE_CODE_BLOCKS);
  }

  loadFavoritesContext(): void {
    this.addCodeBlockButtonVisible = false;
    this.loadContext(LoadContext.FAVORITES_CODE_BLOCKS);
  }

  loadSharedContext(): void {
    this.addCodeBlockButtonVisible = false;
    this.loadContext(LoadContext.SHARED_CODE_BLOCKS);
  }

  loadContext(loadContext: LoadContext): void {
    this.dataLoadContextService.setLoadContext(loadContext);
    this.dataLoadContextService.loadLastFilteredCodeBlocksContext();
  }

  addNewCodeBlock(): void {
    this.dataLoadContextService.setCurrentCodeBlock(null);
    this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_EDIT);
    this.navigationService.redirectToCodeBlockPage();
  }

  getFromUserIdShares(shares: Array<ShareEntity>): Array<string> {
    let result: Array<string> = new Array<string>();
    if (shares.length == 0) {
      return result;
    }
    shares.forEach(shareEntity => {
      if (!result.includes(shareEntity.fromUserId)) {
        result.push(shareEntity.fromUserId);
      }
    });
    return result;
  }

  fillFromUserSharesView(fromUserIdShares: Array<string>): void {
    if (fromUserIdShares.length == 0) {
      this.fromUserShares = [];
      return;
    }

    let countFromUsernameShares = new BehaviorSubject<number>(0);
    const tempArray: Array<UserEntity> = [];

    this.countFromUsernameSharesSubscription$ = countFromUsernameShares.subscribe(() => {
      if (tempArray.length == fromUserIdShares.length) {
        this.fromUserShares = tempArray.sort(
          (a, b) => a.username.localeCompare(b.username));
        if (this.dataLoadContextService.currentFromUserShares == null) {
          this.changeSelectedUser(this.fromUserShares[0]);
        }
      }
    });
    fromUserIdShares.forEach(fromUserId => {
      this.userService.getUserById(fromUserId).subscribe(userEntity => {
        tempArray.push(userEntity);
        countFromUsernameShares.next(countFromUsernameShares.value + 1);
      });
    });
  }

  changeSelectedUser(userEntity: UserEntity) {
    this.dataLoadContextService.currentFromUserShares = userEntity;
    this.dataLoadContextService.loadFilteredCodeBlocksSharedFromUserId(userEntity.id);
  }

  isShareChipSelected(userEntity: UserEntity) {
    return this.dataLoadContextService.currentFromUserShares != null &&
      this.dataLoadContextService.currentFromUserShares.username == userEntity.username;
  }
}
