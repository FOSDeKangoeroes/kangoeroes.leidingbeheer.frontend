import { Component, OnInit } from '@angular/core';
import { FieldComponentBase } from '../field-component-base';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'kangoeroe-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent extends FieldComponentBase implements OnInit  {

  constructor() {
    super();
   }

  ngOnInit() {
  }

}