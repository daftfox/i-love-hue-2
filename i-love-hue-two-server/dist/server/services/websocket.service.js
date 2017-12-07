"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const client_class_1 = require("../models/client.class");
class WebsocketService {
    constructor(websocketServer) {
        this.clients = [];
        this.server = websocketServer;
        this.connection = new Observable_1.Observable((observer) => {
            this.server.on('connection', (ws) => {
                ws.on('message', (msg) => {
                    // parse the message and pass it on to the observer
                    let message = JSON.parse(msg);
                    observer.next(message);
                });
                // store the client with an id and return it so we can use this as a reference later.
                let client = new client_class_1.Client(client_class_1.Client.generateId(), ws);
                this.clients.push(client);
                console.log(client.id);
                ws.send(`{
                        "event": "connect_succesful",
                        "users_on_server": ${this.clients.length},
                        "client_id: "${client.id}"
                    }`);
            });
        });
    }
    // todo: group clients per game. we don't want to spam our message stream to everyone who is connected.
    broadcastMessage(message) {
        this.server.clients.forEach((client) => {
            this.sendMessage(client, message);
        });
    }
    sendMessageToClient(clientId, message) {
        let ws = this.clients.find((client) => client.id === clientId).webSocket;
        if (ws) {
            this.sendMessage(ws, message);
        }
        else {
            // we lost a client?!
            console.log('uh oh..');
        }
    }
    sendMessage(ws, message) {
        ws.send(JSON.stringify(message));
    }
}
exports.WebsocketService = WebsocketService;
/*

* */ 
//# sourceMappingURL=websocket.service.js.map