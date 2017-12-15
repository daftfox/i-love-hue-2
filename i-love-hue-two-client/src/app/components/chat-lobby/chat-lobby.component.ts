import { Client } from '../../../../../i-love-hue-two-server/models/client.class';
import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, Output
}
  from '@angular/core';
import { trigger,style,transition,animate,keyframes,query,stagger }
  from '@angular/animations';

@Component({
  selector: 'chat-lobby',
  templateUrl: './chat-lobby.component.html',
  styleUrls: [
    './chat-lobby.component.css'
  ],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: true}),
        query(':enter', stagger('200ms', [
          animate('.5s ease-in', keyframes([
            style({opacity: 0,  transform: 'translateY(-75%)',  offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
            style({opacity: 1,  transform: 'translateY(0)',     offset: 1.0})
          ]))]), {optional: true})
      ])
    ])
  ]
})

export class ChatLobbyComponent implements OnChanges, OnDestroy{
  @Input()  players:  Array<any>;
  @Input()  messages: Array<any>;
  @Input()  self:     Client;
  @Output() sendMessage =  new EventEmitter();

  chatMessage: string = '';

  tmp: any;

  constructor(){
    this.tmp = setInterval(() => {
      console.log(this.players);
    }, 10000);
  }

  ngOnChanges(changes) {
    console.log(changes);
  }

  ngOnDestroy() {
    clearInterval(this.tmp);
  }

  send(): void {
    if (this.chatMessage) this.sendMessage.emit(this.chatMessage);
    this.chatMessage = '';
  }
}
