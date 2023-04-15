import {Component, Input, OnInit} from '@angular/core';
import {AuthenticationResponse} from "../../../dto/authentication-response";
import {Subscription} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "../../../service/api/authentication.service";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {ModalService} from "../../../service/modal.service";
import {ErrorService} from "../../../service/error.service";

@Component({
  selector: 'app-authentication-form',
  templateUrl: './authentication-form.component.html',
  styleUrls: ['./authentication-form.component.scss']
})
export class AuthenticationFormComponent implements OnInit {

  @Input() title!: string;
  hide = true;
  success = true;
  errorMessage = '';
  loading = false;
  authenticationResponse!: AuthenticationResponse;

  authenticationSubscription$!: Subscription;
  errorSubscription$!: Subscription;

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(255)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(255)
    ])
  });

  constructor(private authenticationService: AuthenticationService,
              private authenticationContextService: AuthenticationContextService,
              private dataLoadContextService: DataLoadContextService,
              private modalService: ModalService,
              private errorService: ErrorService) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.authenticationSubscription$ != undefined) {
      this.authenticationSubscription$.unsubscribe();
    }
    if (this.errorSubscription$ != undefined) {
      this.errorSubscription$.unsubscribe();
    }
  }

  get username(): FormControl {
    return this.form.controls.username;
  }

  get password(): FormControl {
    return this.form.controls.password;
  }

  get usernameErrorMessage(): string {
    if (this.form.controls.username.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.form.controls.username.hasError('minlength')) {
      return 'Username must contain at least 5 characters';
    }
    return this.form.controls.username
      .hasError('maxlength') ? 'Username must contain no more than 255 characters' : '';
  }

  get passwordErrorMessage(): string {
    if (this.form.controls.password.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.form.controls.password.hasError('minlength')) {
      return 'Password must contain at least 8 characters';
    }
    return this.form.controls.password
      .hasError('maxlength') ? 'Password must contain no more than 255 characters' : '';
  }

  successValidation(): boolean {
    return this.usernameErrorMessage == '' && this.passwordErrorMessage == '';
  }

  retryInput(): void {
    this.success = true;
  }

  submit(): void {
    if (this.successValidation()) {
      this.loading = true;
      this.success = true;
      this.errorMessage = '';
      let authenticationProcess = true;

      this.authenticationSubscription$ = this.authenticationService.login({
        username: this.username.value,
        password: this.password.value
      }).subscribe(authenticationResponse => {
        this.authenticationResponse = authenticationResponse;
        this.errorService.clear();
      });

      this.errorSubscription$ = this.errorService.error$.subscribe(error => {
        this.loading = false;
        if (error != '') {
          this.errorMessage = error;
          this.success = false;
        } else if (authenticationProcess) {
          authenticationProcess = false;
          this.authenticationContextService.login(this.authenticationResponse);
          this.errorService.clear();
          this.modalService.hideForm();
        }
      });
    }
  }
}
