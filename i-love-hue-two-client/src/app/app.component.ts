import { Component, OnInit } from '@angular/core';
import { ParticleJs } from './config/particlejs.config';
import { MessageService } from './services/message.service';
import { Client } from '../../../i-love-hue-two-server/models/client.class';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  state: string;
  games: Array<string>;
  url: string;
  defaultUrl = 'ws://localhost:8999';
  messageService: MessageService;
  players: Client[] = [];
  self: Client;
  difficulty: number;
  mode: number;
  celebrations: string;

  constructor(){
    this.state = 'splash';
  }

  connectToGame(playerName: string, url?: string) {
    this.url = (url.length > 0 ? url : this.defaultUrl);

    this.messageService = new MessageService(this.url);

    this.messageService.messages.subscribe((message) => {
      console.log(`Event received: `, message);
      switch (message.event) {
        case 'connect_succesful':
          this.switchState('game-select');
          this.setSelf(message.client_id, playerName);
          this.games = message.games;
          break;
        case 'player_joined':
          if (message.client_id === this.self.id) {
            this.switchState('lobby');
          } else {
            let newPlayer = new Client(message.client_id, message.client_name);
            newPlayer.setTiles(message.client_tiles);
            this.players.push(newPlayer);
          }
          break;
        case 'initiate_game':
          this.setTiles(<Client[]>message.players);
          this.switchState('play');
          break;
        case 'player_ready':
          if (message.client_id !== this.self.id) {
            this.togglePlayerReady(message.client_id);
          }
          break;
        case 'player_tile_swap':
          this.tileSwap(this.players.find((player) => player.id === message.client_id), message.tile_swap);
          break;
        case 'player_win':
          this.endGame(message);
          break;
      }
    });
  }

  endGame(message: any): void {
    this.celebrations = (message.client_id === this.self.id ? 'win' : 'lose');
    this.players.find((player) => player.id === message.client_id).incrementScore();
  }

  newGame(name: string, difficulty: number, mode: number): void {
    this.sendMessage(
      {
        event: 'start_new_game',
        client_id: this.self.id,
        client_name: this.self.name,
        game: {
          name: name,
          mode: mode,
          difficulty: difficulty
        }
      }
    );
  }

  setSelf(clientId: string, clientName: string): void {
    this.self = new Client(clientId, clientName);
    this.players.push(this.self);
  }

  setTiles(players: Client[]): void {
    for (let player of players) {
      this.players.find((p) => p.id === player.id).setTiles(player.tiles);
    }
  }

  toggleSelfReady(): void {
    this.players.find((player) => player.id === this.self.id).toggleReady();
    this.sendMessage(
      {
        event: (this.self.isReady ? 'player_ready' : 'player_not_ready'),
        client_id: this.self.id
      }
    );
  }

  togglePlayerReady(id: string): void {
    this.players.find((player) => player.id === id).toggleReady();
  }

  startGame(): void {
    this.sendMessage(
      {
        event: 'initiate_game',
        client_id: this.self.id
      }
    );
  }

  joinGame() : void {
    this.sendMessage(
      {
        event: 'player_join_game',
        client_id: this.self.id,
        client_name: this.self.name
      }
    );
  }

  private sendMessage(message: any): void {
    this.messageService.messages.next(message);
  }

  switchState(newState: string): void {
    this.state = newState;
  }

  tileSwap(player: Client, tileSwap: any): void {
    if (this.celebrations) {
      // the game is over, no more swaps!
      return;
    }
    let tile1Index = player.tiles.findIndex((tile) => {
      return tile.id === tileSwap.from;
    });
    let tile2Index = player.tiles.findIndex((tile) => {
      return tile.id === tileSwap.to;
    });

    // make deep clone of tiles
    let tilesCopy = JSON.parse(JSON.stringify(player.tiles));

    tilesCopy[tile1Index].x = player.tiles[tile2Index].x;
    tilesCopy[tile1Index].y = player.tiles[tile2Index].y;
    tilesCopy[tile2Index].x = player.tiles[tile1Index].x;
    tilesCopy[tile2Index].y = player.tiles[tile1Index].y;


    // reassign tiles. changes object reference, thus triggering the board's onChange() method
    player.setTiles(tilesCopy);
    player.tileSwaps++;
    if (this.self.id === player.id) {
      this.sendMessage(
        {
          event: "player_tile_swap",
          client_id: this.self.id,
          tile_swap: tileSwap,
          tile_swaps: player.tileSwaps
        }
      );
    }
  }

  canStartGame(): boolean {
    let playerNotReady = this.players.find((player) => !player.isReady);
    return !(this.players.length !== 0 && typeof playerNotReady != typeof undefined);
  }

  isReady(): boolean {
    return this.self.isReady;
  }

  gameOver(): boolean {
    if (this.celebrations) return true;
    else return false;
  }

  ngOnInit () {
    particlesJS.load('particles-js', ParticleJs.config);
  }
}
