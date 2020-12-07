import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController, MenuController, ToastController} from '@ionic/angular';
import {FirebaseAuthService} from "../firebase-auth.service";
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {DatePipe} from "@angular/common";
import {snapshotChanges} from "@angular/fire/database";
import {async} from "@angular/core/testing";
import {queue} from "rxjs/internal/scheduler/queue";
import {FormGroup, NgForm} from "@angular/forms";

@Component({
  selector: 'app-host',
  templateUrl: './host.page.html',
  styleUrls: ['./host.page.scss'],
  providers: [DatePipe]
})
export class HostPage implements OnInit {
  user: Observable<any>;
  host_name : String;
  localStorageUser = JSON.parse(localStorage.getItem('user'));
  uid = this.localStorageUser.uid;
  queueList = []; //contain queue list (waiting)
  nowQueueList = []; //contain current queue
  totalQueue: any;
  currentDate = new Date();
  dateString = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');
  //dateString = '2020-12-04';
  refPath = 'Queue/'+this.dateString+'/'+this.uid;
  constructor(
      private menuCtrl: MenuController,
      private firebaseAuthService: FirebaseAuthService,
      private router: Router,
      private datePipe: DatePipe,
      private alertCtrl: AlertController,
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
  ) { }

  ngOnInit(){
    //get name from firebase + check session
    this.user = this.firebaseAuthService.firebaseAuth.authState;
    this.user.subscribe((user) => {
      if (user) {
        if (localStorage.getItem('user') == null || localStorage.getItem('userDB') == null) {
          this.router.navigate(['/login']);
        }
        this.uid = user.uid;
        this.firebaseAuthService.firebaseDB.database.ref('/Users/' + this.uid).once('value').then((snapshot) => {
          this.host_name = (snapshot.val().host_name);
        });
      }
      else {
        this.router.navigate(['/login']);
      }
    });
  }

  ionViewWillEnter(){
    this.queueList = [];
    this.nowQueueList = [];
    this.getTotalQueue();
  }


  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }

  getQueueList(){
    for(let i = 1; i<= this.totalQueue; i++){
      this.firebaseAuthService.firebaseDB.database.ref(this.refPath+'/'+i).once('value').then((snapshot => {
        if(snapshot.exists() &&  snapshot.val().status == "waiting"){
          var queueTemp = new Array();
          queueTemp['queueNumber']  = snapshot.key;
          queueTemp['email'] = snapshot.val().email;
          queueTemp['name'] = snapshot.val().name;
          queueTemp['time'] = snapshot.val().time;
          queueTemp['date'] = this.dateString;
          this.queueList.push(queueTemp);
        }
        else if(snapshot.exists() &&  snapshot.val().status == "current"){
          var queueTemp = new Array();
          queueTemp['queueNumber']  = snapshot.key;
          queueTemp['email'] = snapshot.val().email;
          queueTemp['name'] = snapshot.val().name;
          queueTemp['time'] = snapshot.val().time;
          queueTemp['date'] = this.dateString;
          this.nowQueueList.push(queueTemp);
          console.log(this.nowQueueList);
        }
      }))
    }
  }

  getTotalQueue(){
    this.firebaseAuthService.firebaseDB.database.ref(this.refPath).once('value').then((snapshot => {
      this.totalQueue = snapshot.numChildren();
      this.getQueueList();
    }))
  }

  cancelQueueButton(index){
    this.presentDeleteLoading().then(() => {
      this.firebaseAuthService.firebaseDB.object(this.refPath+'/'+index).update({
        status: "cancelled"
      });
        this.ionViewWillEnter();
        this.presentDeleteToast();
    });
  }
  
  nextQueueButton(index){
    this.presentDoneLoading().then(() => {
      if(this.nowQueueList.length>0){
        this.firebaseAuthService.firebaseDB.object(this.refPath+'/'+this.nowQueueList[0]['queueNumber']).update({
          status: "done"
        })
      }

      this.firebaseAuthService.firebaseDB.object(this.refPath+'/'+index).update({
        status: "current"
      })
      this.ionViewWillEnter();
      this.presentDoneToast();
    });
  }

  submitNewHostNameForm(newName: String){
    this.presentNewHostNameLoading().then(() => {
      this.firebaseAuthService.firebaseDB.object('Users/'+this.uid).update({
        host_name: newName
      })
      this.ngOnInit()
      this.presentNewHostNameToast();
    });
  }

  async presentNewHostNameToast() {
    const toast = await this.toastCtrl.create({
      message: 'Name saved.',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  async presentNewHostNameAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Change Host Name',
      inputs: [
        {
          name: 'HostName',
          id: 'newHostName',
          type: 'text',
          placeholder: 'New Host Name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: data => this.submitNewHostNameForm(data['HostName']),
        }
      ]
    });
    await alert.present();
  }

  async presentNewHostNameLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Saving new host name...',
      duration: 500
    });
    await loading.present();
    const {role, data} = await loading.onDidDismiss();
    console.log('Loading dismissed');
  }

  async presentNotifToast() {
    const toast = await this.toastCtrl.create({
      message: 'Costumer have been notify',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  async presentNotifAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Are you sure want to notify the costumer?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Notify',
          handler: () => console.log('notify'),
        }
      ]
    });
    await alert.present();
  }

  async presentNotifLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Notifying the costumer...',
      duration: 500
    });
    await loading.present();
    const {role, data} = await loading.onDidDismiss();
    console.log('Loading dismissed');
  }

  async presentDeleteToast() {
    const toast = await this.toastCtrl.create({
      message: 'Queue deleted.',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  async presentDeleteAlert(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Are you sure want to delete this queue?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => this.cancelQueueButton(id),
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

  async presentDoneToast() {
    const toast = await this.toastCtrl.create({
      message: 'Queue updated.',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  async presentDoneAlert(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Are you sure want to update this queue?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Update',
          handler: () => this.nextQueueButton(id),
        }
      ]
    });
    await alert.present();
  }

  async presentDoneLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Updating queue...',
      duration: 500
    });
    await loading.present();
    const {role, data} = await loading.onDidDismiss();
    console.log('Loading dismissed');
  }

}
