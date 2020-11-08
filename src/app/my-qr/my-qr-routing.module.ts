import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyQRPage } from './my-qr.page';

const routes: Routes = [
  {
    path: '',
    component: MyQRPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyQRPageRoutingModule {}
