"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const client_class_1 = require("../models/client.class");
class WebsocketService {
    constructor(websocketServer) {
        this.clients = [];
        this.games = [];
        this.server = websocketServer;
        this.connection = new Observable_1.Observable((observer) => {
            this.server.on('connection', (ws) => {
                // store the client and return it so we can use this as a reference later.
                let client = new client_class_1.Client(undefined, ws);
                this.clients.push(client);
                console.log(`New client connected with id: ${client.id}. Adding to the list.`);
                let updateHandler = () => {
                    this.updatePlayerData.bind(this);
                    return this.updatePlayerData(client.id);
                };
                // update player and games information every three seconds
                let updateInterval = setInterval(() => {
                    return updateHandler();
                }, 3000);
                ws.on('message', (msg) => {
                    // parse the message and pass it on to the observer
                    let message = JSON.parse(msg);
                    // don't bother observer with events we can handle here
                    switch (message.event) {
                        case 'player_update':
                            client.setName(message.client_name);
                            break;
                        case 'game_chat_message':
                        case 'global_chat_message':
                            this.sendChat(message);
                            break;
                        default:
                            observer.next(message);
                            break;
                    }
                });
                // Remove the client on connection close
                ws.on('close', () => {
                    console.log(`Client ${client.name} with id: ${client.id} has closed the connection. Removing from the list.`);
                    clearInterval(updateInterval);
                    this.removeClient(client.id);
                });
                let games = this.games.filter((game) => game.status === 0).map((game) => { return { name: game.name, id: game.id }; });
                let players = this.clients.filter((client) => client.name).map((client) => {
                    return {
                        name: client.name,
                        status: client.status
                    };
                });
                let message = {
                    event: 'connect_successful',
                    client_id: client.id,
                    games: games,
                    global_players: players
                };
                this.sendMessageToClient(client.id, message);
            });
        });
    }
    sendChat(message) {
        let chatMessage = {
            event: message.event,
            client_id: message.client_id,
            client_name: message.client_name,
            chat_message: message.chat_message
        };
        if (message.game_id) {
            this.broadcastMessageInGame(chatMessage, message.game_id);
        }
        else {
            this.broadcastMessage(chatMessage);
        }
    }
    updatePlayerData(clientId) {
        let games = this.getUpdatedGames();
        let players = this.getUpdatedClients();
        let message = {
            event: 'data_update',
            global_players: players,
            games: games
        };
        this.sendMessageToClient(clientId, message);
    }
    getUpdatedClients() {
        return this.clients.map((client) => {
            return {
                id: client.id,
                name: client.name,
                status: client.status
            };
        });
    }
    getUpdatedGames() {
        return this.games.map((game) => {
            return {
                id: game.id,
                name: game.name,
                status: game.status
            };
        });
    }
    // Get client from the current list of games by id
    getClient(clientId) {
        return this.clients.find((client) => client.id === clientId);
    }
    // Get game from the current list of games by id
    getGame(gameId) {
        return this.games.find((game) => game.id === gameId);
    }
    // Remove a client by id
    removeClient(clientId) {
        let index = this.clients.findIndex((c) => c.id === clientId);
        this.clients.splice(index, 1);
    }
    // Remove a game by id
    removeGame(clientId) {
        let index = this.games.findIndex((c) => c.id === clientId);
        this.games.splice(index, 1);
    }
    // Return all currently connected clients
    getAllClients() {
        return this.clients;
    }
    // Send message to every connected client
    broadcastMessage(message) {
        this.clients.forEach((client) => {
            this.sendMessageToClient(client.id, message);
        });
    }
    // Send message to every player in the game whose id is supplied
    broadcastMessageInGame(message, gameId) {
        let game = this.getGame(gameId);
        if (game) {
            game.getAllClients().forEach((client) => {
                this.sendMessageToClient(client.id, message);
            });
        }
    }
    // Send a websocket message
    sendMessageToClient(clientId, message) {
        let client = this.getClient(clientId);
        if (client && client.webSocket) {
            try {
                client.webSocket.send(JSON.stringify(message));
            }
            catch (e) {
                console.log(`Error ${JSON.stringify(e)} while sending message to client with id: ${client.id}. Removing ${client.id} from the list.`);
                this.removeClient(client.id);
            }
        }
    }
}
exports.WebsocketService = WebsocketService;
//# sourceMappingURL=websocket.service.js.map