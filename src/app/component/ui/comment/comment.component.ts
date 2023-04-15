import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommentEntity} from "../../../entity/comment-entity";
import {UserEntity} from "../../../entity/user-entity";
import {Subscription} from "rxjs";
import {UserService} from "../../../service/api/user.service";

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnDestroy {

  @Input() comment!: CommentEntity;
  author!: UserEntity;

  authorSubscription$!: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadAuthor();
  }

  ngOnDestroy(): void {
    if (this.authorSubscription$ != undefined) {
      this.authorSubscription$.unsubscribe();
    }
  }

  loadAuthor(): void {
    if (this.authorSubscription$ != undefined) {
      this.authorSubscription$.unsubscribe();
    }
    this.authorSubscription$ = this.userService.getUserById(this.comment.userId)
      .subscribe(user => this.author = user);
  }
}
