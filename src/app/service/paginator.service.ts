import { Injectable } from '@angular/core';
import {Subscription} from "rxjs";
import {DataLoadContextService} from "./data-load-context.service";
import {PageEvent} from "@angular/material/paginator";

@Injectable({
  providedIn: 'root'
})
export class PaginatorService {

  length!: number;
  pageSize!: number;
  pageIndex!: number;
  pageSizeOptions!: number[];
  codeBlocksSubscription$!: Subscription;

  constructor(private dataLoadContextService: DataLoadContextService) {
    this.initOptions();
  }

  initOptions() {
    if (this.codeBlocksSubscription$ != undefined) {
      this.codeBlocksSubscription$.unsubscribe();
    }
    this.codeBlocksSubscription$ = this.dataLoadContextService.codeBlocks$.subscribe(codeBlocks => {
      this.length = codeBlocks.length;
      this.pageSizeOptions = [10, 25, 100];
      this.pageSize = this.pageSizeOptions[0];
      this.pageIndex = 0;
    });
  }

  changePaginationOptions(pageEvent: PageEvent) {
    if (this.codeBlocksSubscription$ != undefined) {
      this.codeBlocksSubscription$.unsubscribe();
    }
    this.codeBlocksSubscription$ = this.dataLoadContextService.codeBlocks$.subscribe(codeBlocks => {
      this.length = codeBlocks.length;
      this.pageSize = pageEvent.pageSize;
      this.pageIndex = pageEvent.pageIndex;
    });
  }
}
