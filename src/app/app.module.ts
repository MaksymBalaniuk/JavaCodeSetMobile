import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CodeBlockPaginatorPipe } from './pipe/code-block-paginator.pipe';
import { DateFormatterPipe } from './pipe/date-formatter.pipe';
import { CodeBlockTimeSortPipe } from './pipe/code-block-time-sort.pipe';
import { NavigationBarComponent } from './component/ui/navigation-bar/navigation-bar.component';
import {HttpClientModule} from "@angular/common/http";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import { NoResultsComponent } from './component/ui/no-results/no-results.component';
import { SearchComponent } from './component/ui/search/search.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatPaginatorModule} from "@angular/material/paginator";
import { CodeBlockCardComponent } from './component/ui/code-block-card/code-block-card.component';
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import { MainPageComponent } from './component/page/main-page/main-page.component';
import {MatTabsModule} from "@angular/material/tabs";
import { ModalComponent } from './component/ui/modal/modal.component';
import { AuthenticationFormComponent } from './component/ui/authentication-form/authentication-form.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import { RegistrationFormComponent } from './component/ui/registration-form/registration-form.component';
import { CommentComponent } from './component/ui/comment/comment.component';
import {CodeBlockViewComponent} from "./component/ui/code-block-view/code-block-view.component";
import {ClipboardModule} from "ngx-clipboard";
import { CodeHighlightDirective } from './directive/code-highlight.directive';
import {MatExpansionModule} from "@angular/material/expansion";
import { CommentTimeSortPipe } from './pipe/comment-time-sort.pipe';
import { CodeBlockEditComponent } from './component/ui/code-block-edit/code-block-edit.component';
import { CodeBlockPageComponent } from './component/page/code-block-page/code-block-page.component';
import {CompilerPageComponent} from "./component/page/compiler-page/compiler-page.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { PremiumPageComponent } from './component/page/premium-page/premium-page.component';
import { ShareFormComponent } from './component/ui/share-form/share-form.component';
import {MatSelectModule} from "@angular/material/select";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { ProfilePageComponent } from './component/page/profile-page/profile-page.component';
import { ProfileCardComponent } from './component/ui/profile-card/profile-card.component';
import { UpdateProfileFormComponent } from './component/ui/update-profile-form/update-profile-form.component';

@NgModule({
  declarations: [
    AppComponent,
    CodeBlockPaginatorPipe,
    DateFormatterPipe,
    CodeBlockTimeSortPipe,
    NavigationBarComponent,
    NoResultsComponent,
    SearchComponent,
    CodeBlockCardComponent,
    MainPageComponent,
    ModalComponent,
    AuthenticationFormComponent,
    RegistrationFormComponent,
    CommentComponent,
    CodeBlockViewComponent,
    CodeHighlightDirective,
    CommentTimeSortPipe,
    CodeBlockEditComponent,
    CodeBlockPageComponent,
    CompilerPageComponent,
    PremiumPageComponent,
    ShareFormComponent,
    ProfilePageComponent,
    ProfileCardComponent,
    UpdateProfileFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    ClipboardModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
