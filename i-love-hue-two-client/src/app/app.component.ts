import { Component }      from '@angular/core';
import { MessageService } from './services/message.service';
import { Client }         from '../../../i-love-hue-two-server/models/client.class';
import { Helper }         from '../../../i-love-hue-two-server/models/helper.class';
/* import { trigger, style, transition, animate } from '@angular/animations'; */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']/*,

  animations are choppy
  research animations more before re-enabling

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
  difficulty:       number        = 0;
  mode:             number        = 0;
  messageService:   MessageService;
  self:             Client;
  gameName:         string;
  customUrl:        string;
  playerName:       string;
  gameId:           string;
  url:              string;
  celebrations:     string;
  selectedGame:     string;
  solution:         any = {tiles: null};

  constructor() {
    this.setState('splash');
  }

  connectToGame() {
    this.connectionError = false;
    this.url = (this.customUrl && this.customUrl.length > 0 ? this.customUrl : this.defaultUrl);

    this.messageService = new MessageService(this.url);

    this.messageService.messages.subscribe((message) => {
      // todo: only log when in dev mode
      // console.log(`Event received: `, message);

      switch (message.event) {
        case 'connect_succesful':
          this.connectSuccesful(message);
          break;
        case 'player_joined':
          this.playerJoined(message);
          break;
        case 'initiate_game':
          this.initiateGame(message);
          break;
        case 'player_ready':
        case 'player_not_ready':
          this.playerReady(message);
          break;
        case 'player_tile_swap':
          this.tileSwap(message.client_id, message.tile_swap);
          break;
        case 'player_forfeit':
          this.playerForfeit(message);
          break;
        case 'player_win':
        case 'game_end':
          this.endGame(message);
          break;
        case 'data_update':
          this.dataUpdate(message);
          break;
        case 'game_chat_message':
        case 'global_chat_message':
          this.chatMessage(message);
          break;
      }
    }, (err) => {
      this.connectionError = true;
      console.log(err);
    });
  }

  // Client succesfully connected to server
  // Set correct state and own Client object
  private connectSuccesful(message: any): void {
    this.setState('select');
    this.setSelf(message.client_id, this.playerName);

    this.games         = message.games;
    this.globalPlayers = message.global_players.map((player) => { return {name: player}; });
  }

  // The client or an opponent has joined the game
  // Set correct state and (if applicable) add opponent to list of players in this game
  // Set the game's solution so we can display it as an example on the game lobby page
  private playerJoined(message: any): void {
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
  }

  // The current game has been initiated
  // Set the correct state, each player's tiles and remove the win/lose message.
  private initiateGame(message: any): void{
    this.setTiles(<Client[]> message.players);
    this.celebrations = null;
    this.setState('play');
  }

  // A player in the current game is ready to start the game
  // Toggle the ready state of the local copy of the client
  private playerReady(message: any): void{
    if (message.client_id !== this.self.id) {
      this.getPlayer(message.client_id).toggleReady();
    }
  }

  // A player has swapped two tiles
  // Apply the mutation to the tiles and, if this method was triggered from the
  // player's own field, notify the server.
  tileSwap(id: string, tileSwap: any): void {
    if (this.celebrations) {
      // the game is over, no more swaps!
      return;
    }
    let player = this.getPlayer(id);
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
    // todo: research if we can simplify board drawing mechanism by only updating the specific array elements
    // todo: instead of reassigning the whole array
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

  // A player has left the game or forfeited
  // Add a notification in the chat and remove the player from the list
  private playerForfeit(message: any): void {
    let index = this.players.findIndex((player) => player.id === message.client_id);
    let name =  this.getPlayer(message.client_id).name;

    this.messages.unshift({
      sender:         'Server',
      client_id:      'admin',
      chat_message:   `Player ${name} has forfeited the game.`
    });
    if (message.client_id !== this.self.id) this.players.splice(index, 1);
    else this.players = [];
  }

  // The game has ended or a player has won
  // Either way display the win/lose message
  endGame(message: any): void {
    if (message.event === 'game_end') {
      this.resetToServerLobby();
    } else {
      // A player has won, increment the score
      this.getPlayer(message.client_id).incrementScore();
    }

    // Display win/lose message and countdown timer
    this.setCountdown('00:15');
    this.celebrations = (message.client_id && message.client_id === this.self.id ? 'win' : 'lose');
  }

  // The server has sent us a new update of available, global, data
  // Update global games and connected players
  private dataUpdate(message: any): void {
    Helper.updateArray(this.games, message.games);
    let newPlayers = message.global_players.map((player) => { return {name: player}; });
    Helper.updateArray(this.globalPlayers, newPlayers);
  }

  // A new chat message has been received
  // Add it to the correct list of messages already received
  private chatMessage(message: any): void{
    if (message.event === 'global_chat_message') {
      this.globalMessages.unshift({
        sender:         message.client_name,
        client_id:      message.client_id,
        chat_message:   message.chat_message
      });
    } else {
      this.messages.unshift({
        sender:         message.client_name,
        client_id:      message.client_id,
        chat_message:   message.chat_message
      });
    }
  }

  // Set the state and thusly the screen to display
  // todo: refactor and add/remove screen component
  private setState(state): void {
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

  // Navigates player back to server lobby screen
  // Set correct state and clean up variables
  private resetToServerLobby(): void {
    this.setState('select');
    this.gameId   = null;
    this.gameName = null;
    this.messages = [];
  }

  // Get client from the current list of players by id
  private getPlayer(id: string): Client {
    return this.players.find((player) => player.id === id)
  }

  // The player clicks the 'Leave game' button
  leaveGame(): void {
    this.sendMessage(
      {
        event:       'player_forfeit',
        client_id:   this.self.id,
        game_id:     this.gameId,
        client_name: this.self.name
      }
    );

    this.resetToServerLobby();
  }

  // The player clicks the 'New game' button
  newGame(name: string, difficulty: number, mode: number): void {
    this.sendMessage(
      {
        event:       'start_new_game',
        client_id:   this.self.id,
        client_name: this.self.name,
        game: {
          name:       name,
          mode:       mode,
          difficulty: difficulty
        }
      }
    );
  }

  // Set own player object with id generated by server
  private setSelf(clientId: string, clientName: string): void {
    this.self    = new Client(clientName);
    this.self.id = clientId;

    this.players.push(this.self);
    this.playerUpdate();
  }

  // Notify the server of an update of the player info
  private playerUpdate(): void {
    this.sendMessage(
      {
        event:       "player_update",
        client_id:   this.self.id,
        client_name: this.self.name
      }
    );
  }

  // Set tiles for each player to the values supplied in the input
  private setTiles(players: Client[]): void {
    for (let player of players) {
      let p = this.getPlayer(player.id);
      p.setTiles(player.tiles);
      p.tileSwaps = 0;
    }
  }

  // Toggle player ready state
  toggleSelfReady(): void {
    this.self.toggleReady();
    this.sendMessage(
      {
        event:     (this.self.isReady ? 'player_ready' : 'player_not_ready'),
        client_id: this.self.id,
        game_id:   this.gameId
      }
    );
  }

  // The player initiates the current game
  startGame(): void {
    this.sendMessage(
      {
        event:     'initiate_game',
        client_id: this.self.id,
        game_id:   this.gameId
      }
    );
  }

  // The player joins a game
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

  // The player sends a chat message
  sendChatMessage(chatMessage): void {
    this.sendMessage({
      event:       'game_chat_message',
      client_id:   this.self.id,
      client_name: this.self.name,
      game_id:     this.gameId,
      text:        chatMessage          // todo: check for evil code in chat message or limit allowed characters
    });
  }

  // The player sends a global chat message
  sendGlobalChatMessage(chatMessage): void {
    this.sendMessage({
      event:       'global_chat_message',
      client_id:   this.self.id,
      client_name: this.self.name,
      text:        chatMessage          // todo: check for evil code in chat message or limit allowed characters
    });
  }

  // Shorthand function for sending messages using the messageService
  private sendMessage(message: any): void {
    this.messageService.messages.next(message);
  }

  // Validator function for deciding whether or not the game can be initiated
  canStartGame(): boolean {
    // Are there players in the current list that are not ready yet?
    let playerNotReady = this.players.find((player) => !player.isReady);
    return !(this.players.length !== 0 && typeof playerNotReady != typeof undefined);
  }

  // Validation function returning true when the current round has finished
  gameOver(): boolean {
    if (this.celebrations) return true;
    else return false;
  }

  // Start the clock
  // todo: start and display the clock when playing a game
  private startClock(st: string): void {
    this.countdown = '';
    this.startTime = st;
  }

  // Set the countdown for the timer
  private setCountdown(c: string): void {
    this.startTime = '';
    this.countdown = c;
  }
}
