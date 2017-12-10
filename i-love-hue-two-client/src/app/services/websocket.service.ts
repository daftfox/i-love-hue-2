import {Injectable} from '@angular/core';
import * as Rx from 'rxjs/Rx';

@Injectable()
export class WebsocketService {
  private ws: WebSocket;

  constructor() {}

  public connect(url: string) {
    this.ws = new WebSocket(url);

    let observable = Rx.Observable.create((observer: Rx.Observer<MessageEvent>) => {
      this.ws.onmessage = observer.next.bind(observer);
      this.ws.onerror = observer.error.bind(observer);
      this.ws.onclose = observer.complete.bind(observer);
      return this.ws.close.bind(this.ws);
    });

    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }
    };
    return Rx.Subject.create(observer, observable);
  }
}
