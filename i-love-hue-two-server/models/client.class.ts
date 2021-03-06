import * as WebSocket from 'ws';
import { Tile }       from './tile.class';
import { Helper }     from './helper.class';

export class Client {
    id:         string;
    name?:      string;
    tiles:      Tile[];
    tileSwaps:  number;
    status:     number;
    score:      number;
    webSocket?: WebSocket;

    constructor(name?: string, webSocket?: WebSocket) {
        this.id        = Helper.generateId();
        this.name      = name;
        this.score     = 0;
        this.tileSwaps = 0;
        this.status    = 0;

        // Only used by the server
        if (webSocket) {
            this.webSocket = webSocket;
        }
    }

    // 0: connected
    // 1: in_game_lobby
    // 2: ready
    // 3: in_game
    // todo: make enum or other immutable set of states
    public setStatus(status: number): void {
        this.status = status;
    }

    public incrementScore(): void {
        this.score++;
    }

    public setTiles(tiles: Tile[]): void {
        this.tiles = tiles;
    }

    public setName(name: string): Client {
        this.name = name;
        return this;
    }

    public swapTiles(tileSwap: any): void {
        let tile1Index = this.tiles.findIndex((tile) => {
            return tile.id === tileSwap.from;
        });
        let tile2Index = this.tiles.findIndex((tile) => {
            return tile.id === tileSwap.to;
        });

        // make deep clone of tiles
        let tilesCopy = JSON.parse(JSON.stringify(this.tiles));

        tilesCopy[tile1Index].x = this.tiles[tile2Index].x;
        tilesCopy[tile1Index].y = this.tiles[tile2Index].y;
        tilesCopy[tile2Index].x = this.tiles[tile1Index].x;
        tilesCopy[tile2Index].y = this.tiles[tile1Index].y;

        // reassign tiles. changes object reference, thus triggering the board's onChange() method
        this.tiles = tilesCopy;
        this.tileSwaps++;
    }
}