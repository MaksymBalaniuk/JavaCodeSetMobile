import { Pipe, PipeTransform } from '@angular/core';
import {CommentEntity} from "../entity/comment-entity";

@Pipe({
  name: 'commentTimeSort'
})
export class CommentTimeSortPipe implements PipeTransform {

  transform(comments: Array<CommentEntity> | null): Array<CommentEntity> | null {
    if (comments == null) {
      return comments;
    } else {
      return comments.sort((a, b) => this.compareByUpdatedTime(a, b));
    }
  }

  compareByUpdatedTime(a: CommentEntity, b: CommentEntity): number {
    return a.updated <= b.updated ? 1 : -1;
  }
}
