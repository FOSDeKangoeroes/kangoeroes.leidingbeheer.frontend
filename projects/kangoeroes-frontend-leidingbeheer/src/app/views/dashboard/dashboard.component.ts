import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent {
public amountOfPeople = 69;
public amountOfOrders = 100;
  constructor( ) { }

}
