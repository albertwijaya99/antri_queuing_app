import { Component, OnInit } from '@angular/core';
import {FirebaseAuthService} from '../firebase-auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;
  constructor(private firebaseAuthService: FirebaseAuthService) { }

  ngOnInit() {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.email, Validators.required]
      })
    });
  }
  sendResetPassword(){
    this.firebaseAuthService.sendResetEmail(this.forgotPasswordForm.value.email);
  }
}
