import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModalService} from "../../../service/modal.service";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {NavigationService} from "../../../service/navigation.service";

@Component({
  selector: 'app-modal-page',
  templateUrl: './modal-page.component.html',
  styleUrls: ['./modal-page.component.scss']
})
export class ModalPageComponent implements OnInit, OnDestroy {

  constructor(public modalService: ModalService,
              private authenticationContextService: AuthenticationContextService,
              private navigationService: NavigationService) { }

  ngOnInit(): void {
    if (!this.modalService.isAnyFormVisible()) {
      this.navigationService.redirectToLastLoadedPage();
    }
  }

  ngOnDestroy() {
    if (this.modalService.isSessionExpiredFormVisible) {
      this.authenticationContextService.logout();
    }
    this.modalService.hideForm();
  }
}
