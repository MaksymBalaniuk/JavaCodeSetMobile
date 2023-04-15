import { Component } from '@angular/core';
import {ModalService} from "./service/modal.service";
import {ErrorService} from "./service/error.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'JavaCodeSet';

  constructor(public modalService: ModalService, public errorService: ErrorService) { }
}
