import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  private active: any;
  constructor(
      private menuCtrl: MenuController
  ) {
}
  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }
  ngOnInit() {
  }

  updateActive(active) {
    this.active = active;
  }
}
