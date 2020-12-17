import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';
import {FirebaseAuthService} from '../firebase-auth.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AngularFireDatabase} from '@angular/fire/database';


@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  user: Observable<any>;
  localStorageUser = JSON.parse(localStorage.getItem('user'));
  localStorageUserDB: any;
  uid = this.localStorageUser.uid;
  guestQ = [];
  hostQ = [];
  private active: any;
  constructor(
      private menuCtrl: MenuController,
      private firebaseAuthService: FirebaseAuthService,
      public firebaseDB: AngularFireDatabase,
      private router: Router,
  ) { }
  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }
  ngOnInit(){
    // get name from firebase + check session
    this.user = this.firebaseAuthService.firebaseAuth.authState;
    this.user.subscribe((user) => {
      if (user) {
        if (localStorage.getItem('user') == null || localStorage.getItem('userDB') == null) {
          this.router.navigate(['/login']);
        }
        this.uid = user.uid;
      }
      else {
        this.router.navigate(['/login']);
      }
    });
  }

  async ionViewWillEnter(){
    await this.getHistory();
  }

  async getHistory() {
    const guestQ = [];
    const hostQ = [];
    let i = 0;
    const dateList = [];
    this.localStorageUserDB = JSON.parse(localStorage.getItem('userDB'));
    // const uid = this.uid;
    // const userName = this.localStorageUserDB.email;
    const userName = 'steven.wijaya2@student.umn.ac.id';
    const uid = 'C4StgSlQc7NXb33VGTPalmLpVju2';
    await this.firebaseDB
        .database
        .ref('Queue')
        .once('value', function(date) {
          date.forEach(function(hid) {
            hid.forEach(function(queueNumber) {
              if (queueNumber.key === uid) {
                queueNumber.forEach(function (user){
                  if (dateList.includes(user.ref.parent.parent.key)) {
                    // continue
                    return false;
                  }
                  dateList.push(user.ref.parent.parent.key);
                });
              }
              queueNumber.forEach(function(user) {
                if (user.val().email === userName) {
                  const hostId = user.ref.parent.key;
                  const qDate = user.ref.parent.parent.key;
                  const qTime = user.val().time;
                  const status = user.val().status;
                  guestQ.push([hostId, qDate, qTime, i, status]);
                  i++;
                }
              });
            });
          });
        });
    for (const q of guestQ) {
      await this.firebaseDB
          .database
          .ref('Users')
          .child(q[0])
          .once('value', function(snaps) {
            const hostName = snaps.val().host_name;
            q.push(hostName);
          });
    }
    for (const d of dateList) {
      hostQ.push([d]);
    }
    for (const h of hostQ) {
      await this.firebaseDB
          .database
          .ref('Queue')
          .child(h[0])
          .child(uid)
          .once('value', function (snaps) {
            let done = 0;
            let cancelled = 0;
            let total = 0;
            snaps.forEach(function (user) {
              if (user.val().status === 'done') {
                done++;
              } else if (user.val().status === 'cancelled') {
                cancelled++;
              }
              total++;
            });
            h.push(done, cancelled, total);
          });
    }
    this.hostQ = hostQ;
    this.guestQ = guestQ;
  }

  updateActive(active) {
    this.active = active;
  }
}
