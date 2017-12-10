import { Component } from '@angular/core';
import { MessageService } from './services/message.service';
import { Client } from '../../../i-love-hue-two-server/models/client.class';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('swipeInOut', [
      transition(':enter', [
        style({transform: 'translateX(100%)', opacity: 0}),
        animate('400ms ease-in', style({transform: 'translateX(0)', opacity: 1}))
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({transform: 'translateX(-100%)', opacity: 0}))
      ])
    ])
  ]
})

export class AppComponent {
  defaultUrl = 'ws://timothy.fyi:8999';
  startTime  = '';
  countdown  = '';
  customUrl  = {
    value: undefined
  };
  playerName = {
    value: undefined
  };
  globalMessages:  Array<any>    = [];
  games:           Array<any>    = [];
  players:         Client[]      = [];
  globalPlayers:   Client[]      = [];
  splash:          boolean       = false;
  connectionError: boolean       = false;
  select:          boolean       = false;
  lobby:           boolean       = false;
  play:            boolean       = false;
  messageService:  MessageService;
  self:            Client;
  gameName:        string;
  gameId:          string;
  url:             string;
  difficulty:      number;
  mode:            number;
  celebrations:    string;
  selectedGame:    string;

  constructor(){
    this.setState('splash');
  }

  setState(state): void {
    this.splash = false;
    this.select = false;
    this.lobby  = false;
    this.play   = false;

    switch(state) {
      case 'splash':
        this.splash = true;
        break;
      case 'select':
        this.select = true;
        break;
      case 'lobby':
        this.lobby = true;
        break;
      case 'play':
        this.play = true;
        break;
    }
  }

  startClock(c) {
    this.countdown = '';
    this.startTime = c;
  }

  setCountdown(c) {
    this.startTime = '';
    this.countdown = c;
  }

  connectToGame(playerName: string, url?: string) {
    this.connectionError = false;
    this.url = (url && url.length > 0 ? url : this.defaultUrl);

    this.messageService = new MessageService(this.url);

    this.messageService.messages.subscribe((message) => {
      console.log(`Event received: `, message);

      switch (message.event) {
        case 'connect_succesful':
          this.setState('select');
          this.setSelf(message.client_id, playerName);
          this.games = message.games;
          break;
        case 'new_game_launched':
          this.games = message.games;
          break;
        case 'player_joined':
          if (message.client_id === this.self.id) {
            this.setState('lobby');
            this.gameId = message.game_id;
            this.gameName = message.game_name;
          } else {
            let newPlayer = new Client(message.client_name);
            newPlayer.setTiles(message.client_tiles);
            newPlayer.isReady = message.client_ready;
            this.players.push(newPlayer);
          }
          break;
        case 'initiate_game':
          this.setTiles(<Client[]>message.players);
          this.celebrations = null;
          this.setState('play');
          break;
        case 'player_ready':
        case 'player_not_ready':
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
        case 'data_update':
          this.games         = message.games;
          this.globalPlayers = message.global_players;
          break;
        case 'global_chat_message':
          this.globalMessages.unshift({
            sender:         message.client_name,
            client_id:      message.client_id,
            chat_message:   message.chat_message
          });
          break;
      }
    }, (err) => {
      this.connectionError = true;
      console.log(err);
    });
  }

  endGame(message: any): void {
    this.celebrations = (message.client_id === this.self.id ? 'win' : 'lose');
    this.setCountdown('00:15');
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
    this.self    = new Client(clientName);
    this.self.id = clientId;

    this.players.push(this.self);
    this.playerUpdate();
  }

  playerUpdate(): void {
    this.sendMessage(
      {
        event: "player_update",
        client_id: this.self.id,
        client_name: this.self.name
      }
    );
  }

  setTiles(players: Client[]): void {
    for (let player of players) {
      let p = this.players.find((p) => p.id === player.id);
      p.setTiles(player.tiles);
      p.tileSwaps = 0;
    }
  }

  toggleSelfReady(): void {
    this.players.find((player) => player.id === this.self.id).toggleReady();
    this.sendMessage(
      {
        event:     (this.self.isReady ? 'player_ready' : 'player_not_ready'),
        client_id: this.self.id,
        game_id: this.gameId
      }
    );
  }

  togglePlayerReady(id: string): void {
    this.players.find((player) => player.id === id).toggleReady();
  }

  startGame(): void {
    this.sendMessage(
      {
        event:     'initiate_game',
        client_id: this.self.id,
        game_id:   this.gameId
      }
    );
  }

  joinGame() : void {
    this.sendMessage(
      {
        event:       'player_join_game',
        client_id:   this.self.id,
        client_name: this.self.name,
        game_id:     this.selectedGame
      }
    );
  }

  sendChatMessage(chatMessage): void {
    this.sendMessage({
      event:       'global_chat_message',
      client_id:   this.self.id,
      client_name: this.self.name,
      text:        chatMessage          // todo: check for evil code in chat message or limit allowed characters
    });
  }

  private sendMessage(message: any): void {
    this.messageService.messages.next(message);
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
          tile_swaps: player.tileSwaps,
          game_name: this.gameId
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
}
