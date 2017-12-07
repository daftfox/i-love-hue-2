import { Server } from 'ws';
import * as WebSocket from 'ws';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Client } from '../models/client.class';
import { Game } from '../models/game.class';

export class WebsocketService {
    private server: Server;
    private clients: Client[] = [];
    public connection: Observable<any>;
    public games: Game[] = [];

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
                let client = new Client(Client.generateId(), undefined, ws);
                this.clients.push(client);

                ws.on('close', () => {
                    this.removeClient(client);
                });

                let games = JSON.stringify(this.games.map((game) => game.name));

                ws.send(
                    `{
                        "event": "connect_succesful",
                        "users_on_server": ${this.clients.length},
                        "client_id": "${client.id}",
                        "games": ${games}
                    }`
                );
            });
        });
    }

    public getClient(clientId: string): Client {
        return <Client> this.clients.find((client) => client.id === clientId);
    }

    private removeClient(client: Client): void {
        let indexOfClient = this.clients.findIndex((c) => c.id === client.id);
        this.clients.splice(indexOfClient, 1);

    }

    public getAllClients(): Client[] {
        return this.clients;
    }

    // todo: group clients per game. we don't want to spam our message stream to everyone who is connected.
    public broadcastMessage(message: any): void {
        this.clients.forEach((client: Client) => {
            this.sendMessage(client, message);
        });
    }

    public sendMessageToClient(clientId: string, message: any): void {
        let client = <Client> this.clients.find((client) => client.id === clientId);
        if (client) {
            this.sendMessage(client, message);
        } else {
            // we lost a client?!
            console.log('uh oh..');
        }
    }

    private sendMessage(client: Client, message: any): void {
        if (client.webSocket) {
            try {
                client.webSocket.send(JSON.stringify(message));
            } catch(e) {
                this.removeClient(client);
            }
        }
    }
}