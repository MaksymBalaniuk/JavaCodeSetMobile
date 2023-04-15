import { Component, OnInit } from '@angular/core';
import {CodeBlockEntity} from "../../../entity/code-block-entity";
import {UserDetails} from "../../../entity/user-details";
import {UserPermissions} from "../../../dto/user-permissions";
import {EstimateEntity} from "../../../entity/estimate-entity";
import {UserEntity} from "../../../entity/user-entity";
import {Subscription} from "rxjs";
import {CommentEntity} from "../../../entity/comment-entity";
import {TagEntity} from "../../../entity/tag-entity";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {UserService} from "../../../service/api/user.service";
import {EstimateService} from "../../../service/api/estimate.service";
import {CommentService} from "../../../service/api/comment.service";
import {TagService} from "../../../service/api/tag.service";
import {CodeBlockService} from "../../../service/api/code-block.service";
import {SearchService} from "../../../service/search.service";
import {EstimateType} from "../../../enumeration/estimate-type";
import {CodeBlockType} from "../../../enumeration/code-block-type";
import {LoadContext} from "../../../enumeration/load-context";
import {NavigationService} from "../../../service/navigation.service";
import {ModalService} from "../../../service/modal.service";

@Component({
  selector: 'app-code-block-view',
  templateUrl: './code-block-view.component.html',
  styleUrls: [
    './code-block-view.component.scss',
    './../../page/code-block-page/code-block-page.component.scss'
  ]
})
export class CodeBlockViewComponent implements OnInit {

  codeBlock!: CodeBlockEntity | null;
  currentUserDetails!: UserDetails;
  currentUserPermissions!: UserPermissions;
  currentUserEstimate!: EstimateEntity | null;
  author!: UserEntity;
  commentText = '';
  comments!: Array<CommentEntity>;
  tags!: Array<TagEntity>;
  estimates!: Array<EstimateEntity>;
  likes = 0;
  dislikes = 0;

  commentsSubscription$!: Subscription;
  tagsSubscription$!: Subscription;
  estimatesSubscription$!: Subscription;
  currentUserSubscription$!: Subscription;
  currentUserPermissionsSubscription$!: Subscription;
  authorSubscription$!: Subscription;
  createEstimateSubscription$!: Subscription;
  updateEstimateSubscription$!: Subscription;
  deleteEstimateSubscription$!: Subscription;
  createCommentSubscription$!: Subscription;
  deleteCodeBlockSubscription$!: Subscription;

  constructor(private dataLoadContextService: DataLoadContextService,
              public authenticationContextService: AuthenticationContextService,
              private userService: UserService,
              private estimateService: EstimateService,
              private commentsService: CommentService,
              private tagService: TagService,
              private codeBlockService: CodeBlockService,
              private searchService: SearchService,
              private navigationService: NavigationService,
              private modalService: ModalService) { }

  ngOnInit(): void {
    this.loadCurrentUserAndPrimaryData();
  }

  ngOnDestroy(): void {
    if (this.commentsSubscription$ != undefined) {
      this.commentsSubscription$.unsubscribe();
    }
    if (this.tagsSubscription$ != undefined) {
      this.tagsSubscription$.unsubscribe();
    }
    if (this.estimatesSubscription$ != undefined) {
      this.estimatesSubscription$.unsubscribe();
    }
    if (this.currentUserPermissionsSubscription$ != undefined) {
      this.currentUserPermissionsSubscription$.unsubscribe();
    }
    if (this.currentUserSubscription$ != undefined) {
      this.currentUserSubscription$.unsubscribe();
    }
    if (this.authorSubscription$ != undefined) {
      this.authorSubscription$.unsubscribe();
    }
    if (this.createEstimateSubscription$ != undefined) {
      this.createEstimateSubscription$.unsubscribe();
    }
    if (this.updateEstimateSubscription$ != undefined) {
      this.updateEstimateSubscription$.unsubscribe();
    }
    if (this.deleteEstimateSubscription$ != undefined) {
      this.deleteEstimateSubscription$.unsubscribe();
    }
    if (this.createCommentSubscription$ != undefined) {
      this.createCommentSubscription$.unsubscribe();
    }
    if (this.deleteCodeBlockSubscription$ != undefined) {
      this.deleteCodeBlockSubscription$.unsubscribe();
    }
  }

  loadPrimaryData(): void {
    this.loadCodeBlock();
    this.loadAuthor();
    this.loadEstimates();
    this.loadTags();
  }

  loadCodeBlock(): void {
    const codeBlock = this.dataLoadContextService.getCurrentCodeBlock();
    if (codeBlock != null) {
      this.codeBlock = codeBlock;
    }
  }

  loadCurrentUserAndPrimaryData(): void {
    if (this.currentUserSubscription$ != undefined) {
      this.currentUserSubscription$.unsubscribe();
    }
    if (this.currentUserPermissionsSubscription$ != undefined) {
      this.currentUserPermissionsSubscription$.unsubscribe();
    }
    this.currentUserPermissionsSubscription$ = this.authenticationContextService.userPermissions$
      .subscribe(userPermissions => this.currentUserPermissions = userPermissions);
    this.currentUserSubscription$ = this.authenticationContextService.userDetails$
      .subscribe(userDetails => {
        this.currentUserDetails = userDetails;
        this.currentUserEstimate = null;
        this.loadPrimaryData();
      });
  }

  loadAuthor(): void {
    if (this.authorSubscription$ != undefined) {
      this.authorSubscription$.unsubscribe();
    }
    if (this.codeBlock != null) {
      this.authorSubscription$ = this.userService.getUserById(this.codeBlock.userId)
        .subscribe(user => this.author = user);
    }
  }

  loadEstimates(): void {
    if (this.estimatesSubscription$ != undefined) {
      this.estimatesSubscription$.unsubscribe();
    }
    if (this.codeBlock != null) {
      this.estimatesSubscription$ = this.estimateService.getAllEstimatesByCodeBlockId(this.codeBlock.id)
        .subscribe(estimates => {
            this.estimates = estimates;
            this.likes = estimates.filter(estimate => estimate.type == EstimateType.LIKE).length;
            this.dislikes = estimates.filter(estimate => estimate.type == EstimateType.DISLIKE).length;
            estimates.forEach(estimate => {
              if (estimate.userId == this.currentUserDetails.user?.id) {
                this.currentUserEstimate = estimate;
              }
            });
          });
    }
  }

  loadTags(): void {
    if (this.codeBlock != null) {
      this.tagsSubscription$ = this.tagService.getAllTagsByCodeBlockId(this.codeBlock.id).subscribe(
        tags => this.tags = tags
      );
    }
  }

  loadComments(): void {
    if (this.codeBlock != null) {
      this.commentsSubscription$ = this.commentsService.getAllCommentsByCodeBlockId(this.codeBlock.id).subscribe(
        comments => this.comments = comments
      );
    }
  }

  isCodeBlockLikedByCurrentUser(): boolean {
    if (this.currentUserEstimate == null) {
      return false;
    }
    return this.currentUserEstimate.type == EstimateType.LIKE;
  }

  isCodeBlockDislikedByCurrentUser(): boolean {
    if (this.currentUserEstimate == null) {
      return false;
    }
    return this.currentUserEstimate.type == EstimateType.DISLIKE;
  }

  isCodeBlockPublic(): boolean {
    if (this.codeBlock == null) {
      return false;
    }
    return this.codeBlock.type == CodeBlockType.PUBLIC;
  }

  like(): void {
    if (this.currentUserDetails != undefined && this.currentUserDetails.user != null) {
      if (this.currentUserEstimate == null) {
        this.createEstimate(
          this.currentUserDetails.user,
          this.currentUserDetails.token,
          EstimateType.LIKE);
      } else {
        if (this.currentUserEstimate.type == EstimateType.LIKE) {
          this.deleteEstimate(this.currentUserEstimate.id, this.currentUserDetails.token);
        } else if (this.currentUserEstimate.type == EstimateType.DISLIKE) {
          this.currentUserEstimate.type = EstimateType.LIKE;
          this.updateEstimate(this.currentUserEstimate, this.currentUserDetails.token);
        }
      }
    }
  }

  dislike(): void {
    if (this.currentUserDetails != undefined && this.currentUserDetails.user != null) {
      if (this.currentUserEstimate == null) {
        this.createEstimate(
          this.currentUserDetails.user,
          this.currentUserDetails.token,
          EstimateType.DISLIKE);
      } else {
        if (this.currentUserEstimate.type == EstimateType.DISLIKE) {
          this.deleteEstimate(this.currentUserEstimate.id, this.currentUserDetails.token);
        } else if (this.currentUserEstimate.type == EstimateType.LIKE) {
          this.currentUserEstimate.type = EstimateType.DISLIKE;
          this.updateEstimate(this.currentUserEstimate, this.currentUserDetails.token);
        }
      }
    }
  }

  createEstimate(user: UserEntity, token: string, estimateType: EstimateType): void {
    if (this.createEstimateSubscription$ != undefined) {
      this.createEstimateSubscription$.unsubscribe();
    }
    if (this.codeBlock != null) {
      this.createEstimateSubscription$ = this.estimateService.createEstimate({
        id: '',
        type: estimateType,
        userId: user.id,
        codeBlockId : this.codeBlock.id
      }, token).subscribe(estimate => {
        this.currentUserEstimate = estimate;
        this.loadEstimates();
      });
    }
  }

  updateEstimate(estimate: EstimateEntity, token: string): void {
    if (this.updateEstimateSubscription$ != undefined) {
      this.updateEstimateSubscription$.unsubscribe();
    }
    this.updateEstimateSubscription$ = this.estimateService.updateEstimate(estimate, token)
      .subscribe(estimate => {
        this.currentUserEstimate = estimate;
        this.loadEstimates();
      });
  }

  deleteEstimate(estimateId: string, token: string): void {
    if (this.deleteEstimateSubscription$ != undefined) {
      this.deleteEstimateSubscription$.unsubscribe();
    }
    this.deleteEstimateSubscription$ = this.estimateService.deleteEstimateById(estimateId, token)
      .subscribe(() => {
        this.currentUserEstimate = null;
        this.loadEstimates();
      });
  }

  leaveComment(): void {
    if (this.createCommentSubscription$ != undefined) {
      this.createCommentSubscription$.unsubscribe();
    }
    if (this.currentUserDetails != undefined &&
      this.currentUserDetails.user != null &&
      this.codeBlock != null) {
      this.createCommentSubscription$ = this.commentsService.createComment({
        id: '',
        comment: this.commentText,
        created: 0,
        updated: 0,
        userId: this.currentUserDetails.user.id,
        codeBlockId: this.codeBlock.id
      }, this.currentUserDetails.token).subscribe(() => this.loadComments());
    }
  }

  publishCodeBlock(): void {
    this.updateCodeBlockType(CodeBlockType.PUBLIC);
  }

  hideCodeBlock(): void {
    this.updateCodeBlockType(CodeBlockType.HIDDEN);
  }

  shareCodeBlock(): void {
    this.modalService.showShareForm();
  }

  updateCodeBlockType(type: CodeBlockType): void {
    if (this.currentUserDetails != undefined && this.currentUserDetails.user != null
      && this.codeBlock != null) {
      this.codeBlock.type = type;
      this.codeBlockService.updateCodeBlock(this.codeBlock, this.currentUserDetails.token)
        .subscribe(codeBlock => {
          this.dataLoadContextService.setCurrentCodeBlock(codeBlock);
          this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_VIEW);
        });
    }
  }

  editCodeBlock(): void {
    if (this.codeBlock != null) {
      this.dataLoadContextService.setCurrentCodeBlock(this.codeBlock);
      this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_EDIT);
    }
  }

  deleteCodeBlock(): void {
    if (this.codeBlock != null) {
      if (this.deleteCodeBlockSubscription$ != undefined) {
        this.deleteCodeBlockSubscription$.unsubscribe();
      }
      this.deleteCodeBlockSubscription$ =
        this.codeBlockService.deleteCodeBlock(this.codeBlock.id, this.currentUserDetails.token)
          .subscribe(() => {
            this.dataLoadContextService.setCurrentCodeBlock(null);
            this.dataLoadContextService.setLoadContext(LoadContext.PRIVATE_CODE_BLOCKS);
            this.navigationService.redirectToMainPage();
          });
    }
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
    this.dataLoadContextService.setCurrentCodeBlock(null);
    this.dataLoadContextService.setLoadContext(LoadContext.PUBLIC_CODE_BLOCKS);
    this.navigationService.redirectToMainPage();
  }

  addNewCodeBlock(): void {
    this.dataLoadContextService.setCurrentCodeBlock(null);
    this.dataLoadContextService.clipboardCodeBlock = this.codeBlock;
    this.dataLoadContextService.clipboardTags = this.tags;
    this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_EDIT);
  }

  openCodeBlockInCompiler(): void {
    this.dataLoadContextService.clipboardCodeBlock = this.codeBlock;
    this.dataLoadContextService.clipboardTags = this.tags;
    this.navigationService.redirectToCompilerPage();
  }
}
