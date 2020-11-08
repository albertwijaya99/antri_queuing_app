import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';

@Component({
  selector: 'app-my-qr',
  templateUrl: './my-qr.page.html',
  styleUrls: ['./my-qr.page.scss'],
})
export class MyQRPage implements OnInit {

  constructor(
      private menuCtrl: MenuController
  ) { }

  ngOnInit() {
  }
  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }

}
