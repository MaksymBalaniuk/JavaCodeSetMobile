import {Component, OnDestroy, OnInit} from '@angular/core';
import {FilterCodeBlockTask} from "../../../entity/filter-code-block-task";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {PaginatorService} from "../../../service/paginator.service";
import {SearchService} from "../../../service/search.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  task!: FilterCodeBlockTask;
  allComplete: boolean = true;
  filterQuery = '';

  filterCodeBlockTaskSubscription$!: Subscription;
  filterQuerySubscription$!: Subscription;

  constructor(private searchService: SearchService,
              public paginatorService: PaginatorService,
              public dataLoadContextService: DataLoadContextService) { }

  ngOnInit(): void {
    this.filterCodeBlockTaskSubscription$ = this.searchService.filterCodeBlockTask$
      .subscribe(task => {
        this.task = task;
        this.updateAllComplete(task);
      });
    this.filterQuerySubscription$ = this.searchService.filterQuery$
      .subscribe(filterQuery => this.filterQuery = filterQuery);
  }

  ngOnDestroy(): void {
    if (this.filterCodeBlockTaskSubscription$ != undefined) {
      this.filterCodeBlockTaskSubscription$.unsubscribe();
    }
    if (this.filterQuerySubscription$ != undefined) {
      this.filterQuerySubscription$.unsubscribe();
    }
  }

  updateAllCompleteAndSearch(): void {
    this.updateAllComplete(this.task);
    this.search();
  }

  updateAllComplete(task: FilterCodeBlockTask): void {
    this.allComplete = task.subtasks != null && task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAllAndSearch(completed: boolean): void {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => (t.completed = completed));
    this.search();
  }

  search(): void {
    this.searchService.filterQuery$.next(this.filterQuery);
    this.searchService.filterCodeBlockTask$.next(this.task);
    this.dataLoadContextService.loadLastFilteredCodeBlocksContext();
  }
}
