import {Component, Input, OnInit} from '@angular/core';
import {RegisterResponse} from "../../../dto/register-response";
import {Subscription} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "../../../service/api/authentication.service";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {DataLoadContextService} from "../../../service/data-load-context.service";
import {ModalService} from "../../../service/modal.service";
import {ErrorService} from "../../../service/error.service";

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./../authentication-form/authentication-form.component.scss']
})
export class RegistrationFormComponent implements OnInit {

  @Input() title!: string;
  hide = true;
  success = true;
  errorMessage = '';
  loading = false;
  registerResponse!: RegisterResponse;

  registerSubscription$!: Subscription;
  errorSubscription$!: Subscription;

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(255)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
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
    if (this.registerSubscription$ != undefined) {
      this.registerSubscription$.unsubscribe();
    }
    if (this.errorSubscription$ != undefined) {
      this.errorSubscription$.unsubscribe();
    }
  }

  get username(): FormControl {
    return this.form.controls.username;
  }

  get email(): FormControl {
    return this.form.controls.email;
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

  get emailErrorMessage(): string {
    if (this.form.controls.email.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.form.controls.email.hasError('email')) {
      return 'Wrong email format';
    }
    return this.form.controls.email
      .hasError('maxlength') ? 'Email must contain no more than 255 characters' : '';
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
    return this.usernameErrorMessage == '' &&
      this.emailErrorMessage == '' &&
      this.passwordErrorMessage == '';
  }

  retryInput(): void {
    this.success = true;
  }

  submit(): void {
    if (this.successValidation()) {
      this.loading = true;
      this.success = true;
      this.errorMessage = '';
      let registerProcess = true;

      this.registerSubscription$ = this.authenticationService.register({
        username: this.username.value,
        password: this.password.value,
        email: this.email.value
      }).subscribe(registerResponse => {
        this.registerResponse = registerResponse;
        this.errorService.clear();
      });

      this.errorSubscription$ = this.errorService.error$.subscribe(error => {
        this.loading = false;
        if (error != '') {
          this.errorMessage = error;
          this.success = false;
        } else if (registerProcess) {
          registerProcess = false;
          if (this.registerResponse.existsByUsername) {
            this.errorMessage = 'This username is already taken';
            this.success = false;
            return;
          }
          if (this.registerResponse.existsByEmail) {
            this.errorMessage = 'User with this email already exists';
            this.success = false;
            return;
          }
          this.authenticationContextService.login({
            token: this.registerResponse.token,
            id: this.registerResponse.id
          });
          this.errorService.clear();
          this.modalService.hideForm();
        }
      });
    }
  }
}
