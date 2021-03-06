import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DrankListComponent } from './drank/pages/drank-list/drank-list.component';

const routes: Routes = [
  {
    path: 'drank',
    loadChildren: () => import('./drank/drank.module').then(m => m.DrankModule)
  },
  {
    path: 'drank-type',
    loadChildren: () => import('./drank-type/drank-type.module').then(m => m.DrankTypeModule)
  },
  {
    path: 'bestellingen',
    loadChildren: () => import('./order/order.module').then(m => m.OrderModule)
  },
  {
    path: 'instellingen',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoefRoutingModule { }
