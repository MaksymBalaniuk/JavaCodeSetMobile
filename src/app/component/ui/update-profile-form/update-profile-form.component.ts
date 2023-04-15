import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserDetails} from "../../../entity/user-details";
import {AuthenticationResponse} from "../../../dto/authentication-response";
import {Subscription} from "rxjs";
import {AuthenticationContextService} from "../../../service/authentication-context.service";
import {UserService} from "../../../service/api/user.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatSelectChange} from "@angular/material/select";
import {ErrorService} from "../../../service/error.service";
import {ModalService} from "../../../service/modal.service";

@Component({
  selector: 'app-update-profile-form',
  templateUrl: './update-profile-form.component.html',
  styleUrls: ['./../authentication-form/authentication-form.component.scss']
})
export class UpdateProfileFormComponent implements OnInit, OnDestroy {

  @Input() title!: string;
  success = true;
  errorMessage = '';
  loading = false;
  currentUserDetails!: UserDetails;
  authenticationResponse!: AuthenticationResponse;
  userCredentials: string[] = ['Username', 'Email'];

  currentUserDetailsSubscription$!: Subscription;
  updateAuthenticatedUserUsernameSubscription$!: Subscription;
  updateAuthenticatedUserEmailSubscription$!: Subscription;
  errorSubscription$!: Subscription;

  usernameValidators = [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(255)
  ];

  emailValidators = [
    Validators.required,
    Validators.email,
    Validators.maxLength(255)
  ];

  form = new FormGroup({
    selectedUserCredential: new FormControl('Username', [Validators.required]),
    userCredential: new FormControl('', this.usernameValidators)
  });

  constructor(private authenticationContextService: AuthenticationContextService,
              private userService: UserService,
              private errorService: ErrorService,
              private modalService: ModalService) { }

  ngOnInit(): void {
    this.currentUserDetailsSubscription$ = this.authenticationContextService.userDetails$
      .subscribe(userDetails => this.currentUserDetails = userDetails);
  }

  ngOnDestroy() {
    if (this.currentUserDetailsSubscription$ != undefined) {
      this.currentUserDetailsSubscription$.unsubscribe();
    }
    if (this.updateAuthenticatedUserUsernameSubscription$ != undefined) {
      this.updateAuthenticatedUserUsernameSubscription$.unsubscribe();
    }
    if (this.updateAuthenticatedUserEmailSubscription$ != undefined) {
      this.updateAuthenticatedUserEmailSubscription$.unsubscribe();
    }
    if (this.errorSubscription$ != undefined) {
      this.errorSubscription$.unsubscribe();
    }
  }

  get selectedUserCredential(): FormControl {
    return this.form.controls.selectedUserCredential;
  }

  get userCredential(): FormControl {
    return this.form.controls.userCredential;
  }

  get selectedUserCredentialErrorMessage(): string {
    return this.form.controls.userCredential.hasError('required') ? 'You must enter a value' : '';
  }

  get userCredentialErrorMessage(): string {
    if (this.form.controls.userCredential.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.form.controls.userCredential.hasError('email')) {
      return 'Wrong email format';
    }
    if (this.form.controls.userCredential.hasError('minlength')) {
      return 'Username must contain at least 5 characters';
    }
    return this.form.controls.userCredential
      .hasError('maxlength') ? `${this.form.controls.selectedUserCredential.value} ` +
      'must contain no more than 255 characters' : '';
  }

  onSelectedUserCredentialChange(event: MatSelectChange): void {
    const selectedUserCredential: string = event.value;
    if (selectedUserCredential == 'Username') {
      this.form.controls.userCredential = new FormControl('', this.usernameValidators);
    } else if (selectedUserCredential == 'Email') {
      this.form.controls.userCredential = new FormControl('', this.emailValidators);
    }
  }

  successValidation(): boolean {
    return this.userCredentialErrorMessage == '' && this.selectedUserCredentialErrorMessage == '';
  }

  retryInput(): void {
    this.success = true;
  }

  submit(): void {
    if (this.successValidation()) {
      this.loading = true;
      this.success = true;
      this.errorMessage = '';

      const selectedUserCredential = this.form.controls.selectedUserCredential.value;
      const userCredentialValue = this.form.controls.userCredential.value;
      if (this.currentUserDetails != null && userCredentialValue != null) {
        if (selectedUserCredential == 'Username') {
          this.submitUpdateUsername(userCredentialValue);
        } else if (selectedUserCredential == 'Email') {
          this.submitUpdateEmail(userCredentialValue);
        }
      }
    }
  }

  submitUpdateUsername(username: string): void {
    this.updateAuthenticatedUserUsernameSubscription$ = this.userService
      .updateAuthenticatedUserUsername(username, this.currentUserDetails.token)
      .subscribe(authenticationResponse => {
        this.authenticationResponse = authenticationResponse;
        this.errorService.clear();
      });

    this.updateProcessErrorHandling();
  }

  submitUpdateEmail(email: string): void {
    this.updateAuthenticatedUserUsernameSubscription$ = this.userService
      .updateAuthenticatedUserEmail(email, this.currentUserDetails.token)
      .subscribe(authenticationResponse => {
        this.authenticationResponse = authenticationResponse;
        this.errorService.clear();
      });

    this.updateProcessErrorHandling();
  }

  updateProcessErrorHandling(): void {
    let updateProcess = true;

    this.errorSubscription$ = this.errorService.error$.subscribe(error => {
      this.loading = false;
      if (error != '') {
        this.errorMessage = error;
        this.success = false;
      } else if (updateProcess) {
        updateProcess = false;
        this.authenticationContextService.login(this.authenticationResponse);
        this.errorService.clear();
        this.modalService.hideForm();
      }
    });
  }
}
