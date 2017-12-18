import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Client }                                 from '../../../../../i-love-hue-two-server/models/client.class';

@Component({
  selector: 'game-lobby-screen',
  templateUrl: './game-lobby-screen.component.html',
  styleUrls: [
    './game-lobby-screen.component.css'
  ]
})

export class GameLobbyScreenComponent {
  @Input() self:     Client;
  @Input() gameName: string;
  @Input() players:  Array<any>;
  @Input() solution: any = {tiles: null};

  @Output() toggle = new EventEmitter();
  @Output() start  = new EventEmitter();

  // Validator function for deciding whether or not the game can be initiated
  canStartGame(): boolean {
    // Are there players in the current list that are in the lobby but not yet ready?
    let playerNotReady = this.players.find((player) => player.status === 1);
    return !(this.players.length !== 0 && typeof playerNotReady != typeof undefined);
  }

  toggleReady(): void {
    this.toggle.emit();
  }

  startGame(): void {
    this.start.emit();
  }
}
