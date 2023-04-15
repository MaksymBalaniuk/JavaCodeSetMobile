import { Pipe, PipeTransform } from '@angular/core';
import {PaginatorService} from "../service/paginator.service";
import {CodeBlockEntity} from "../entity/code-block-entity";

@Pipe({
  name: 'codeBlockPaginator'
})
export class CodeBlockPaginatorPipe implements PipeTransform {

  constructor(private paginatorService: PaginatorService) { }

  transform(codeBlocks: Array<CodeBlockEntity> | null): Array<CodeBlockEntity> | null {
    if (codeBlocks == null) {
      return codeBlocks;
    } else {
      let startIndex = this.paginatorService.pageIndex * this.paginatorService.pageSize;
      let lastIndex = startIndex + this.paginatorService.pageSize;
      return codeBlocks.slice(startIndex, lastIndex);
    }
  }
}
