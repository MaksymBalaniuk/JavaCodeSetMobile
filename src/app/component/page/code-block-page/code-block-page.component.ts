import {Component, OnInit} from '@angular/core';
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {LoadContext} from "../../../enumeration/load-context";
import {NavigationService} from "../../../service/navigation.service";

@Component({
  selector: 'app-code-block-page',
  templateUrl: './code-block-page.component.html',
  styleUrls: ['./code-block-page.component.scss']
})
export class CodeBlockPageComponent implements OnInit {

  constructor(private dataLoadContextService: DataLoadContextService,
              private navigationService: NavigationService) { }

  ngOnInit(): void {
    if (this.dataLoadContextService.getLoadContext() == LoadContext.CODE_BLOCK_VIEW &&
      this.dataLoadContextService.getCurrentCodeBlock() == null) {
      this.dataLoadContextService.setLoadContext(LoadContext.PUBLIC_CODE_BLOCKS);
      this.navigationService.redirectToMainPage();
    }
    if(this.isLoadContextCodeBlockNotSelected()) {
      this.navigationService.redirectToMainPage();
    }
  }

  isLoadContextCodeBlockView(): boolean {
    return this.dataLoadContextService.getLoadContext() == LoadContext.CODE_BLOCK_VIEW;
  }

  isLoadContextCodeBlockEdit(): boolean {
    return this.dataLoadContextService.getLoadContext() == LoadContext.CODE_BLOCK_EDIT;
  }

  isLoadContextCodeBlockNotSelected(): boolean {
    return this.dataLoadContextService.getLoadContext() != LoadContext.CODE_BLOCK_VIEW &&
      this.dataLoadContextService.getLoadContext() != LoadContext.CODE_BLOCK_EDIT;
  }
}
