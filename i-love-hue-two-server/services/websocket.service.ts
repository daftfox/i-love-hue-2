import { Server } from 'ws';
import * as WebSocket from 'ws';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Client } from '../models/client.class';

export class WebsocketService {
    private server: Server;
    private clients: Client[] = [];
    public connection: Observable<any>;

    constructor(websocketServer: Server) {
        this.server = websocketServer;
        this.connection = new Observable((observer: Observer<any>) => {
            this.server.on('connection', (ws: WebSocket) => {

                ws.on('message', (msg: string) => {
                    // parse the message and pass it on to the observer
                    let message = JSON.parse(msg);
                    observer.next(message);
                });

                // store the client with an id and return it so we can use this as a reference later.
                let client = new Client(Client.generateId(), ws);
                this.clients.push(client);
                console.log(client.id);
                ws.send(
                    `{
                        "event": "connect_succesful",
                        "users_on_server": ${this.clients.length},
                        "client_id: "${client.id}"
                    }`
                );
            });
        });
    }

    public getClient(clientId: string): Client {
        return <Client> this.clients.find((client) => client.id === clientId);
    }

    // todo: group clients per game. we don't want to spam our message stream to everyone who is connected.
    public broadcastMessage(message: any): void {
        this.server.clients.forEach((client: WebSocket) => {
            this.sendMessage(client, message);
        });
    }

    public sendMessageToClient(clientId: string, message: any): void {
        let ws = (<Client> this.clients.find((client) => client.id === clientId)).webSocket;
        if (ws) {
            this.sendMessage(ws, message);
        } else {
            // we lost a client?!
            console.log('uh oh..');
        }
    }

    private sendMessage(ws: WebSocket, message: any): void {
        ws.send(JSON.stringify(message));
    }
}

/*

* */