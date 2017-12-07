"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tile {
    // todo: make tile optionally immutable to create areas of the playing field that will remain static
    constructor(id, x, y, color) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
    }
    static generateId() {
        let text = "";
        let range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 5; i++) {
            text += range.charAt(Math.floor(Math.random() * range.length));
        }
        return text;
    }
}
exports.Tile = Tile;
//# sourceMappingURL=tile.class.js.map