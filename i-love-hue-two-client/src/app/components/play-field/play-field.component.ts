import {Component, Input, Output, EventEmitter} from '@angular/core';
import { Client } from '../../../../../i-love-hue-two-server/models/client.class';

@Component({
  selector: 'play-field',
  templateUrl: './play-field.component.html',
  styleUrls: ['./play-field.component.css']
})

export class PlayFieldComponent {
  @Input()  player:   Client;
  @Input()  ownBoard: boolean;
  @Input()  gameOver: boolean;
  @Output() boardUpdated = new EventEmitter();

  tileSwap(tileSwap: any) {
    this.boardUpdated.emit(tileSwap);
  }
}
