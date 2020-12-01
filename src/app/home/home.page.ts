import { Component } from '@angular/core';
import {MenuController} from '@ionic/angular';
import {FirebaseAuthService} from "../firebase-auth.service";
import {AngularFireAuth} from "@angular/fire/auth";
import {Observable} from "rxjs";
import {Route, Router} from "@angular/router";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [DatePipe]
})
export class HomePage {
  user: Observable<any>;
  uid: String;
  guest_name : String;
   currentDate: Date;
   dateString: String;
   hostUID: String;
   refPath: string;
   lastQueue : number;
  constructor(
      private menuCtrl: MenuController,
      private firebaseAuthService: FirebaseAuthService,
      private router: Router,
      private datePipe: DatePipe
  ) {}

  ngOnInit(){
    this.user = this.firebaseAuthService.firebaseAuth.authState;
    this.user.subscribe((user) => {
      if (user) {
        if (localStorage.getItem('user') == null || localStorage.getItem('userDB') == null) {
          this.router.navigate(['/login']);
        }
        this.uid = user.uid;
        this.firebaseAuthService.firebaseDB.database.ref('/Users/' + this.uid).once('value').then((snapshot) => {
          this.guest_name = (snapshot.val().guest_name);
        });
      }
      else {
        this.router.navigate(['/login']);
      }
    });
  }

  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }
}
