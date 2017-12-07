import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { WebsocketService } from './websocket.service';

@Injectable()
export class GameplayService {
  private baseUrl: string;

  constructor(wsService:  WebsocketService,
              baseUrl:    string) {
    this.baseUrl = baseUrl;
  }
}
