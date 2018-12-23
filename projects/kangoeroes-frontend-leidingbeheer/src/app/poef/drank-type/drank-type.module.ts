import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DrankTypeRoutingModule } from './drank-type-routing.module';
import { DrankTypeListComponent } from './pages/drank-type-list/drank-type-list.component';
import { DrankTypeTableComponent } from './components/drank-type-table/drank-type-table.component';
import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';
import { SearchBarModule } from 'projects/kangoeroes-frontend-core/src/lib/components/search-bar/search-bar.module';

@NgModule({
  declarations: [DrankTypeListComponent, DrankTypeTableComponent],
  imports: [
    CommonModule,
    DrankTypeRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    SearchBarModule
  ]
})
export class DrankTypeModule { }