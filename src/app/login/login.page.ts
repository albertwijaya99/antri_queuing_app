import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FirebaseAuthService} from '../firebase-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  constructor(private firebaseAuthService: FirebaseAuthService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.email, Validators.required]
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.minLength(8), Validators.required]
      })
    });
  }
  SignIn(){
    this.firebaseAuthService.signIn(this.loginForm.value.email , this.loginForm.value.password);
  }
}
