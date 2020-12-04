import {Component, OnInit} from '@angular/core';
import {MenuController} from '@ionic/angular';
import {FirebaseAuthService} from "../firebase-auth.service";
import {AngularFireAuth} from "@angular/fire/auth";
import {Observable} from "rxjs";
import {Route, Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {AngularFireDatabase} from "@angular/fire/database";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [DatePipe]
})
export class HomePage implements OnInit{
  user: Observable<any>;
  uid: String;
  guest_name : String;
  localStorageUserDB : any;
   currentDate: Date;
   dateString: String;
   hostUID: String;
   refPath: string;
   lastQueue : number;
   myQ = [];
  constructor(
      private menuCtrl: MenuController,
      private firebaseAuthService: FirebaseAuthService,
      public firebaseDB: AngularFireDatabase,
      private router: Router,
      private datePipe: DatePipe
  ) {}

  ngOnInit() {
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

    async ionViewWillEnter(){
        this.myQ = [];
        await this.getMyQueue();
    }

    async getMyQueue() {
        const myQ = [];
        let nowQ;
        let qNumber;
        let hostId;
        let hostName;
        this.localStorageUserDB = JSON.parse(localStorage.getItem('userDB'));
        const userName = this.localStorageUserDB.email;
        await this.firebaseDB
            .database
            .ref('Queue')
            .once('value', function (date) {
                date.forEach(function (hid) {
                    hid.forEach(function (queueNumber) {
                        queueNumber.forEach(function (user) {
                            if (user.val().email === userName && user.val().status !== 'cancelled') {
                                qNumber = user.key;
                                hostId = user.ref.parent.key;
                            }
                        });
                        queueNumber.forEach(function (user) {
                            if (user.val().status === 'current' && user.ref.parent.key === hostId) {
                                nowQ = user.key;
                            }
                        });
                        if (qNumber && hostId && nowQ){
                            myQ.push([qNumber, hostId, nowQ]);
                        }
                    });
                });
            });
        for (const q of myQ) {
            await this.firebaseDB
                .database
                .ref('Users')
                .child(q[1])
                .once('value', function (snaps) {
                    hostName = snaps.val().host_name;
                    q.push(hostName);
                });
        }
        this.myQ = myQ;
    }

  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }

  async deleteQ(hostID, qNumber){
    const userName = this.localStorageUserDB.email;
    await this.firebaseDB
        .database
        .ref('Queue')
        .once('value', function (date) {
          date.forEach(function (hid) {
            hid.forEach(function (queueNumber) {
              if (queueNumber.key === hostID){
               queueNumber.forEach(function (user) {
                 if (user.key === qNumber) {
                    console.log(user.val().status);
                    user.ref.update({
                        status: 'cancelled'
                    });
                  }
                });
              }
            });
          });
        });
  }
}
