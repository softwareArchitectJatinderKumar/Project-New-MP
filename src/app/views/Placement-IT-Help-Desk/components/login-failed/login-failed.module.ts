import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFailedComponent } from './login-failed.component';

@NgModule({
  declarations: [LoginFailedComponent],
  imports: [
    CommonModule
  ],
  exports: [LoginFailedComponent]
})
export class LoginFailedComponentModule { }