import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyQRPageRoutingModule } from './my-qr-routing.module';

import { MyQRPage } from './my-qr.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyQRPageRoutingModule
  ],
  declarations: [MyQRPage]
})
export class MyQRPageModule {}
