import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import {ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {FirebaseAuthService} from "../firebase-auth.service";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'],
  providers: [DatePipe]
})
export class QrScannerPage implements OnInit {
  private currentDate: Date;
  private currentDateString: String;
  constructor(
      private barcodeScanner: BarcodeScanner,
      private toastCtrl: ToastController,
      private firebaseAuthService: FirebaseAuthService,
      private router: Router,
      private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.currentDate = new Date();
    this.currentDateString = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');

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
        this.firebaseAuthService.addMeToQueueList(barcodeData.text)
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
