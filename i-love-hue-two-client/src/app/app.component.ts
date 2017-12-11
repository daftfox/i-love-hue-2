import { Component } from '@angular/core';
import { MessageService } from './services/message.service';
import { Client } from '../../../i-love-hue-two-server/models/client.class';
import { Helper } from '../../../i-love-hue-two-server/models/helper.class';
import { Tile } from '../../../i-love-hue-two-server/models/tile.class';
/* import { trigger, style, transition, animate } from '@angular/animations'; */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']/*,
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
  ]*/
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
  globalMessages:   Array<any>    = [];
  messages:         Array<any>    = [];
  games:            Array<any>    = [];
  players:          Client[]      = [];
  globalPlayers:    Array<any>    = [];
  splash:           boolean       = false;
  connectionError:  boolean       = false;
  select:           boolean       = false;
  lobby:            boolean       = false;
  play:             boolean       = false;
  messageService:   MessageService;
  self:             Client;
  gameName:         string;
  gameId:           string;
  url:              string;
  difficulty:       number = 0;
  mode:             number = 0;
  celebrations:     string;
  selectedGame:     string;
  solution:         any = {tiles: null};

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

          this.games         = message.games;
          this.globalPlayers = message.global_players.map((player) => { return {name: player}; });
          break;
        case 'player_joined':
          if (message.client_id === this.self.id) {
            this.setState('lobby');

            this.gameId         = message.game_id;
            this.gameName       = message.game_name;
            this.messages       = message.chat_messages || [];
            if (message.solution) {
              this.solution.tiles = message.solution;
            }
          } else {
            let newPlayer = new Client(message.client_name);
            newPlayer.id = message.client_id;
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
        case 'player_forfeit':
          this.removePlayer(message);
          break;
        case 'game_end':
          this.cleanup();
          break;
        case 'player_win':
          this.endGame(message);
          break;
        case 'data_update':
          Helper.updateArray(this.games, message.games);
          let newPlayers = message.global_players.map((player) => { return {name: player}; });
          Helper.updateArray(this.globalPlayers, newPlayers);
          break;
        case 'global_chat_message':
          this.globalMessages.unshift({
            sender:         message.client_name,
            client_id:      message.client_id,
            chat_message:   message.chat_message
          });
          break;
        case 'game_chat_message':
          this.messages.unshift({
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
    console.log(this.self.id);
    console.log(message.client_id);
    this.celebrations = (message.client_id === this.self.id ? 'win' : 'lose');
    console.log(this.celebrations);
    this.setCountdown('00:15');
    this.players.find((player) => player.id === message.client_id).incrementScore();
  }

  cleanup(): void {
    this.setState('select');
    this.gameId   = null;
    this.gameName = null;
    this.messages = [];
  }

  leaveGame(): void {
    this.sendMessage(
      {
        event:       'player_forfeit',
        client_id:   this.self.id,
        game_id:     this.gameId,
        client_name: this.self.name
      }
    );

    this.cleanup();
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

  private removePlayer(message: any): void {
    let index = this.players.findIndex((player) => player.id === message.client_id);
    let name =  this.players.find((player) => player.id === message.client_id).name;

    this.messages.unshift({
      sender:         'Server',
      client_id:      'admin',
      chat_message:   `Player ${name} has forfeited the game.`
    });
    if (message.client_id !== this.self.id) this.players.splice(index, 1);
    else this.players = [];
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
    console.log(this.players);
    console.log(id);
    let player = this.players.find((player) => player.id === id);
    player.toggleReady();
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
      event:       'game_chat_message',
      client_id:   this.self.id,
      client_name: this.self.name,
      game_id:     this.gameId,
      text:        chatMessage          // todo: check for evil code in chat message or limit allowed characters
    });
  }

  sendGlobalChatMessage(chatMessage): void {
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
          game_id: this.gameId
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
