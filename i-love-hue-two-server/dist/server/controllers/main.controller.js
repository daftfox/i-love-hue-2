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
        this.websocketService.broadcastMessage(`{
                "event": "player_ready",
                "clientId": "${message.clientId}"
            }`);
    }
    initiateGame(message) {
        //this.game.initiate();
        this.websocketService.broadcastMessage(`{
                "event": "initiate_game"
            }`);
    }
    playerTileSwap(message) {
        // todo: add win condition
        //this.game.swapTiles(message.clientId, message.tile_swap);
        this.websocketService.broadcastMessage(`{
                "event": "player_tile_swap",
                "clientId": "${message.clientId}",
                "tile_swap": {
                    "from": {
                        "x": ${message.tile_swap.from.x},
                        "y": ${message.tile_swap.from.y}
                    },
                    "to": {
                        "x": ${message.tile_swap.to.x},
                        "y": ${message.tile_swap.to.y}
                    }
                }
            }`);
    }
    playerForfeit(message) {
        //this.game.removeClient(message.clientId);
        this.websocketService.broadcastMessage(`{
                "event": "player_forfeit",
                "clientId": "${message.clientId}"
            }`);
    }
    startNewGame(message) {
        // create a new game
        this.game = new game_class_1.Game(message.game.mode, message.game.name);
        console.log(`Game ${this.game.name} started!`);
        // add this client to the game
        this.game.addClient(message.clientId);
        this.websocketService.broadcastMessage(`{
                "event": "player_joined",
                "clientId": "${message.clientId}",
            }`);
    }
}
exports.MainController = MainController;
//# sourceMappingURL=main.controller.js.map