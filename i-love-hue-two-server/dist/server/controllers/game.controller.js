"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_service_1 = require("../services/websocket.service");
class GameController {
    constructor(websocketServer) {
        console.log('test controller');
        this.websocketService = new websocket_service_1.WebsocketService(websocketServer);
    }
}
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map