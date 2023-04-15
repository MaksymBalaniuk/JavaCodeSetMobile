import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TagService} from "../../../service/api/tag.service";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {SearchService} from "../../../service/search.service";
import {EstimateService} from "../../../service/api/estimate.service";
import {UserService} from "../../../service/api/user.service";
import {CodeBlockEntity} from "../../../entity/code-block-entity";
import {TagEntity} from "../../../entity/tag-entity";
import {EstimateEntity} from "../../../entity/estimate-entity";
import {UserEntity} from "../../../entity/user-entity";
import {Subscription} from "rxjs";
import {EstimateType} from "../../../enumeration/estimate-type";
import {LoadContext} from "../../../enumeration/load-context";
import {NavigationService} from "../../../service/navigation.service";

@Component({
  selector: 'app-code-block-card',
  templateUrl: './code-block-card.component.html',
  styleUrls: ['./code-block-card.component.scss']
})
export class CodeBlockCardComponent implements OnInit, OnDestroy {

  @Input() codeBlock!: CodeBlockEntity;
  user!: UserEntity;
  tags!: Array<TagEntity>;
  estimates!: Array<EstimateEntity>;
  likes = 0;
  dislikes = 0;

  userSubscription$!: Subscription;
  tagsSubscription$!: Subscription;
  estimatesSubscription$!: Subscription;

  constructor(private tagService: TagService,
              private userService: UserService,
              private estimateService: EstimateService,
              private searchService: SearchService,
              private dataLoadContextService: DataLoadContextService,
              private navigationService: NavigationService) { }

  ngOnInit(): void {
    this.loadTags();
    this.loadUser();
    this.loadEstimates();
  }

  ngOnDestroy(): void {
    if (this.userSubscription$ != undefined) {
      this.userSubscription$.unsubscribe();
    }
    if (this.tagsSubscription$ != undefined) {
      this.tagsSubscription$.unsubscribe();
    }
    if (this.estimatesSubscription$ != undefined) {
      this.estimatesSubscription$.unsubscribe();
    }
  }

  loadUser(): void {
    this.userSubscription$ = this.userService.getUserById(this.codeBlock.userId).subscribe(
      user => this.user = user
    );
  }

  loadTags(): void {
    this.tagsSubscription$ = this.tagService.getAllTagsByCodeBlockId(this.codeBlock.id).subscribe(
      tags => this.tags = tags
    );
  }

  loadEstimates(): void {
    this.estimatesSubscription$ = this.estimateService.getAllEstimatesByCodeBlockId(this.codeBlock.id).subscribe(
      estimates => {
        this.estimates = estimates;
        this.likes = estimates.filter(estimate => estimate.type == EstimateType.LIKE).length;
        this.dislikes = estimates.filter(estimate => estimate.type == EstimateType.DISLIKE).length;
      }
    );
  }

  searchByTag(tagName: string) {
    this.searchService.filterQuery$.next(tagName);
    this.searchService.filterCodeBlockTask$.next({
      name: 'All',
      completed: false,
      subtasks: [
        {name: 'Title', completed: false},
        {name: 'Tag', completed: true},
        {name: 'Description', completed: false},
        {name: 'Content', completed: false}
      ]
    });
    this.dataLoadContextService.loadLastFilteredCodeBlocksContext();
  }

  viewCodeBlock(): void {
    this.dataLoadContextService.setCurrentCodeBlock(this.codeBlock);
    this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_VIEW);
    this.navigationService.redirectToCodeBlockPage();
  }
}
