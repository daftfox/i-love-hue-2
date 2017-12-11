import { Server }     from 'ws';
import * as WebSocket from 'ws';
import { Observable } from 'rxjs/Observable';
import { Observer }   from 'rxjs/Observer';
import { Client }     from '../models/client.class';
import { Game }       from '../models/game.class';

export class WebsocketService {
    private server:     Server;
    public  connection: Observable<any>;
    private clients:    Client[] = [];
    public  games:      Game[]   = [];

    constructor(websocketServer: Server) {
        this.server = websocketServer;
        this.connection = new Observable((observer: Observer<any>) => {
            this.server.on('connection', (ws: WebSocket) => {

                // store the client with an id and return it so we can use this as a reference later.
                let client = new Client(undefined, ws);
                this.clients.push(client);
                console.log(`New client connected with id: ${client.id}. Adding to the list.`);

                let updateHandler = (ws: WebSocket) => {
                    this.updatePlayerData.bind(this);
                    return this.updatePlayerData(ws);
                };

                // update player and games information every second
                let updateInterval = setInterval(() => {
                    return updateHandler(ws);
                }, 3000);

                ws.on('message', (msg: string) => {

                    // parse the message and pass it on to the observer
                    let message = JSON.parse(msg);

                    // don't bother observer with events we can handle here
                    switch (message.event) {
                        case 'player_update':
                            client.setName(message.client_name);
                            break;
                        case 'global_chat_message':
                            this.sendGlobalChat(message.client_name, client.id, message.text);
                            break;
                        case 'game_chat_message':
                            this.sendChat(message.client_name, client.id, message.game_id, message.text);
                            break;
                        default:
                            observer.next(message);
                            break;
                    }
                });

                ws.on('close', () => {
                    console.log(`Client ${client.name} with id: ${client.id} has closed the connection. Removing from the list.`);
                    clearInterval(updateInterval);
                    this.removeClient(client.id);
                });

                let gamesJson   = JSON.stringify(this.games.filter((game) => game.state !== 'initiated').map((game) => { return {name: game.name, id: game.id}; }));
                let players     = this.clients.filter((client) => client.name).map((client) => client.name);
                let playersJson = JSON.stringify(players);

                ws.send(
                    `{
                        "event": "connect_succesful",
                        "users_on_server": ${this.clients.length},
                        "client_id": "${client.id}",
                        "games": ${gamesJson},
                        "global_players": ${playersJson}
                    }`
                );
            });
        });
    }

    private sendChat(clientName: string, clientId: string, game_id: string, chatMessage: string): void {
        let game = <Game>this.getGame(game_id);
        for (let client of game.clients) {
            if (client.webSocket) {
                client.webSocket.send(
                    `{
                        "event": "game_chat_message",
                        "client_id": "${clientId}",
                        "client_name": "${clientName}",
                        "chat_message": "${chatMessage}"
                    }`
                );
            }
        }
    }

    private sendGlobalChat(clientName: string, clientId: string, chatMessage: string): void {
        for (let client of this.clients) {
            if (client.webSocket) {
                client.webSocket.send(
                    `{
                        "event": "global_chat_message",
                        "client_id": "${clientId}",
                        "client_name": "${clientName}",
                        "chat_message": "${chatMessage}"
                    }`
                );
            }
        }
    }

    private updatePlayerData(ws: WebSocket): void {
        let games = JSON.stringify(this.games.filter((game) => game.state !== 'initiated').map((game) => {
            return {id: game.id, name: game.name};
        }));
        let players = JSON.stringify(this.clients.map((client) => client.name));
        ws.send(
            `{
                "event": "data_update",
                "global_players": ${players},
                "games": ${games}
            }`
        );
    }

    public getClient(clientId: string): Client {
        return <Client> this.clients.find((client) => client.id === clientId);
    }

    private getGame(id: string): Game | void {
        let game = this.games.find((game) => game.id === id);
        if (game) {
            return game;
        }
    }

    public removeClient(id: string): void {
        let index = this.clients.findIndex((c) => c.id === id);
        this.clients.splice(index, 1);
    }

    public removeGame(id: string): void {
        let index = this.games.findIndex((c) => c.id === id);
        this.games.splice(index, 1);
    }

    public getAllClients(): Client[] {
        return this.clients;
    }

    public broadcastMessage(message: any): void {
        this.clients.forEach((client: Client) => {
            this.sendMessage(client, message);
        });
    }

    public broadcastMessageInGame(message: any, game: Game): void {
        game.getAllClients().forEach((client: Client) => {
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
                console.log(`Error ${JSON.stringify(e)} while sending message to client with id: ${client.id}. Removing ${client.id} from the list.`);
                this.removeClient(client.id);
            }
        }
    }
}