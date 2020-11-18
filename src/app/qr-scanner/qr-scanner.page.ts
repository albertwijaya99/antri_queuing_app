import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import {ToastController} from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'],
})
export class QrScannerPage implements OnInit {

  constructor(
      private barcodeScanner: BarcodeScanner,
      private toastCtrl: ToastController,
      private router: Router
  ) { }

  ngOnInit() {
    this.barcodeScanner.scan({
      preferFrontCamera : false, // iOS and Android
      prompt : 'Place a barcode inside the scan area', // Android
      formats : 'QR_CODE', // default: all but PDF_417 and RSS_EXPANDED
      disableAnimations : true, // iOS
      disableSuccessBeep: false // iOS and Android
    }).then(barcodeData => {
      console.log('Barcode data', barcodeData);
      if (barcodeData.format !== 'QR_CODE' || barcodeData.cancelled) {
        this.router.navigateByUrl('/home');
      } else {
        // code to append user to queuing list
        this.presentToast(barcodeData.text, 'success');
        this.router.navigateByUrl('/home');
      }
    }).catch(err => {
      console.log('Error', err);
    });
  }
  private async presentToast(msg, color) {
    const toast = await this.toastCtrl.create({
      message: msg,
      color,
      duration: 2000
    });
    await toast.present();
  }
}
