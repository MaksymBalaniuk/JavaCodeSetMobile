import {Component, OnDestroy, OnInit} from '@angular/core';
import {PremiumLimits} from "../../../dto/premium-limits";
import {UserDetails} from "../../../entity/user-details";
import {Subscription} from "rxjs";
import {ExecutorService} from "../../../service/api/executor.service";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {CodeBlockService} from "../../../service/api/code-block.service";
import {ErrorService} from "../../../service/error.service";
import {CodeBlockEntity} from "../../../entity/code-block-entity";
import {CodeBlockType} from "../../../enumeration/code-block-type";
import {LoadContext} from "../../../enumeration/load-context";
import {JavaCodeExecutionRequest} from "../../../dto/java-code-execution-request";
import {NavigationService} from "../../../service/navigation.service";

@Component({
  selector: 'app-compiler-page',
  templateUrl: './compiler-page.component.html',
  styleUrls: ['./compiler-page.component.scss']
})
export class CompilerPageComponent implements OnInit, OnDestroy {

  compilerContent = 'public static void main(String[] args) {\n    System.out.println("Hello world!");\n}';
  argsContent = '';
  errorMessage = '';
  exitCode!: number;
  output!: string;
  error!: string;
  loading = false;
  userCodeBlocksCount = 0;
  userPremiumLimits!: PremiumLimits;
  currentUserDetails: UserDetails | null = null;

  currentUserSubscription$!: Subscription;
  executeSubscription$!: Subscription;
  errorSubscription$!: Subscription;
  userPremiumLimitsSubscription$!: Subscription;
  userCodeBlocksSubscription$!: Subscription;

  constructor(private executorService: ExecutorService,
              public authenticationContextService: AuthenticationContextService,
              private dataLoadContextService: DataLoadContextService,
              private codeBlockService: CodeBlockService,
              private errorService: ErrorService,
              private navigationService: NavigationService) { }

  ngOnInit(): void {
    this.currentUserSubscription$ = this.authenticationContextService.userDetails$
      .subscribe(userDetails => {
        this.currentUserDetails = userDetails;
        if (userDetails != null && userDetails.user != null) {
          this.userCodeBlocksSubscription$ = this.codeBlockService
            .getAllCodeBlocksByUserId(userDetails.user.id, userDetails.token)
            .subscribe(codeBlocks => this.userCodeBlocksCount = codeBlocks.length);
        } else if (userDetails != null && userDetails.user == null) {
          this.navigationService.redirectToMainPage();
        }
      });
    this.userPremiumLimitsSubscription$ = this.authenticationContextService.userPremiumLimits$
      .subscribe(premiumLimits => this.userPremiumLimits = premiumLimits);
    if (this.dataLoadContextService.clipboardCodeBlock != null) {
      this.compilerContent = this.dataLoadContextService.clipboardCodeBlock.content;
      this.dataLoadContextService.clipboardCodeBlock = null;
      this.dataLoadContextService.clipboardTags = [];
    }
  }

  ngOnDestroy(): void {
    if (this.currentUserSubscription$ != undefined) {
      this.currentUserSubscription$.unsubscribe();
    }
    if (this.executeSubscription$ != undefined) {
      this.executeSubscription$.unsubscribe();
    }
    if (this.errorSubscription$ != undefined) {
      this.errorSubscription$.unsubscribe();
    }
    if (this.userPremiumLimitsSubscription$ != undefined) {
      this.userPremiumLimitsSubscription$.unsubscribe();
    }
    if (this.userCodeBlocksSubscription$ != undefined) {
      this.userCodeBlocksSubscription$.unsubscribe();
    }
  }

  suppressTabEvent(event: Event, textarea: HTMLTextAreaElement): void {
    event.preventDefault();
    let inputCaretPosition = textarea.selectionStart;
    this.compilerContent = [this.compilerContent.slice(0, inputCaretPosition), '    ',
      this.compilerContent.slice(inputCaretPosition)].join('');
    inputCaretPosition += 4;
    setTimeout(()=>{
      textarea.focus();
      textarea.setSelectionRange(inputCaretPosition, inputCaretPosition);
    },0);
  }

  canSaveCode(): boolean {
    return this.userPremiumLimits.codeBlocksLimit > this.userCodeBlocksCount;
  }

  saveCode(): void {
    if (this.currentUserDetails != null && this.currentUserDetails.user != null) {
      let clipboardCodeBlock: CodeBlockEntity | null = this.dataLoadContextService.clipboardCodeBlock;
      if (clipboardCodeBlock == null) {
        clipboardCodeBlock = {
          id: '',
          title: '',
          description: '',
          content: this.compilerContent.trim(),
          type: CodeBlockType.PRIVATE,
          created: 0,
          updated: 0,
          userId: ''
        }
      } else {
        clipboardCodeBlock.content = this.compilerContent;
      }

      this.dataLoadContextService.clipboardCodeBlock = clipboardCodeBlock;
      this.dataLoadContextService.clipboardTags = [];
      this.dataLoadContextService.setCurrentCodeBlock(null);
      this.dataLoadContextService.setLoadContext(LoadContext.CODE_BLOCK_EDIT);
      this.navigationService.redirectToCodeBlockPage();
    }
  }

  retryInput(): void {
    this.errorMessage = '';
  }

  execute(): void {
    this.errorMessage = '';

    if (this.compilerContent.trim().length == 0) {
      this.errorMessage = 'Code field cannot be empty';
      return;
    }

    if (this.userPremiumLimits != undefined) {
      if (this.compilerContent.trim().length > this.userPremiumLimits.compilerContentLimit) {
        this.errorMessage = 'Your premium compiler code length limit ' +
          `${this.userPremiumLimits.compilerContentLimit}, now ${this.compilerContent.trim().length}`;
        return;
      }
    } else {
      return;
    }

    if (this.currentUserDetails != null) {
      this.loading = true;
      let request: JavaCodeExecutionRequest = {
        javaCode: this.compilerContent.trim(),
        args: this.argsContent.split(' ')
      }

      this.executeSubscription$ = this.executorService.execute(request, this.currentUserDetails.token)
        .subscribe(response => {
          this.loading = false;
          this.exitCode = response.exitCode;
          this.output = response.output;
          this.error = response.error;
        });

      this.errorSubscription$ = this.errorService.error$.subscribe(error => {
        this.loading = false;
        if (error != '') {
          this.errorMessage = error;
        }
      });
    }
  }

  compilerRules =
    '1. The code is executed in a wrapper class with all imports, ' +
    'so you must write methods, fields and internal structures (classes, interfaces, etc.), ' +
    'with this in mind: \n\n' +
    'imports... \n\n' +
    'public class Main { \n' +
    '    // your code in field \'Code\' \n' +
    '}\n\n' +
    '2. The wrapper class must contain an entry point (main method) with a strong signature, ' +
    'for example: \n\n' +
    'public static void main(String[] args) {\n' +
    '    System.out.println(\"Hello world!\");\n' +
    '}\n\n' +
    '3. Code should not contain a method \'System.exit()\', ' +
    'so the use of the \'exit\' keyword is prohibited.\n\n' +
    '4. Command line arguments can be passed to the main method in the \'Arguments\' field, ' +
    'they must be written separated by a space.\n\n' +
    '5. Code execution is limited to 10 seconds, so you should not use infinite loops or ' +
    'write too heavy code that takes a long time to complete.';
}
