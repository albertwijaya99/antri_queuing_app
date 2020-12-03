import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';
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
  cancelQueueBUtton(index){
    this.firebaseAuthService.firebaseDB.object(this.refPath+'/'+index).update({
      status: "cancelled"
    })
    this.ionViewWillEnter()
  }
  nextQueueButton(index){
    if(this.nowQueueList.length>0){
      this.firebaseAuthService.firebaseDB.object(this.refPath+'/'+this.nowQueueList[0]['queueNumber']).update({
        status: "done"
      })
    }

    this.firebaseAuthService.firebaseDB.object(this.refPath+'/'+index).update({
      status: "current"
    })
    this.ionViewWillEnter()
  }
  submitNewHostNameForm(form: NgForm){
    this.firebaseAuthService.firebaseDB.object('Users/'+this.uid).update({
      host_name: form.value.newHostName
    })
    form.form.reset();
    this.ngOnInit()
  }


}
