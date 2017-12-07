"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tile_class_1 = require("./tile.class");
const tinygradient = require('tinygradient');
class Map {
    constructor(rows, columns, ...colors) {
        this.rows = rows;
        this.columns = columns;
        this.colorTopLeft = colors[0];
        this.colorTopRight = colors[1];
        this.colorBottomLeft = colors[2];
        this.colorBottomRight = colors[3];
        // first generate a two dimensional gradient map
        this.generateGradientMap();
        // secondly, generate the tiles
        this.generateTiles();
    }
    generateTiles() {
        this.tiles = [];
        for (let i = 1; i <= this.rows; i++) {
            for (let j = 1; j <= this.columns; j++) {
                let tile = new tile_class_1.Tile(tile_class_1.Tile.generateId(), i, j, this.setColor(i, j));
                this.tiles.push(tile);
            }
        }
    }
    generateGradientMap() {
        let map = [];
        // fill top and bottom row
        map[0] = this.generateGradientRow(this.colorTopLeft, this.colorTopRight);
        map[this.rows - 1] = this.generateGradientRow(this.colorBottomLeft, this.colorBottomRight);
        // fill remaining rows
        this.gradientMap = this.fillEmptyRows(map);
    }
    generateGradientRow(color1, color2) {
        return tinygradient(color1, color2).rgb(this.columns);
    }
    fillEmptyRows(map) {
        /*
         * First and last rows have already been calculated.
         * Use their leftmost and rightmost colors to calculate the gradient
         * for the leftmost and rightmost columns;
         *
         * Use their respective values to fill in the gaps in the rows
         * _______________________________
         * | y| y| y| y| y| y| y| y| y| y|
         * |  |  |  |  |  |  |  |  |  |  |
         * |  |  |  |  |  |  |  |  |  |  |
         * |  |  |  |  |  |  |  |  |  |  |
         * |  |  |  |  |  |  |  |  |  |  |
         * |  |  |  |  |  |  |  |  |  |  |
         * |  |  |  |  |  |  |  |  |  |  |
         * |  |  |  |  |  |  |  |  |  |  |
         * |  |  |  |  |  |  |  |  |  |  |
         * | y| y| y| y| y| y| y| y| y| y|
         * _______________________________
         */
        let leftColumn = tinygradient([
            { color: map[0][0].toHexString(), pos: 0 },
            { color: map[this.rows - 1][0], pos: 1 }
        ]).rgb(this.columns);
        let rightColumn = tinygradient([
            { color: map[0][this.columns - 1].toHexString(), pos: 0 },
            { color: map[this.rows - 1][this.columns - 1], pos: 1 }
        ]).rgb(this.columns);
        for (let i = 0; i < this.rows; i++) {
            map[i] = tinygradient([
                { color: leftColumn[i].toHexString(), pos: 0 },
                { color: rightColumn[i].toHexString(), pos: 1 }
            ]).rgb(this.columns);
        }
        return map;
    }
    setColor(x, y) {
        return this.pickColorFromGradientMap(x, y);
    }
    pickColorFromGradientMap(x, y) {
        return this.gradientMap[y - 1][x - 1].toHexString();
    }
}
exports.Map = Map;
//# sourceMappingURL=map.class.js.map