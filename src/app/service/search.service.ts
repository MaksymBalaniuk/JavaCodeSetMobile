import { Injectable } from '@angular/core';
import {FilterCodeBlockTask} from "../entity/filter-code-block-task";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  initFilterCodeBlockTask: FilterCodeBlockTask = {
    name: 'All',
    completed: true,
    subtasks: [
      {name: 'Title', completed: true},
      {name: 'Tag', completed: true},
      {name: 'Description', completed: true},
      {name: 'Content', completed: true}
    ]
  };

  filterQuery$ = new BehaviorSubject<string>('');
  filterCodeBlockTask$ = new BehaviorSubject<FilterCodeBlockTask>(this.initFilterCodeBlockTask);

  constructor() { }

  clear(): void {
    this.filterQuery$.next('');
    this.filterCodeBlockTask$.next(this.initFilterCodeBlockTask);
  }
}
