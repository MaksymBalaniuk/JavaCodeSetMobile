import { Pipe, PipeTransform } from '@angular/core';
import {CodeBlockEntity} from "../entity/code-block-entity";

@Pipe({
  name: 'codeBlockTimeSort'
})
export class CodeBlockTimeSortPipe implements PipeTransform {

  transform(codeBlocks: Array<CodeBlockEntity> | null): Array<CodeBlockEntity> | null {
    if (codeBlocks == null) {
      return codeBlocks;
    } else {
      return codeBlocks.sort((a, b) => this.compareByUpdatedTime(a, b));
    }
  }

  compareByUpdatedTime(a: CodeBlockEntity, b: CodeBlockEntity): number {
    return a.updated <= b.updated ? 1 : -1;
  }
}
