import {Component, Injectable, NgModule} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {AngularFireDatabase,AngularFireList, AngularFireObject} from '@angular/fire/database';
import {LoadingController, ToastController} from '@ionic/angular';
import {Observable} from "rxjs";
import {DatePipe} from "@angular/common";

@Injectable({
  providedIn: 'root',
})

export class FirebaseAuthService {
  loading = null;
  localStorageUser : any;
  localStorageUserDB : any;
  queueList: AngularFireList<any>;
  constructor(
      public firebaseAuth: AngularFireAuth,
      public firebaseDB: AngularFireDatabase,
      private router: Router,
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      private datePipe: DatePipe
  ) { }
  async signIn(email: string, password: string){
      await this.presentLoading().then(() => {
          this.firebaseAuth.signInWithEmailAndPassword(email, password)
              .then(res => {
                  if (res.user.emailVerified){
                      localStorage.setItem('user', JSON.stringify(res.user));
                      //set data on firebase realtime database to localstorage
                      this.firebaseDB.database.ref('Users/'+res.user.uid).once('value').then((snapshot) => {
                          localStorage.setItem('userDB',JSON.stringify(snapshot.val()));
                      });
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
                  const msg = 'Wrong email or password.';
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
                  host_name: name,
                  guest_name : name,
              });
              await this.sendVerificationEmail();
              this.loading.dismiss();
          })
          .catch(error => {
              const color = 'danger';
              this.presentToast(error.message, color);
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
    async addMeToQueueList(HostUID){
        this.localStorageUser = JSON.parse(localStorage.getItem('user'));
        this.localStorageUserDB = JSON.parse(localStorage.getItem('userDB'));
        var currentDate = new Date();
        var dateString = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
        var refPath = 'Queue/'+dateString+'/'+HostUID;
        this.firebaseDB.database.ref(refPath).once('value').then((snapshot) => {
            var lastQueue = snapshot.numChildren()+1;
            this.firebaseDB.database.ref('User/'+this.localStorageUser.uid).once('value').then((snapshot) => {
                localStorage.setItem('user2',JSON.stringify(snapshot.val()));
            });
            var QueueTime = this.datePipe.transform(currentDate, 'HH:mm:ss');
            this.firebaseDB.database.ref(refPath+'/'+lastQueue).set({
                name: this.localStorageUserDB.guest_name,
                status: "waiting",
                email: this.localStorageUser.email,
                time: QueueTime
            });
        });
    }
    getAllWaitingQueueList(HostUID){

        var currentDate = new Date();
        // var dateString = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
        var dateString = '2020-11-30';
        var refPath = 'Queue/'+dateString+'/'+HostUID;
        this.queueList = this.firebaseDB.list(refPath);
        return this.queueList;

    }


}
