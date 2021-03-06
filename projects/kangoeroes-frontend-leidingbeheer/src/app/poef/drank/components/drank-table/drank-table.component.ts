import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SearchBarService } from 'projects/kangoeroes-frontend-core/src/lib/components/search-bar/search-bar.service';
import { DrankDataService } from '../../shared/drank-data.service';
import { KangoeroeTableDataSource } from 'projects/kangoeroes-frontend-core/src/lib/data-table/data-source';
import { EventService } from 'projects/kangoeroes-frontend-core/src/lib/data-table/event.service';
import { Drank } from '../../shared/drank.model';

@Component({
  selector: 'app-drank-table',
  templateUrl: './drank-table.component.html',
  styleUrls: ['./drank-table.component.scss']
})
export class DrankTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Input() displayedColumns: string[];

  @Input() typeId: number;

  private possibleColumns = ['type.naam', 'naam', 'currentPrijs'];
  dataSource: KangoeroeTableDataSource<Drank>;

  constructor(private searchBarService: SearchBarService, private drankDataService: DrankDataService, private drankService: EventService) {}

  ngOnInit() {
    // Optional to provide the columns, if nothing is provided, show all the columns
    if (!this.displayedColumns) {
      this.displayedColumns = this.possibleColumns;
    }
    this.dataSource = new KangoeroeTableDataSource(
      this.paginator,
      this.sort,
      this.searchBarService,
      this.drankDataService,
      this.drankService);

      if (this.typeId) {
        this.dataSource.parentEntity = {
          name: 'DrankType',
          value: this.typeId
        };
      }
  }

}
