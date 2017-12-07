import * as WebSocket from 'ws';
import { Tile } from './tile.class';

export class Client {
    id:        string;
    webSocket: WebSocket;
    tiles:     Tile[];

    constructor(id: string, webSocket: WebSocket) {
        this.id = id;
        this.webSocket = webSocket;
    }

    public setTiles(tiles: Tile[]): void {
        this.tiles = tiles;
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