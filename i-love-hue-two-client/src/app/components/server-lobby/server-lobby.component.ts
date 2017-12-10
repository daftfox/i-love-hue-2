import {Component, EventEmitter, Input, Output} from '@angular/core';
import { Client } from '../../../../../i-love-hue-two-server/models/client.class';
import { trigger,style,transition,animate,keyframes,query,stagger } from '@angular/animations';

@Component({
  selector: 'server-lobby',
  templateUrl: './server-lobby.component.html',
  styleUrls: [
    './server-lobby.component.css'
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

export class ServerLobbyComponent {
  @Input() globalPlayers:  Array<string>;
  @Input() globalMessages: Array<any>;
  @Input() self:           Client;
  @Output() sendMessage =  new EventEmitter();
  chatMessage:             string = '';

  constructor(){}

  send(): void {
    if (this.chatMessage) this.sendMessage.emit(this.chatMessage);
    this.chatMessage = '';
  }
}
