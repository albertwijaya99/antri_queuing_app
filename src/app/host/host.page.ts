import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';
import {FirebaseAuthService} from "../firebase-auth.service";
import {Router} from "@angular/router";
import {Observable} from "rxjs";

@Component({
  selector: 'app-host',
  templateUrl: './host.page.html',
  styleUrls: ['./host.page.scss'],
})
export class HostPage implements OnInit {
  user: Observable<any>;
  uid: String;
  host_name : String;
  constructor(
      private menuCtrl: MenuController,
      private firebaseAuthService: FirebaseAuthService,
      private router: Router
  ) { }

  ngOnInit(){
    this.user = this.firebaseAuthService.firebaseAuth.authState;
    this.user.subscribe((user) => {
      if (user) {
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
  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }

}
