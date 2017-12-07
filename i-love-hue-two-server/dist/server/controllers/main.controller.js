"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_service_1 = require("../services/websocket.service");
const game_class_1 = require("../models/game.class");
class MainController {
    constructor(websocketServer) {
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
    playerReady(message) {
        let clients = this.game.getAllClients();
        let client = this.game.getClient(message.client_id);
        //console.log(client.isReady);
        client.toggleReady();
        //console.log(client.isReady);
        for (let client of clients) {
            this.websocketService.sendMessageToClient(client.id, {
                "event": "player_ready",
                "client_id": message.client_id
            });
        }
    }
    playerJoinGame(message) {
        this.game.addClient(message.client_id, message.client_name);
        let clients = this.game.getAllClients();
        let newPlayer = this.game.getClient(message.client_id);
        console.log(newPlayer.tiles);
        for (let client of clients) {
            // send new player a list of all players already in the lobby
            this.websocketService.sendMessageToClient(newPlayer.id, {
                "event": "player_joined",
                "client_id": client.id,
                "client_name": client.name,
                "client_ready": client.isReady,
                "client_tiles": client.tiles
            });
            // notify players in the lobby of new player
            this.websocketService.sendMessageToClient(client.id, {
                "event": "player_joined",
                "client_id": newPlayer.id,
                "client_name": newPlayer.name,
                "client_ready": false,
                "client_tiles": newPlayer.tiles
            });
        }
    }
    initiateGame(message) {
        this.game.initiate(() => {
            let clients = this.game.getAllClients().map((c) => { return { id: c.id, tiles: c.tiles }; });
            this.websocketService.broadcastMessage({
                "event": "initiate_game",
                "players": clients
            });
        });
    }
    playerTileSwap(message) {
        this.game.swapTiles(message.client_id, message.tile_swap, (playerVictory) => {
            for (let client of this.game.getAllClients()) {
                if (client.id !== message.client_id) {
                    this.websocketService.sendMessageToClient(client.id, {
                        "event": "player_tile_swap",
                        "client_id": message.client_id,
                        "tile_swap": {
                            "from": message.tile_swap.from,
                            "to": message.tile_swap.to
                        }
                    });
                }
            }
            if (playerVictory) {
                this.websocketService.broadcastMessage({
                    "event": "player_win",
                    "client_id": message.client_id
                });
            }
        });
        for (let client of this.game.getAllClients()) {
            if (client.id !== message.client_id) {
                this.websocketService.sendMessageToClient(client.id, {
                    "event": "player_tile_swap",
                    "client_id": message.client_id,
                    "tile_swap": {
                        "from": message.tile_swap.from,
                        "to": message.tile_swap.to
                    }
                });
            }
        }
    }
    playerForfeit(message) {
        //this.game.removeClient(message.client_id);
        this.websocketService.broadcastMessage({
            "event": "player_forfeit",
            "client_id": message.client_id
        });
    }
    startNewGame(message) {
        // create a new game
        this.game = new game_class_1.Game(message.game.mode, message.game.name, this.websocketService, message.game.difficulty);
        this.websocketService.games.push(this.game);
        console.log(`Game ${this.game.name} started!`);
        // add this client to the game
        this.game.addClient(message.client_id, message.client_name);
        this.websocketService.broadcastMessage({
            "event": "player_joined",
            "client_id": message.client_id,
            "client_name": message.client_name
        });
    }
}
exports.MainController = MainController;
//# sourceMappingURL=main.controller.js.map