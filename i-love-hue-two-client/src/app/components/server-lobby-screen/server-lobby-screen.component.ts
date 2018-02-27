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

  mask          = 0;
  size          = 0;
  name:         string;
  selectedGame: string;

  joinGame(selectedGame): void {
    this.join.emit({game: selectedGame});
  }

  newGame(name, mask, size): void{
    this.startNew.emit({name: name, mask: mask, size: size});
  }
}
