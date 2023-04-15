import { Component, OnInit } from '@angular/core';
import {ModalService} from "../../../service/modal.service";
import {AuthenticationContextService} from "../../../service/authentication-context.service";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  constructor(private modalService: ModalService,
              private authenticationContextService: AuthenticationContextService) { }

  ngOnInit(): void { }

  hideForm() {
    if (this.modalService.isSessionExpiredFormVisible) {
      this.authenticationContextService.logout();
    }
    this.modalService.hideForm();
  }
}
