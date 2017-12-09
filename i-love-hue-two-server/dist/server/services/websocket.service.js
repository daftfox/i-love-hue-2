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
                ws.on('message', (msg) => {
                    // parse the message and pass it on to the observer
                    let message = JSON.parse(msg);
                    observer.next(message);
                });
                // store the client with an id and return it so we can use this as a reference later.
                let client = new client_class_1.Client(client_class_1.Client.generateId(), undefined, ws);
                this.clients.push(client);
                ws.on('close', () => {
                    this.removeClient(client);
                });
                let games = JSON.stringify(this.games.map((game) => game.name));
                ws.send(`{
                        "event": "connect_succesful",
                        "users_on_server": ${this.clients.length},
                        "client_id": "${client.id}",
                        "games": ${games}
                    }`);
            });
        });
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
                this.removeClient(client);
            }
        }
    }
}
exports.WebsocketService = WebsocketService;
//# sourceMappingURL=websocket.service.js.map