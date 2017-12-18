import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'server-lobby-screen',
  templateUrl: './server-lobby-screen.component.html',
  styleUrls: [
    './server-lobby-screen.component.css'
  ]
})

export class ServerLobbyScreenComponent {
  @Input()   games:   Array<any>;
  @Output()  startNew  = new EventEmitter();
  @Output()  join      = new EventEmitter();

  difficulty    = 0;
  mode          = 0;
  name:         string;
  selectedGame: string;

  joinGame(selectedGame): void {
    this.join.emit({game: selectedGame});
  }

  newGame(name, difficulty, mode): void{
    this.startNew.emit({name: name, difficulty: difficulty, mode: mode});
  }
}
