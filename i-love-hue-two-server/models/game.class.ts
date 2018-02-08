import { Map }              from './map.class';
import { setInterval }      from 'timers';
import { WebsocketService } from '../services/websocket.service';
import { Client }           from './client.class';
import { ImmutableMask }    from './immutable-mask.class';
import { Helper }           from './helper.class';

export class GameMode {
    rows:    number;
    columns: number;

    constructor(rows: number, columns: number) {
        this.rows    = rows;
        this.columns = columns
    }
}

export class Game {
    id:               string;
    name:             string;
    map:              Map;
    mode:             GameMode;
    clients:          Client[]   = [];
    chatMessages:     Array<any> = [];
    status:           number;
    time:             number = 0;
    difficulty:       number;
    clock:            any;
    timeout:          any;
    websocketService: WebsocketService;

    public static GAMEMODE = [
        new GameMode(8, 8),             // easy
        new GameMode(10, 10),           // medium
        new GameMode(15, 15)            // hard
    ];

    private static COLORSETS = [
        ['#474A9B', '#1E966C', '#C74FAA', '#F5DFB8'],
        ['#EFFC54', '#78EFC5', '#FD42CD', '#4A45D7'],
        ['#E84040', '#1D2F31', '#D4E875', '#00DCE4'],
        ['#57E048', '#FBFA6C', '#523F76', '#A361C2'],
        ['#6EB7C8', '#F5D75F', '#174BDC', '#F67E5B'],
        ['#6E1F77', '#E5134A', '#097FF8', '#FCD7BD'],
        ['#BB68DC', '#15346D', '#E1C38D', '#29B26A'],
        ['#5C2AE2', '#F85C66', '#3BDCCC', '#F2C93B']
    ];

    constructor(mode:             number,
                name:             string,
                websocketService: WebsocketService,
                difficulty:       number) {
        this.name             = name || 'Game'+Helper.rng(0, 99);
        this.mode             = Game.GAMEMODE[mode];
        this.websocketService = websocketService;
        this.difficulty       = difficulty;
        this.map              = this.generateMap();
        this.status           = 0;
        this.id               = Helper.generateId();
    }

    public generateMap(): Map {
        return new Map(
            this.mode.rows,
            this.mode.columns,
            new ImmutableMask(this.mode.rows, this.mode.columns, this.difficulty),
            ...Game.COLORSETS[Helper.rng(0, Game.COLORSETS.length - 1)]
        );
    }

    public newRound(callback: any): void {
        this.map = this.generateMap();
        this.generateAndSetTiles();

        callback();
    }

    public initiate(callback: any): void {
        this.status = 1;
        //this.startClock();

        this.generateAndSetTiles();
        callback(this);
    }

    private generateAndSetTiles() {
        for (let client of this.clients) {
            client.setTiles(this.map.getScrambledTiles());
        }
    }

    /*public startClock(): void {
        this.time = 0;
        this.clock = setInterval(() => {
            this.time++;
        }, 1000);
    }*/

    /*public stopClock(): void {
        clearInterval(this.clock);
    }*/

    public swapTiles(clientId: string, tileSwap: any, playerVictory: any): void {
        let client = this.getClient(clientId);
        client.swapTiles(tileSwap);
        playerVictory(this.map.checkSolution(client.tiles), this);
    }

    public getClient(clientId: string): Client {
        return <Client> this.clients.find((client) => client.id === clientId);
    }

    public getAllClients(): Client[] {
        return this.clients;
    }

    public addClient(clientId: string, clientName: string): void {
        let client = this.websocketService.getClient(clientId);

        if (client) {
            client.setName(clientName);
            this.clients.push(client);
        }
    }

    public removeClient(id: string): void {
        let index = this.clients.findIndex((client) => client.id === id);
        this.clients.splice(index, 1);
    }
}