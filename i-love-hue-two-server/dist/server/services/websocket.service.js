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
                // store the client with an id and return it so we can use this as a reference later.
                let client = new client_class_1.Client(undefined, ws);
                this.clients.push(client);
                console.log(`New client connected with id: ${client.id}. Adding to the list.`);
                let updateHandler = (ws) => {
                    this.updatePlayerData.bind(this);
                    return this.updatePlayerData(ws);
                };
                // update player and games information every second
                let updateInterval = setInterval(() => {
                    return updateHandler(ws);
                }, 3000);
                ws.on('message', (msg) => {
                    // parse the message and pass it on to the observer
                    let message = JSON.parse(msg);
                    // don't bother observer with events we can handle here
                    switch (message.event) {
                        case 'player_update':
                            client.setName(message.client_name);
                            break;
                        case 'global_chat_message':
                            this.sendChat(message.client_name, client.id, message.text);
                            break;
                        default:
                            observer.next(message);
                            break;
                    }
                });
                ws.on('close', () => {
                    console.log(`Client ${client.name} with id: ${client.id} has closed the connection. Removing from the list.`);
                    clearInterval(updateInterval);
                    this.removeClient(client);
                });
                let games = JSON.stringify(this.games.filter((game) => game.state !== 'initiated').map((game) => game.name));
                let players = JSON.stringify(this.clients.map((client) => client.name));
                ws.send(`{
                        "event": "connect_succesful",
                        "users_on_server": ${this.clients.length},
                        "client_id": "${client.id}",
                        "games": ${games},
                        "global_players": ${players}
                    }`);
            });
        });
    }
    sendChat(clientName, clientId, chatMessage) {
        for (let client of this.clients) {
            if (client.webSocket) {
                client.webSocket.send(`{
                        "event": "global_chat_message",
                        "client_id": "${clientId}",
                        "client_name": "${clientName}",
                        "chat_message": "${chatMessage}"
                    }`);
            }
        }
    }
    updatePlayerData(ws) {
        let games = JSON.stringify(this.games.filter((game) => game.state !== 'initiated').map((game) => {
            return { id: game.id, name: game.name };
        }));
        let players = JSON.stringify(this.clients.map((client) => client.name));
        ws.send(`{
                "event": "data_update",
                "global_players": ${players},
                "games": ${games}
            }`);
    }
    getClient(clientId) {
        return this.clients.find((client) => client.id === clientId);
    }
    removeClient(client) {
        let indexOfClient = this.clients.findIndex((c) => c.id === client.id);
        this.clients.splice(indexOfClient, 1);
    }
    getAllClients() {
        return this.clients;
    }
    broadcastMessage(message) {
        this.clients.forEach((client) => {
            this.sendMessage(client, message);
        });
    }
    broadcastMessageInGame(message, game) {
        game.getAllClients().forEach((client) => {
            this.sendMessage(client, message);
        });
    }
    sendMessageToClient(clientId, message) {
        let client = this.clients.find((client) => client.id === clientId);
        if (client) {
            this.sendMessage(client, message);
        }
        else {
            // we lost a client?!
            console.log('uh oh..');
        }
    }
    sendMessage(client, message) {
        if (client.webSocket) {
            try {
                client.webSocket.send(JSON.stringify(message));
            }
            catch (e) {
                console.log(`Error ${JSON.stringify(e)} while sending message to client with id: ${client.id}. Removing ${client.id} from the list.`);
                this.removeClient(client);
            }
        }
    }
}
exports.WebsocketService = WebsocketService;
//# sourceMappingURL=websocket.service.js.map