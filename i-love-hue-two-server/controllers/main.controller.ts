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
                    case 'player_join_game':
                        this.playerJoinGame(message);
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
        let clients = this.game.getAllClients();
        let client = this.game.getClient(message.client_id);
        client.toggleReady();
        for (let client of clients) {
            this.websocketService.sendMessageToClient(
                client.id,
                {
                    "event": "player_ready",
                    "client_id": message.client_id
                }
            );
        }
    }

    private playerJoinGame(message: any): void {
        this.game.addClient(message.client_id, message.client_name);
        let clients = this.game.getAllClients();
        let newPlayer = this.game.getClient(message.client_id);
        for (let client of clients) {

            // send new player a list of all players already in the lobby
            this.websocketService.sendMessageToClient(
                newPlayer.id,
                {
                    "event": "player_joined",
                    "client_id": client.id,
                    "client_name": client.name,
                    "client_ready": client.isReady,
                    "client_tiles": client.tiles
                }
            );

            // notify players in the lobby of new player
            this.websocketService.sendMessageToClient(
                client.id,
                {
                    "event": "player_joined",
                    "client_id": newPlayer.id,
                    "client_name": newPlayer.name,
                    "client_ready": false,
                    "client_tiles": newPlayer.tiles
                }
            );
        }
    }

    private initiateGame(message: any): void {
        this.game.initiate(() => {
            let clients = this.game.getAllClients().map((c) => {return {id: c.id, tiles: c.tiles}});
            this.websocketService.broadcastMessage(
                {
                    "event": "initiate_game",
                    "players": clients
                }
            );
        });
    }

    private newRound(): void {
        this.game.newRound(() => {
            let clients = this.game.getAllClients().map((c) => {return {id: c.id, tiles: c.tiles}});
            this.websocketService.broadcastMessage(
                {
                    "event": "initiate_game",
                    "players": clients
                }
            );
        });
    }

    private playerTileSwap(message: any): void {
        this.game.swapTiles(message.client_id, message.tile_swap, (playerVictory: boolean) => {
            for (let client of this.game.getAllClients()) {
                if (client.id !== message.client_id) {
                    this.websocketService.sendMessageToClient(
                        client.id,
                        {
                            "event": "player_tile_swap",
                            "client_id": message.client_id,
                            "tile_swaps": message.tile_swaps,
                            "tile_swap": {
                                "from": message.tile_swap.from,
                                "to": message.tile_swap.to
                            }
                        }
                    );
                }
            }
            if (playerVictory) {
                let winner = this.game.getClient(message.client_id);
                this.game.stopClock();
                winner.incrementScore();
                this.websocketService.broadcastMessage(
                    {
                        "event": "player_win",
                        "client_id": message.client_id,
                        "client_score": winner.score
                    }
                );
                setTimeout(this.newRound.bind(this), 15000);
            }
        });
        /*for (let client of this.game.getAllClients()) {
            if (client.id !== message.client_id) {
                this.websocketService.sendMessageToClient(
                    client.id,
                    {
                        "event": "player_tile_swap",
                        "client_id": message.client_id,
                        "tile_swap": {
                            "from": message.tile_swap.from,
                            "to": message.tile_swap.to
                        }
                    }
                );
            }
        }*/
    }

    private playerForfeit(message: any): void {
        //this.game.removeClient(message.client_id);
        this.websocketService.broadcastMessage(
            {
                "event": "player_forfeit",
                "client_id": message.client_id
            }
        );
    }

    private startNewGame(message: any): void {
        // create a new game
        this.game = new Game(message.game.mode, message.game.name, this.websocketService, message.game.difficulty);
        this.websocketService.games = [this.game];
        console.log(`Game ${this.game.name} started!`);

        // add this client to the game
        this.game.addClient(message.client_id, message.client_name);
        this.websocketService.broadcastMessage(
            {
                "event": "player_joined",
                "client_id": message.client_id,
                "client_name": message.client_name
            }
        );
    }
}