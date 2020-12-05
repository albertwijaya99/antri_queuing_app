import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FirebaseAuthService} from '../firebase-auth.service';
import {ToastController} from "@ionic/angular";
import {isEmpty} from "rxjs/operators";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  constructor(
      private firebaseAuthService: FirebaseAuthService,
      private toastCtrl: ToastController
  ) { }

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
  check(){
    if (this.registerForm.value.name === null){
      this.ToastUsername();
    }  else if (this.registerForm.value.email === null){
      this.ToastEmail();
    } else if (this.registerForm.value.password === this.registerForm.value.confirmPassword){
      this.registerToFirebase(this.registerForm.value.name , this.registerForm.value.email , this.registerForm.value.password);
    } else {
      this.Toastpassnotmatch();
    }
  }
  registerToFirebase(nama: string , email: string, password: string){
    this.firebaseAuthService.signUp(nama , email, password);
    this.registerForm.reset();
  }
  async ToastUsername() {
    const toast = await this.toastCtrl.create({
      message: 'Username is empty',
      duration: 2000
    });
    await toast.present();
    const {role, data} = await toast.onDidDismiss();
    console.log('loading dismissed!');
  }
  async ToastEmail() {
    const toast = await this.toastCtrl.create({
      message: 'email is empty',
      duration: 2000
    });
    await toast.present();
    const {role, data} = await toast.onDidDismiss();
    console.log('loading dismissed!');
  }
  async Toastpassnotmatch() {
    const toast = await this.toastCtrl.create({
      message: 'password and re-password does not match up',
      duration: 2000
    });
    await toast.present();
    const {role, data} = await toast.onDidDismiss();
    console.log('loading dismissed!');
  }

}
