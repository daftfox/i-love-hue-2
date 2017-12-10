"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_class_1 = require("./helper.class");
class Client {
    constructor(name, webSocket) {
        this.id = helper_class_1.Helper.generateId();
        this.name = name;
        this.score = 0;
        this.tileSwaps = 0;
        this.isReady = false;
        if (webSocket) {
            this.webSocket = webSocket;
        }
    }
    toggleReady() {
        this.isReady = !this.isReady;
    }
    incrementScore() {
        this.score++;
    }
    setTiles(tiles) {
        this.tiles = tiles;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    swapTiles(tileSwap) {
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
exports.Client = Client;
//# sourceMappingURL=client.class.js.map