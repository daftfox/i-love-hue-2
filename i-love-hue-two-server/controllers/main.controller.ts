import { WebsocketService } from '../services/websocket.service';
import { Server } from 'ws';
import { Game } from '../models/game.class'
import { Subscription } from 'rxjs/Subscription';

export class MainController {
    private websocketService: WebsocketService;
    private wsObserver:       Subscription;
    private game:             Game;


    constructor(websocketServer: Server) {
        this.websocketService = new WebsocketService(websocketServer);
        this.wsObserver = this.websocketService.connection.subscribe(
            (message: any) => {
                switch (message.event) {
                    case 'start_new_game':
                        this.startNewGame(message);
                        break;
                    case 'player_ready':
                        this.playerReady(message);
                        break;
                    case 'initiate_game':
                        this.initiateGame(message);
                        break;
                    case 'player_tile_swap':
                        this.playerTileSwap(message);
                        break;
                    case 'player_forfeit':
                        this.playerForfeit(message);
                        break;
                }
            }
        );
    }

    private playerReady(message: any): void {
        this.websocketService.broadcastMessage(
            `{
                "event": "player_ready",
                "clientId": "${message.clientId}"
            }`
        );
    }

    private initiateGame(message: any): void {
        this.game.initiate();
        this.websocketService.broadcastMessage(
            `{
                "event": "initiate_game"
            }`
        );
    }

    private playerTileSwap(message: any): void {
        // todo: add win condition
        this.game.swapTiles(message.clientId, message.tile_swap);
        this.websocketService.broadcastMessage(
            `{
                "event": "player_tile_swap",
                "clientId": "${message.clientId}",
                "tile_swap": {
                    "from": "${message.tile_swap.from}",
                    "to": "${message.tile_swap.to}"
                }
            }`
        );
    }

    private playerForfeit(message: any): void {
        //this.game.removeClient(message.clientId);
        this.websocketService.broadcastMessage(
            `{
                "event": "player_forfeit",
                "clientId": "${message.clientId}"
            }`
        );
    }

    private startNewGame(message: any): void {
        // create a new game
        this.game = new Game(message.game.mode, message.game.name, this.websocketService);
        console.log(`Game ${this.game.name} started!`);

        // add this client to the game
        this.game.addClient(message.clientId);
        this.websocketService.broadcastMessage(
            `{
                "event": "player_joined",
                "clientId": "${message.clientId}",
            }`
        );
    }
}