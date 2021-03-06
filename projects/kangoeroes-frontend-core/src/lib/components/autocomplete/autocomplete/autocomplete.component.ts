/**
 * Mainly taken from https://github.com/vguleaev/Angular-Material-Autocomplete.
 * Made some modifications here and there.
 */

import {
  AfterViewInit,
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  TemplateRef,
  forwardRef
} from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { FloatLabelType } from '@angular/material/core';

import { HttpParams } from '@angular/common/http';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormControl
} from '@angular/forms';
import { ResourceService } from '../../../data-service/resource-service';
import { Resource } from '../../../data-service/resource-model';
import { QueryOptions } from '../../../data-service/query-options';
import { debounceTime } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'kng-core-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    }
  ]
})
export class AutocompleteComponent<T extends Resource>
  implements AfterViewInit, OnInit, ControlValueAccessor {
  /**
   *  How to use this component:
   *
   *  <ng-mat-autocomplete
   *    placeholder="Search"
   *    [floatLabel]="auto"                          // changes label floating behavior, can be 'always' | 'never' | 'auto'
   *    [minChars] = "2"                             // start fetch items after min chars amount, default is 2
   *    [source]="AutocompleteService | any[]"       // source can be service or array, when array is passed filter is done local
   *    [serviceParams]= "HttpParams"                // sets HttpParams for service fetch function
   *    [doPrefetch]= "false"                        // when active, service do fetch items on init
   *    [clearAfterSearch] = "false"                 // clears input after item select
   *    [hasProgressBar] = "false"                   // adds loading while making request
   *    [hasSearchButton] = "false"                  // adds search button near input
   *    [validationErrors]="errors"                  // string[] every sting in array displays as mat-error
   *
   *    displayItem = "item.name"                    // text will be evaluated and executed, better use displayItemFn for function
   *    [displayTemplate] = "TemplateRef"            // template reference for autocomplete options, displayItem or displayTemplate
   *
   *    [showAddNew] = "false"                       // shows create button when no suggestions
   *    [addNewText] = "'Add new'"                   // text to display near create button
   *    (createNew) = "onCreateNew($event)"      // rises an event when click on create button
   *
   *    [transformResult] = "function"               // callback function to format data from server response
   *    [isFocused]="true"                           // sets focus that triggers fetch
   *
   *    (optionSelected)="onSelectCallback(item)"    // get selected item from event
   *
   *    [formControl]="form.controls['controlName']" // access it as any form control
   *    [(ngModel)]="model.item"                     // or just use model binding
   *    (ngModelChange)="itemSelected($event)"
   *
   *  ></ng-mat-autocomplete>
   */

  public selectedOption: any;
  public query = '';
  public autocompleteList: any[] | null;
  public request = false;
  public noSuggestions: boolean;
  public requestsInQueue = 0;

  private storedItems?: any[];
  private service?: ResourceService<T>;
  private returnType: string;

  @Input() set source(value: ResourceService<T> | T[]) {
    if (value instanceof Array) {
      this.storedItems = value.slice(0);
      this.saveReturnType(this.storedItems);
    } else if (this.isAutocompleteService(value)) {
      this.service = value as ResourceService<T>;
    }
  }

  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() optionSelected = new EventEmitter();
  @Output() createNew = new EventEmitter();

  @ViewChild('autocompleteInput', { static: false }) autocompleteInput: ElementRef;
  @ViewChild('autocomplete', { static: true }) autocomplete: MatAutocomplete;

  @Input() name = '';
  @Input() placeholder = '';
  @Input() floatLabel: FloatLabelType = 'auto';
  @Input() formControl?: FormControl;
  @Input() displayItem ? = 'item.name';
  @Input() hasSearchButton = false;
  @Input() hasProgressBar = false;
  @Input() minChars = 3;
  @Input() clearAfterSearch = false;
  @Input() showAddNew = false;
  @Input() addNewText = 'Nieuw toevoegen';
  @Input() isFocused = false;
  @Input() validationErrors: string[] = [];
  @Input() serviceParams?: HttpParams;
  @Input() displayItemFn?: (item: any) => string;
  @Input() displayTemplate?: TemplateRef<any>;
  @Input() transformResult: any = (x: any) => x.body;
  @Input() sortBy: string;

  constructor() {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.isFocused) {
      setTimeout(() => {
        this.autocompleteInput.nativeElement.focus();
      });
    }

    fromEvent(this.autocompleteInput.nativeElement, 'keyup').pipe(debounceTime(500)).subscribe((value: KeyboardEvent) => { this.onKey(value); });
  }

  public search() {
    if (this.doSearchViaService) {
      this.fetch(true);
    } else {
      this.filterStoredItems(true);
    }
  }

  public fetch(force?: boolean) {
    if (!this.service) {
      throw new Error('Service for fetch is not defined in \'Source\'');
    }

    this.query = this.autocompleteInput.nativeElement.value;

    // empty query is not allowed for autocomplete
    if (this.isQueryEmpty(this.query) && this.minChars !== 0) {
      this.autocompleteList = [];
      this.noSuggestions = false;
      return;
    }

    if (force || this.query.length >= this.minChars) {
      const queryOptions = new QueryOptions();
      queryOptions.query = this.query;
      if(this.sortBy) {
        queryOptions.sortBy = this.sortBy;
      }
      

      /* let params = new HttpParams();
      params = params.set('query', this.query);
      if (this.serviceParams) {
        params = this.serviceParams.set('query', this.query);
      }*/

      this.requestsInQueue = this.requestsInQueue + 1;

      this.service.list(queryOptions).subscribe((result: any) => {
        this.requestsInQueue = this.requestsInQueue - 1;
        this.autocompleteList = this.transformResult(result);
        this.noSuggestions = this.autocompleteList.length === 0;
        this.saveReturnType(this.autocompleteList);
      });
    }
  }

  public filterStoredItems(force?: boolean) {
    if (!this.displayItem && !this.displayItemFn) {
      throw new Error(
        'You must provide displayItem or displayItemFn for local search.'
      );
    }

    this.query = this.autocompleteInput.nativeElement.value;

    // empty query is not allowed for autocomplete
    if (this.isQueryEmpty(this.query) && this.minChars !== 0) {
      this.autocompleteList = [];
      return;
    }

    if (force || this.query.length >= this.minChars) {
      this.noSuggestions = false;

      if (!this.storedItems) {
        return;
      }

      this.autocompleteList = this.storedItems.filter(item => {
        if (!this.viewItem(item)) {
          throw new Error(
            'String to evaluate in displayItem was provided wrong. Better use displayItemFn'
          );
        }

        let formatedItem = this.viewItem(item).toLowerCase();
        if (this.displayItemFn) {
          formatedItem = this.displayItemFn(item).toLowerCase();
        }
        return formatedItem.indexOf(this.query.toLowerCase()) > -1;
      });
      this.noSuggestions = this.autocompleteList.length === 0;
    }
  }

  public autocompleteSelected($event: any) {
    this.query = this.autocompleteInput.nativeElement.value;
    const selected = $event.option.value;
    this.writeValue(selected);

    if (selected) {
      this.optionSelected.emit(selected);
    }

    if (this.clearAfterSearch) {
      this.clearValue();
    }
  }

  public autocompleteDisplayFn() {

    if (this.displayItemFn) {
      return this.displayItemFn;
    }

    return (item: any) => {
      if (item) {
        return item ? this.viewItem(item) : item;
      }
    };
  }

  public onKey($event: KeyboardEvent) {
    // prevent filtering results if arrow were pressed
    if ($event.keyCode < 37 || $event.keyCode > 40) {
      if (this.autocompleteInput.nativeElement.value === '') {
        this.clearValue();
      }
      this.onKeyCallback();
    }
  }

  public onKeyCallback() {
    if (this.doSearchViaService) {
      this.fetch();
    } else {
      this.filterStoredItems();
    }
  }

  public onBlur($event: MouseEvent) {
    this.query = this.autocompleteInput.nativeElement.value;
    if (
      this.selectedOption &&
      this.returnType === typeof this.selectedOption &&
      this.viewItem(this.selectedOption) !== this.query
    ) {
      this.autocompleteInput.nativeElement.value = this.viewItem(
        this.selectedOption
      );
    }
  }

  public onFocus($event: any) {
    if (this.selectedOption) {
      return;
    }
  }

  public viewItem(item: any) {
    if (this.displayItemFn) {
      return this.displayItemFn(item);
    }
    // using eval() can be dangerous, better use displayItemFn function
    // tslint:disable-next-line: no-eval
    return this.displayItem ? eval(this.displayItem) : item.displayname;
  }

  public clearValue() {
    if (this.formControl) {
      this.formControl.reset();
    }
    this.selectedOption = null;
    this.autocompleteInput.nativeElement.value = '';
    this.query = '';
    this.onChange(this.selectedOption);
  }

  get doSearchViaService() {
    // check if search result returns from service or from local data
    // if prefetch is active only one request will be made on init
    return this.service;
  }

  public onCreateNew() {
    if (this.selectedOption) {
      const value =
        this.returnType === typeof this.selectedOption
          ? this.viewItem(this.selectedOption)
          : this.selectedOption;
      this.autocompleteInput.nativeElement.value = value;
    }

    this.createNew.emit(this.selectedOption);
    this.clearValue();
  }

  private isQueryEmpty(query: string): boolean {
    return query.length <= 0;
  }

  private isAutocompleteService(object: any): object is ResourceService<T> {
    return object && 'list' in object;
  }

  private saveReturnType(items: any[] | undefined | null) {
    if (items && items.length > 0) {
      this.returnType = typeof items[0];
    }
  }

  writeValue(val: any): void {
    if (!val) {
      return;
    }
    this.selectedOption = val;

    if (this.autocompleteInput) {
      this.autocompleteInput.nativeElement.value = this.viewItem(
        this.selectedOption
      );
    }

    this.onChange(val);
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }
}
