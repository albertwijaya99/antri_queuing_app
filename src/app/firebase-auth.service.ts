import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {AngularFireDatabase} from '@angular/fire/database';
import {LoadingController, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  isLoggedIn = false;
  loading = null;
  constructor(
      public firebaseAuth: AngularFireAuth,
      private firebaseDB: AngularFireDatabase,
      private router: Router,
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController
  ) { }
  async signIn(email: string, password: string){
      await this.presentLoading().then(() => {
          this.firebaseAuth.signInWithEmailAndPassword(email, password)
              .then(res => {
                  this.isLoggedIn = true;
                  localStorage.setItem('user', JSON.stringify(res.user));
                  if (res.user.emailVerified){
                      this.router.navigate(['/home']);
                      const msg = 'Logged in!';
                      const color = 'success';
                      this.presentToast(msg, color);
                  }
                  else {
                      const msg = 'Please verify your email.';
                      const color = 'warning';
                      this.presentToast(msg, color);
                  }
                  this.loading.dismiss();
              })
              .catch(() => {
                  const msg = 'Wrong email or password';
                  const color = 'danger';
                  this.presentToast(msg, color);
                  this.loading.dismiss();
              });
      });
  }
  async signUp(name: string , email: string, password: string){
      await this.presentLoading().then(() => {
          this.firebaseAuth.createUserWithEmailAndPassword(email, password)
          .then(async resSignUp => {
              const path = 'Users/' + resSignUp.user.uid;
              await this.firebaseDB.object(path).set({
                  email,
                  name,
              });
              await this.sendVerificationEmail();
              this.loading.dismiss();
          })
          .catch(() => {
              const msg = 'Something went wrong. Please try again.';
              const color = 'danger';
              this.presentToast(msg, color);
              this.loading.dismiss();
          });
      });
  }
  sendVerificationEmail(){
      return this.firebaseAuth.currentUser.then(u => u.sendEmailVerification())
          .then(() => {
              this.router.navigate(['/login']);
              const msg = 'Please Verify your email.';
              const color = 'primary';
              this.presentToast(msg, color);
          })
          .catch(() => {
              const msg = 'Something went wrong. Please try again.';
              const color = 'danger';
              this.presentToast(msg, color);
          });
  }
  async signOut(){
      return this.firebaseAuth.signOut()
          .then(() => {
              this.router.navigate(['/login']);
              const msg = 'Logged out!';
              const color = 'success';
              this.presentToast(msg, color);
          })
          .catch(() => {
              const msg = 'Something went wrong. Please try again.';
              const color = 'danger';
              this.presentToast(msg, color);
          });
  }
  async sendResetEmail(email: string) {
      await this.presentLoading().then(() => {
          this.firebaseAuth.sendPasswordResetEmail(email)
              .then(() => {
                  this.router.navigate(['/login']);
                  const msg = 'Password reset link has been sent to your email.';
                  const color = 'success';
                  this.presentToast(msg, color);
                  this.loading.dismiss();
              })
              .catch(() => {
                  this.router.navigate(['/login']);
                  const msg = 'No email found. Please try again.';
                  const color = 'danger';
                  this.presentToast(msg, color);
                  this.loading.dismiss();
              });
      });
  }
    private async presentToast(msg, color) {
        const toast = await this.toastCtrl.create({
            message: msg,
            color,
            duration: 2000
        });
        await toast.present();
    }
    private async presentLoading() {
        this.loading = await this.loadingCtrl.create({
            cssClass: 'my-custom-class',
            message: 'Please wait...',
        });
        await this.loading.present();
    }
}
