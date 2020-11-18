import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';
import QRCodeStyling from 'qr-code-styling';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-my-qr',
  templateUrl: './my-qr.page.html',
  styleUrls: ['./my-qr.page.scss'],
})
export class MyQRPage implements OnInit {
  qrCode: any;
  user: any;
  fileTransfer: FileTransferObject = this.transfer.create();

  constructor(
      private menuCtrl: MenuController,
      private transfer: FileTransfer,
      private androidPermissions: AndroidPermissions
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
              type: 'rounded'
          }
      });
      this.qrCode.append(document.getElementById('canvas'));
  }
  downloadQr() {

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
          result => {
              console.log('Has permission?', result.hasPermission);
              if (result.hasPermission) {
                  // code
              } else {
                  this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(res => {
                      if (res.hasPermission) {
                          // code
                      }
                  });
              }
          },
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
      );
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
          result => {
              console.log('Has permission?', result.hasPermission);
              if (result.hasPermission) {
                  // code
              } else {
                  this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(res => {
                      if (res.hasPermission) {
                          // code
                      }
                  });
              }
          },
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
      );

      const canvas = document.getElementsByTagName('canvas');
      const img = canvas[0].toDataURL('asd/png');
      const download = document.createElement('a');
      download.href = img;
      download.download = 'qr.png';
      download.click();
      this.fileTransfer.download(img,  File.externalRootDirectory +  '/Download/qr.png').then((entry) => {
          console.log('download complete: ' + entry.toURL());
      }, (error) => {
          console.log(error);
      });
  }
  async openMenu(){
    await this.menuCtrl.enable(true, 'menu');
    await this.menuCtrl.open('menu');
  }
}
