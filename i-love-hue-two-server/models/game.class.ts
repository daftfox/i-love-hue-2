import { Map } from './map.class';
import { setInterval } from 'timers';
import { WebsocketService } from '../services/websocket.service';
import { Client } from './client.class';
import { Tile } from './tile.class';
import {ImmutableMask} from "../../i-love-hue-two-client/src/app/classes/immutable-mask.class";

export class GameMode {
    rows:    number;
    columns: number;

    constructor(rows: number, columns: number) {
        this.rows    = rows;
        this.columns = columns
    }
}

export class Game {
    name:             string;
    map:              Map;
    mode:             GameMode;
    clients:          Client[] = [];
    state:            string;
    time:             number;
    clock:            any;
    websocketService: WebsocketService;

    public static GAMEMODE = [
        new GameMode(8, 8),             // easy
        new GameMode(10, 10),           // medium
        new GameMode(15, 15)            // hard
    ];

    private static COLORSETS = [
        ['#474A9B', '#1E966C', '#C74FAA', '#F5DFB8'],
        ['#EFFC54', '#78EFC5', '#FD42CD', '#4A45D7'],
        ['#E84040', '#1D2F31', '#D4E875', '#00DCE4']
    ];

    constructor(mode:             number,
                name:             string,
                websocketService: WebsocketService) {
        this.name = name;
        this.mode = Game.GAMEMODE[mode];
        this.websocketService = websocketService;
        this.map  = new Map(
            this.mode.rows,
            this.mode.columns,
            ...Game.COLORSETS[0]
        );
        this.state = 'ready';
    }

    public initiate(): void {
        this.state = 'initiated';
        this.startClock();

        let tiles = ImmutableMask.maskTiles(this.tiles);
        //tiles = this.scrambleTiles(tiles);


        for (let client of this.clients) {
            client.setTiles(tiles);
        }
    }

    public startClock(): void {
        this.time = 0;
        this.clock = setInterval(() => {
            this.time++;
        }, 1000);
    }

    public stopClock(): void {
        this.clock();
    }

    private scrambleTiles(input: Tile[]): Tile[] {
        let tiles = input;

        return tiles;
    }

    private applyImmutableMask(input: Tile[]): Tile[] {
        let tiles = input;
        return tiles;
    }

    public swapTiles(clientId: string, tileSwap: any): void {
        let client = this.getClient(clientId);
        client.swapTiles(tileSwap);
    }

    private getClient(clientId: string): Client {
        return <Client> this.clients.find((client) => client.id === clientId);
    }

    public addClient(client: string): void {
        this.clients.push(this.websocketService.getClient(client));
    }
}