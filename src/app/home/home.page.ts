import {Component, OnInit} from '@angular/core';
import {AlertController, LoadingController, MenuController, ToastController} from '@ionic/angular';
import {FirebaseAuthService} from '../firebase-auth.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {Observable} from 'rxjs';
import {Route, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {AngularFireDatabase} from '@angular/fire/database';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [DatePipe]
})
export class HomePage implements OnInit{
  user: Observable<any>;
  i: number;
  uid: string;
  guestName: string;
  localStorageUserDB: any;
  localStorageUser: any;
  hostUID: string;
  lastQueue: number;
  myQ = [];
  currentDate = new Date();
  dateString = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');
  refPath = 'Queue/' + this.dateString;
  constructor(
      private menuCtrl: MenuController,
      private firebaseAuthService: FirebaseAuthService,
      public firebaseDB: AngularFireDatabase,
      private router: Router,
      private datePipe: DatePipe,
      private alertCtrl: AlertController,
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      private localNotifications: LocalNotifications,
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
          this.guestName = (snapshot.val().guest_name);
        });
      }
      else {
        this.router.navigate(['/login']);
      }
    });
  }


    async ionViewWillEnter(){
        await this.getMyQueue();
        this.localStorageUser = JSON.parse(localStorage.getItem('user'));
        const email = this.localStorageUser.email;
        for (const Q of this.myQ) {
            console.log(this.myQ);
            this.firebaseDB
                .database
                .ref('Queue/' + Q[3] + '/')
                .on('child_changed', (snap => {
                    snap.forEach((currQueueList => {
                        console.log(currQueueList.val().notified);
                        if (currQueueList.val().email === email && currQueueList.val().notified === 'yes') {
                            this.presentLocalNotifications(currQueueList.ref.parent.key , currQueueList.key, Q[5]);
                            console.log('notification sent');
                        }
                    }));
                    location.reload();
                }));
        }
    }
    presentLocalNotifications(Hid,id, Hname){
        this.localNotifications.schedule({
            id: 1,
            title: 'Calling',
            text: 'Kakak, dipanggil sama '+Hname+' tuh!',
            sound: 'file://beep.caf',
            icon: 'url(../../assets/img/logo3.png)',

        });

        this.firebaseAuthService.firebaseDB.object(this.refPath + '/' + Hid + '/' + id).update({
            notified: 'no'
        });
    };
    async getMyQueue() {
        const myQ = [];
        let i = 0;
        let nowQ;
        let qNumber;
        let hostId;
        let hostName;
        let qDate;
        this.localStorageUserDB = JSON.parse(localStorage.getItem('userDB'));
        const userName = this.localStorageUserDB.email;
        await this.firebaseDB
            .database
            .ref('Queue')
            .once('value', function(date) {
                date.forEach(function(hid) {
                    hid.forEach(function(queueNumber) {
                        queueNumber.forEach(function(user) {
                            if (user.val().email === userName && ['current', 'waiting'].includes(user.val().status)) {
                                qNumber = user.key;
                                hostId = user.ref.parent.key;
                                qDate = user.ref.parent.parent.key;
                            }
                        });
                        queueNumber.forEach(function(user) {
                            if (user.val().status === 'current' && user.ref.parent.key === hostId) {
                                nowQ = user.key;
                            }
                        });

                        if (qNumber != null && hostId != null){
                            if (nowQ === null){
                                nowQ = 0;
                            }
                            myQ.push([qNumber, hostId, nowQ, qDate, i]);
                            i++;
                            qNumber = null;
                            hostId = null;
                            nowQ = null;
                        }
                    });
                });
            });
        for (const q of myQ) {
            await this.firebaseDB
                .database
                .ref('Users')
                .child(q[1])
                .once('value', function(snaps) {
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
    this.presentDeleteLoading().then(() => {
        const userName = this.localStorageUserDB.email;
        this.firebaseDB
            .database
            .ref('Queue')
            .once('value', function(date) {
                date.forEach(function(hid) {
                    hid.forEach(function(queueNumber) {
                        if (queueNumber.key === hostID) {
                            queueNumber.forEach(function(user) {
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
        this.presentDeleteToast();
    });
  }

    async presentDeleteToast() {
        const toast = await this.toastCtrl.create({
            message: 'Queue deleted.',
            duration: 2000,
            color: 'success'
        });
        await toast.present();
    }

    async presentDeleteAlert(id: string, qNumber: number) {
        const alert = await this.alertCtrl.create({
            header: 'Are you sure want to delete this queue?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Delete',
                    handler: () => this.deleteQ(id, qNumber),
                }
            ]
        });
        await alert.present();
    }

    async presentDeleteLoading() {
        const loading = await this.loadingCtrl.create({
            message: 'Deleting queue...',
            duration: 500
        });
        await loading.present();
        const {role, data} = await loading.onDidDismiss();
        console.log('Loading dismissed');
    }

}
