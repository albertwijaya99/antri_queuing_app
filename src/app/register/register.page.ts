import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FirebaseAuthService} from '../firebase-auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  constructor(private firebaseAuthService: FirebaseAuthService) { }

  ngOnInit() {
    this.registerForm = new FormGroup({
      name: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.email , Validators.required]
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.minLength(8) , Validators.required]
      }),
      confirmPassword: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.minLength(8) , Validators.required]
      })
    });
  }

  checkMatchingPassword(){
    if (this.registerForm.value.password === this.registerForm.value.confirmPassword){
      this.registerForm.controls.confirmPassword.setErrors(null);
      this.registerToFirebase(this.registerForm.value.name , this.registerForm.value.email , this.registerForm.value.password);
    }
    else {
      this.registerForm.controls.confirmPassword.setErrors({notMatched: true});
    }
  }
  registerToFirebase(nama: string , email: string, password: string){
    this.firebaseAuthService.signUp(nama , email, password);
  }
}
