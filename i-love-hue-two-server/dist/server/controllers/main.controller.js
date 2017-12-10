"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_service_1 = require("../services/websocket.service");
const game_class_1 = require("../models/game.class");
class MainController {
    constructor(websocketServer) {
        this.games = [];
        this.websocketService = new websocket_service_1.WebsocketService(websocketServer);
        this.wsObserver = this.websocketService.connection.subscribe((message) => {
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
        });
    }
    getGame(id) {
        let game = this.games.find((game) => game.id === id);
        if (game) {
            return game;
        }
    }
    playerReady(message) {
        let game = this.getGame(message.game_id);
        if (game) {
            let clients = game.getAllClients();
            let client = game.getClient(message.client_id);
            client.toggleReady();
            for (let client of clients) {
                this.websocketService.sendMessageToClient(client.id, {
                    "event": (client.isReady ? "player_ready" : "player_not_ready"),
                    "client_id": message.client_id
                });
            }
        }
    }
    playerJoinGame(message) {
        let game = this.getGame(message.game_id);
        if (game) {
            game.addClient(message.client_id, message.client_name);
            let clients = game.getAllClients();
            let newPlayer = game.getClient(message.client_id);
            for (let client of clients) {
                // send new player a list of all players already in the lobby
                this.websocketService.sendMessageToClient(newPlayer.id, {
                    "event": "player_joined",
                    "client_id": client.id,
                    "client_name": client.name,
                    "client_ready": client.isReady,
                    "client_tiles": client.tiles,
                    "game_name": message.game_name
                });
                // notify players in the lobby of new player
                this.websocketService.sendMessageToClient(client.id, {
                    "event": "player_joined",
                    "client_id": newPlayer.id,
                    "client_name": newPlayer.name,
                    "client_ready": false,
                    "client_tiles": newPlayer.tiles,
                    "game_name": message.game_name
                });
            }
        }
    }
    initiateGame(message) {
        let game = this.getGame(message.game_id);
        if (game) {
            let initiate = ((game) => {
                let clients = game.getAllClients().map((c) => {
                    return { id: c.id, tiles: c.tiles };
                });
                this.websocketService.broadcastMessageInGame({
                    "event": "initiate_game",
                    "players": clients
                }, game);
            });
            game.initiate(initiate);
        }
    }
    newRound(gameId) {
        let game = this.getGame(gameId);
        if (game) {
            let newRound = ((game) => {
                let clients = game.getAllClients().map((c) => {
                    c.tileSwaps = 0;
                    return { id: c.id, tiles: c.tiles };
                });
                this.websocketService.broadcastMessageInGame({
                    "event": "initiate_game",
                    "players": clients
                }, game);
            });
            newRound(game);
        }
    }
    playerTileSwap(message) {
        let game = this.getGame(message.game_id);
        // update timeout so game does not get removed for another ten minutes
        clearTimeout(game.timeout);
        this.updateTimeout(game.id);
        if (game) {
            let victory = ((playerVictory, game) => {
                for (let client of game.getAllClients()) {
                    if (client.id !== message.client_id) {
                        this.websocketService.sendMessageToClient(client.id, {
                            "event": "player_tile_swap",
                            "client_id": message.client_id,
                            "tile_swaps": message.tile_swaps,
                            "tile_swap": {
                                "from": message.tile_swap.from,
                                "to": message.tile_swap.to
                            }
                        });
                    }
                }
                if (playerVictory) {
                    let winner = game.getClient(message.client_id);
                    game.stopClock();
                    winner.incrementScore();
                    this.websocketService.broadcastMessageInGame({
                        "event": "player_win",
                        "client_id": message.client_id,
                        "client_score": winner.score
                    }, game);
                    let newRoundHandler = this.newRound.bind(this);
                    setTimeout(newRoundHandler(message.game_id), 15000);
                }
            });
            game.swapTiles(message.client_id, message.tile_swap, victory);
        }
    }
    playerForfeit(message) {
        //this.game.removeClient(message.client_id);
        this.websocketService.broadcastMessage({
            "event": "player_forfeit",
            "client_id": message.client_id
        });
    }
    removeGame(id) {
        console.log(`Removed game with id ${id} due to inactivity.`);
        let index = this.games.findIndex((game) => id === game.id);
        if (index)
            this.games = this.games.splice(index, 1);
    }
    updateTimeout(id) {
        let timeoutHandler = (id) => {
            this.removeGame.bind(this);
            return this.removeGame(id);
        };
        return setTimeout(() => {
            return timeoutHandler(id);
        }, 60000);
    }
    startNewGame(message) {
        // create a new game
        let newGame = new game_class_1.Game(message.game.mode, message.game.name, this.websocketService, message.game.difficulty);
        this.games.push(newGame);
        this.websocketService.games.push(newGame);
        console.log(`Game ${newGame.name} started!`);
        // add this client to the game
        newGame.addClient(message.client_id, message.client_name);
        // set timeout to remove game after ten minutes of inactivity
        newGame.timeout = this.updateTimeout(newGame.id);
        this.websocketService.broadcastMessageInGame({
            "event": "player_joined",
            "client_id": message.client_id,
            "client_name": message.client_name,
            "game_name": newGame.name
        }, newGame);
        let games = this.games.map((game) => game.name);
        this.websocketService.broadcastMessage({
            "event": "new_game_launched",
            "client_id": message.client_id,
            "client_name": message.client_name,
            "games": games
        });
    }
}
exports.MainController = MainController;
//# sourceMappingURL=main.controller.js.map