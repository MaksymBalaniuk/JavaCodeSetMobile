import {Component, OnDestroy, OnInit} from '@angular/core';
import {CodeBlockEntity} from "../../../entity/code-block-entity";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {BehaviorSubject, Subscription} from 'rxjs';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {CodeBlockService} from "../../../service/api/code-block.service";
import {TagService} from "../../../service/api/tag.service";
import {MatChipInputEvent} from "@angular/material/chips";
import {CodeBlockType} from "../../../enumeration/code-block-type";
import {LoadContext} from "../../../enumeration/load-context";
import {TagsUpdatingProcess} from "../../../entity/tags-updating-process";

@Component({
  selector: 'app-code-block-edit',
  templateUrl: './code-block-edit.component.html',
  styleUrls: [
    './code-block-edit.component.scss',
    './../../page/code-block-page/code-block-page.component.scss'
  ]
})
export class CodeBlockEditComponent implements OnInit, OnDestroy {

  codeBlock: CodeBlockEntity | null = null;
  maxContentLength = 0;
  maxCodeBlocksCount = 0;
  userCodeBlocksCount = 0;
  successCreationOrEditing = true;
  errorMessage = '';
  tags: Array<string> = [];
  loadedTags: Array<string> = [];
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  getAllTagsByCodeBlockIdSubscription$!: Subscription;
  getAllCodeBlocksByUserIdSubscription$!: Subscription;
  currentUserDetailsSubscription$!: Subscription;
  currentUserPremiumLimitsSubscription$!: Subscription;
  tagsUpdatingProcessSubscription$!: Subscription;

  form = new FormGroup({
    title: new FormControl('', []),
    description: new FormControl('', []),
    content: new FormControl('', [])
  });

  constructor(private dataLoadContextService: DataLoadContextService,
              private authenticationContextService: AuthenticationContextService,
              private codeBlockService: CodeBlockService,
              private tagService: TagService) { }

  ngOnInit(): void {
    this.currentUserPremiumLimitsSubscription$ = this.authenticationContextService.userPremiumLimits$
      .subscribe(premiumLimits => {
        this.currentUserDetailsSubscription$ = this.authenticationContextService.userDetails$
          .subscribe(userDetails => {
            if (userDetails.user != null) {
              this.getAllCodeBlocksByUserIdSubscription$ = this.codeBlockService
                .getAllCodeBlocksByUserId(userDetails.user.id, userDetails.token).subscribe(codeBlocks => {
                  this.userCodeBlocksCount = codeBlocks.length;
                  this.maxCodeBlocksCount = premiumLimits.codeBlocksLimit;
                  this.maxContentLength = premiumLimits.codeBlockContentLimit;
                  this.loadCodeBlock(premiumLimits.codeBlockContentLimit);
                });
            }
          });
      });
  }

  ngOnDestroy(): void {
    if (this.getAllTagsByCodeBlockIdSubscription$ != undefined) {
      this.getAllTagsByCodeBlockIdSubscription$.unsubscribe();
    }
    if (this.getAllCodeBlocksByUserIdSubscription$ != undefined) {
      this.getAllCodeBlocksByUserIdSubscription$.unsubscribe();
    }
    if (this.currentUserDetailsSubscription$ != undefined) {
      this.currentUserDetailsSubscription$.unsubscribe();
    }
    if (this.currentUserPremiumLimitsSubscription$ != undefined) {
      this.currentUserPremiumLimitsSubscription$.unsubscribe();
    }
    if (this.tagsUpdatingProcessSubscription$ != undefined) {
      this.tagsUpdatingProcessSubscription$.unsubscribe();
    }
  }

  get title(): FormControl {
    return this.form.controls.title;
  }

  get description(): FormControl {
    return this.form.controls.description;
  }

  get content(): FormControl {
    return this.form.controls.content;
  }

  get titleErrorMessage(): string {
    if (this.form.controls.title.hasError('required')) {
      return 'You must enter a value';
    }
    return this.form.controls.title
      .hasError('maxlength') ? 'Title must contain no more than 100 characters' : '';
  }

  get descriptionErrorMessage(): string {
    return this.form.controls.description
      .hasError('maxlength') ? 'Description must contain no more than 255 characters' : '';
  }

  get contentErrorMessage(): string {
    if (this.form.controls.content.hasError('required')) {
      return 'You must enter a value';
    }
    return this.form.controls.content
      .hasError('maxlength') ? `Your premium code length limit ${this.maxContentLength}, ` +
        `now ${this.form.controls.content.value?.trim().length}` : '';
  }

  retryInput(): void {
    this.successCreationOrEditing = true;
  }

  loadCodeBlock(codeBlockContentLimit: number): void {
    this.codeBlock = this.dataLoadContextService.getCurrentCodeBlock();
    this.loadTags();
    this.loadFormFields(codeBlockContentLimit);
  }

  loadTags(): void {
    if (this.codeBlock != null) {
      this.getAllTagsByCodeBlockIdSubscription$ = this.tagService.getAllTagsByCodeBlockId(this.codeBlock.id)
        .subscribe(tags => {
          this.tags = tags.map(tag => tag.name);
          this.loadedTags = tags.map(tag => tag.name);
        });
    }
  }

  loadFormFields(codeBlockContentLimit: number): void {
    const titleValidators = [Validators.required, Validators.maxLength(100)];
    const descriptionValidators = [Validators.maxLength(255)];
    const contentValidators = [Validators.required, Validators.maxLength(codeBlockContentLimit)];
    const clipboardCodeBlock = this.dataLoadContextService.clipboardCodeBlock;
    const clipboardTags = this.dataLoadContextService.clipboardTags;

    if (this.codeBlock != null) {
      this.form.controls.title = new FormControl(this.codeBlock.title, titleValidators);
      this.form.controls.description = new FormControl(this.codeBlock.description, descriptionValidators);
      this.form.controls.content = new FormControl(this.codeBlock.content, contentValidators);
    } else if (clipboardCodeBlock != null) {
      this.form.controls.title = new FormControl(clipboardCodeBlock.title, titleValidators);
      this.form.controls.description = new FormControl(clipboardCodeBlock.description, descriptionValidators);
      this.form.controls.content = new FormControl(clipboardCodeBlock.content, contentValidators);
      this.tags = clipboardTags.map(tag => tag.name);
      this.dataLoadContextService.clipboardCodeBlock = null;
      this.dataLoadContextService.clipboardTags = [];
    } else {
      this.form.controls.title = new FormControl('', titleValidators);
      this.form.controls.description = new FormControl('', descriptionValidators);
      this.form.controls.content = new FormControl('', contentValidators);
    }
  }

  successValidation(): boolean {
    return this.titleErrorMessage == '' &&
      this.descriptionErrorMessage == '' &&
      this.contentErrorMessage == '';
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tagName: string): void {
    const index = this.tags.indexOf(tagName);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  submit(): void {
    if (this.successValidation()) {
      if (this.codeBlock == null) {
        if (this.userCodeBlocksCount >= this.maxCodeBlocksCount) {
          this.errorMessage = `Your premium code blocks limit ${this.maxCodeBlocksCount}, ` +
            `now ${this.userCodeBlocksCount}`;
          this.successCreationOrEditing = false;
          return;
        }
        this.createCodeBlock();
      } else {
        this.updateCodeBlock();
      }
    }
  }

  createCodeBlock(): void {
    if (this.currentUserDetailsSubscription$ != undefined) {
      this.currentUserDetailsSubscription$.unsubscribe();
    }

    this.currentUserDetailsSubscription$ = this.authenticationContextService.userDetails$
      .subscribe(userDetails => {
        if (userDetails.user != null) {
          const codeBlockEntity: CodeBlockEntity = {
            id: '',
            title: this.title.value.toString().trim(),
            description: this.description.value.toString().trim(),
            content: this.content.value.toString().trim(),
            type: CodeBlockType.PRIVATE,
            created: 0,
            updated: 0,
            userId: userDetails.user.id
          }
          this.codeBlockService.createCodeBlock(codeBlockEntity, userDetails.token)
            .subscribe(codeBlock => {
              if (this.tags.length == 0 && this.loadedTags.length == 0) {
                this.dataLoadContextService.setCurrentCodeBlock(codeBlock);
                this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_VIEW);
              } else {
                this.updateCodeBlockTags(codeBlock, userDetails.token);
              }
            });
        }
      });
  }

  updateCodeBlock(): void {
    if (this.currentUserDetailsSubscription$ != undefined) {
      this.currentUserDetailsSubscription$.unsubscribe();
    }

    this.currentUserDetailsSubscription$ = this.authenticationContextService.userDetails$
      .subscribe(userDetails => {
        if (userDetails.user != null && this.codeBlock != null) {
          const codeBlockEntity: CodeBlockEntity = {
            id: this.codeBlock.id,
            title: this.title.value.toString().trim(),
            description: this.description.value.toString().trim(),
            content: this.content.value.toString().trim(),
            type: this.codeBlock.type,
            created: 0,
            updated: 0,
            userId: this.codeBlock.userId
          }

          this.codeBlockService.updateCodeBlock(codeBlockEntity, userDetails.token)
            .subscribe(codeBlock => {
              if (this.tags.length == 0 && this.loadedTags.length == 0) {
                this.dataLoadContextService.setCurrentCodeBlock(codeBlock);
                this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_VIEW);
              } else {
                this.updateCodeBlockTags(codeBlock, userDetails.token);
              }
            });
        }
      });
  }

  updateCodeBlockTags(codeBlock: CodeBlockEntity, token: string): void {
    let tagsUpdatingProcess = new BehaviorSubject<TagsUpdatingProcess>({
      tagsToDelete: 0,
      tagsToAdd: 0,
      tagsDeleted: -1,
      tagsAdded: -1
    });

    this.tagsUpdatingProcessSubscription$ = tagsUpdatingProcess.subscribe(tagsUpdatingProcess => {
      if (tagsUpdatingProcess.tagsToDelete == tagsUpdatingProcess.tagsDeleted &&
        tagsUpdatingProcess.tagsToAdd == tagsUpdatingProcess.tagsAdded) {
        this.dataLoadContextService.setCurrentCodeBlock(codeBlock);
        this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_VIEW);
      }
    });

    this.deleteCodeBlockTags(codeBlock, token, tagsUpdatingProcess);
    this.addCodeBlockTags(codeBlock, token, tagsUpdatingProcess);
  }

  deleteCodeBlockTags(codeBlock: CodeBlockEntity, token: string,
                      tagsUpdatingProcess: BehaviorSubject<TagsUpdatingProcess>): void {
    this.tagService.getAllTagsByCodeBlockId(codeBlock.id)
      .subscribe(tags => {
        let tagsToDelete = 0;
        let tagIdsToDelete: Array<string> = [];

        tags.forEach(tag => {
          if (!this.tags.includes(tag.name)) {
            tagIdsToDelete.push(tag.id);
            tagsToDelete++;
          }
        });

        tagsUpdatingProcess.next(this.setTagsUpdatingProcessTagsToDelete(tagsToDelete, tagsUpdatingProcess.value));

        tagIdsToDelete.forEach(tagId => {
          this.tagService.deleteTagFromCodeBlock(tagId, codeBlock.id, token).subscribe(() =>
            tagsUpdatingProcess.next(this.incrementTagsUpdatingProcessTagsDeleted(tagsUpdatingProcess.value))
          );
        });
      });
  }

  setTagsUpdatingProcessTagsToDelete(count: number, lastProcessState: TagsUpdatingProcess): TagsUpdatingProcess {
    lastProcessState.tagsToDelete = count;
    lastProcessState.tagsDeleted = 0;
    return lastProcessState;
  }

  incrementTagsUpdatingProcessTagsDeleted(lastProcessState: TagsUpdatingProcess): TagsUpdatingProcess {
    lastProcessState.tagsDeleted += 1;
    return lastProcessState;
  }

  addCodeBlockTags(codeBlock: CodeBlockEntity, token: string,
                   tagsUpdatingProcess: BehaviorSubject<TagsUpdatingProcess>): void {
    let tagsToAdd = 0;
    let tagNamesToAdd: Array<string> = [];

    this.tags.forEach(tag => {
      if (!this.loadedTags.includes(tag)) {
        tagNamesToAdd.push(tag);
        tagsToAdd++;
      }
    });

    tagsUpdatingProcess.next(this.setTagsUpdatingProcessTagsToAdd(tagsToAdd, tagsUpdatingProcess.value));

    tagNamesToAdd.forEach(tag => {
      this.tagService.createTag({id: '', name: tag}, token).subscribe(tag => {
        this.tagService.addTagToCodeBlock(tag.id, codeBlock.id, token).subscribe(() =>
          tagsUpdatingProcess.next(this.incrementTagsUpdatingProcessTagsAdded(tagsUpdatingProcess.value))
        );
      });
    });
  }

  setTagsUpdatingProcessTagsToAdd(count: number, lastProcessState: TagsUpdatingProcess): TagsUpdatingProcess {
    lastProcessState.tagsToAdd = count;
    lastProcessState.tagsAdded = 0;
    return lastProcessState;
  }

  incrementTagsUpdatingProcessTagsAdded(lastProcessState: TagsUpdatingProcess): TagsUpdatingProcess {
    lastProcessState.tagsAdded += 1;
    return lastProcessState;
  }

  suppressTabEvent(event: Event, textarea: HTMLTextAreaElement): void {
    event.preventDefault();
    let inputCaretPosition = textarea.selectionStart;
    this.form.controls.content.setValue([this.form.controls.content.value?.slice(0, inputCaretPosition), '    ',
      this.form.controls.content.value?.slice(inputCaretPosition)].join(''));
    inputCaretPosition += 4;
    setTimeout(()=>{
      textarea.focus();
      textarea.setSelectionRange(inputCaretPosition, inputCaretPosition);
    },0);
  }
}
