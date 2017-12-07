import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { WebsocketService } from './websocket.service';

/*export interface Message {
  event: string,
  message: string
}*/

@Injectable()
export class MessageService {
  public messages: Subject<any>;
  private wsService: WebsocketService;
  private clientId: string;

  constructor(url: string) {
    this.wsService = new WebsocketService();
    this.messages = <Subject<any>>this.wsService
      .connect(url)
      .map((response: MessageEvent): any => {
        let data = JSON.parse(response.data);
        return data
      });
  }

  public setClientId(clientId: string): void {
    this.clientId = clientId;
  }

  public getClientId(): string {
    return this.clientId;
  }
}
