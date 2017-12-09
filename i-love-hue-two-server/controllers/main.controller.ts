import { WebsocketService } from '../services/websocket.service';
import { Server } from 'ws';
import { Game } from '../models/game.class'
import { Subscription } from 'rxjs/Subscription';

export class MainController {
    private websocketService: WebsocketService;
    private wsObserver:       Subscription;
    private games:            Game[];


    constructor(websocketServer: Server) {
        this.games = [];
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
                    case 'player_not_ready':
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

    private getGame(name: string): Game | void {
        let game = this.games.find((game) => game.name === name);
        if (game) {
            return game;
        }
    }

    private playerReady(message: any): void {
        let game = this.getGame(message.game_name);
        if (game) {
            let clients = game.getAllClients();
            let client = game.getClient(message.client_id);
            client.toggleReady();
            for (let client of clients) {
                this.websocketService.sendMessageToClient(
                    client.id,
                    {
                        "event": (client.isReady ? "player_ready" : "player_not_ready"),
                        "client_id": message.client_id
                    }
                );
            }
        }
    }

    private playerJoinGame(message: any): void {
        let game = this.getGame(message.game_name);
        if (game) {
            game.addClient(message.client_id, message.client_name);
            let clients = game.getAllClients();
            let newPlayer = game.getClient(message.client_id);
            for (let client of clients) {

                // send new player a list of all players already in the lobby
                this.websocketService.sendMessageToClient(
                    newPlayer.id,
                    {
                        "event": "player_joined",
                        "client_id": client.id,
                        "client_name": client.name,
                        "client_ready": client.isReady,
                        "client_tiles": client.tiles,
                        "game_name": message.game_name
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
                        "client_tiles": newPlayer.tiles,
                        "game_name": message.game_name
                    }
                );
            }
        }
    }

    private initiateGame(message: any): void {
        let game = this.getGame(message.game_name);
        if (game) {
            let initiate = ((game: Game) => {
                let clients = game.getAllClients().map((c) => {
                    return {id: c.id, tiles: c.tiles}
                });
                this.websocketService.broadcastMessageInGame (
                    {
                        "event": "initiate_game",
                        "players": clients
                    },
                    game
                );
            });
            game.initiate(initiate);
        }
    }

    private newRound(gameName: string): void {
        let game = this.getGame(gameName);
        if (game) {
            let newRound = ((game: Game) => {
                let clients = game.getAllClients().map((c) => {
                    c.tileSwaps = 0;
                    return {id: c.id, tiles: c.tiles}
                });
                this.websocketService.broadcastMessageInGame(
                    {
                        "event": "initiate_game",
                        "players": clients
                    },
                    game
                );
            });
            newRound(game);
        }
    }

    private playerTileSwap(message: any): void {
        let game = this.getGame(message.game_name);
        if (game) {
            let victory = ((playerVictory: boolean, game: Game) => {
                for (let client of game.getAllClients()) {
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
                    let winner = game.getClient(message.client_id);
                    game.stopClock();
                    winner.incrementScore();
                    this.websocketService.broadcastMessageInGame(
                        {
                            "event": "player_win",
                            "client_id": message.client_id,
                            "client_score": winner.score
                        },
                        game
                    );
                    let newRoundHandler = this.newRound.bind(this);
                    setTimeout(newRoundHandler(message.game_name), 15000);
                }
            });
            game.swapTiles(message.client_id, message.tile_swap, victory);
        }
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
        let newGame = new Game(message.game.mode, message.game.name, this.websocketService, message.game.difficulty);
        this.games.push(newGame);
        this.websocketService.games.push(newGame);
        console.log(`Game ${newGame.name} started!`);

        // add this client to the game
        newGame.addClient(message.client_id, message.client_name);
        this.websocketService.broadcastMessageInGame (
            {
                "event": "player_joined",
                "client_id": message.client_id,
                "client_name": message.client_name,
                "game_name": newGame.name
            },
            newGame
        );
        let games = this.games.map((game) => game.name);
        this.websocketService.broadcastMessage (
            {
                "event": "new_game_launched",
                "client_id": message.client_id,
                "client_name": message.client_name,
                "games": games
            }
        );
    }
}