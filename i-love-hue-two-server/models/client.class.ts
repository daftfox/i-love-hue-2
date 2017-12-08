import * as WebSocket from 'ws';
import { Tile } from './tile.class';

export class Client {
    id:         string;
    name?:      string;
    tiles:      Tile[];
    tileSwaps:  number;
    isReady:    boolean;
    score:      number;
    webSocket?: WebSocket;

    constructor(id: string, name?: string, webSocket?: WebSocket) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.tileSwaps = 0;
        this.isReady = false;
        if (webSocket) {
            this.webSocket = webSocket;
        }
    }

    public toggleReady(): void {
        this.isReady = !this.isReady;
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

    public static generateId(): string {
        let text  = "";
        let range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 5; i++) {
            text += range.charAt(Math.floor(Math.random() * range.length));
        }

        return text;
    }
}