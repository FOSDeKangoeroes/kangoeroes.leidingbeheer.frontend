import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResourceService } from 'projects/kangoeroes-frontend-core/src/lib/data-service/resource-service';

import { ConfigService } from 'projects/kangoeroes-frontend-core/src/lib/config/config.service';
import { LeidingSerializer } from './leiding-serializer';
import { Leiding } from './leiding.model';

@Injectable({
  providedIn: 'root'
})
export class LeidingDataService extends ResourceService<Leiding> {

  constructor(httpClient: HttpClient, configService: ConfigService) {
    const url = `${configService.get().appUrl}/api`;
    super(httpClient, url, 'leiding', new LeidingSerializer());
   }

  public tak(leidingId: number, newTakId: number) {
     return this.httpClient.put<Leiding>(`${this.url}/${this.endpoint}/${leidingId}/tak`, { newTakId: newTakId });
   }
}
