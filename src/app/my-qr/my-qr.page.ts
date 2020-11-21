import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';
import QRCodeStyling from 'qr-code-styling';

@Component({
  selector: 'app-my-qr',
  templateUrl: './my-qr.page.html',
  styleUrls: ['./my-qr.page.scss'],
})
export class MyQRPage implements OnInit {
  qrCode: any;
  user: any;
  constructor(
      private menuCtrl: MenuController,
  ) { }

  ngOnInit() {
      if (localStorage.getItem('user') !== null) {
          this.user = JSON.parse(localStorage.getItem('user'));
      }
      this.qrCode = new QRCodeStyling({
          width: 300,
          height: 300,
          data: this.user.email,
          image: 'assets/img/logo2.png',
          dotsOptions: {
              color: '#d83016',
              type: 'rounded'
          },
          backgroundOptions: {
              color: '#fff4f4',
          }
      });
      this.qrCode.append(document.getElementById('canvas'));
  }
  downloadQr() {
    this.qrCode.download({
      name: 'Antri_QR_Code',
      extension: 'png'
    });
  }
  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }
}
