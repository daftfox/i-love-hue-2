"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_class_1 = require("./helper.class");
class Pattern {
    constructor(name) {
        this.name = name;
        this.coordinates = [];
    }
}
exports.Pattern = Pattern;
class ImmutableMask {
    constructor(rows, columns, difficulty) {
        this.patterns = [
            new Pattern("borders_only"),
            new Pattern("no_borders"),
            new Pattern("four_corners")
        ];
        this.rows = rows;
        this.columns = columns;
        this.mask = this.generateMask(this.patterns[difficulty].name);
    }
    maskTiles(tiles) {
        for (let p of this.mask) {
            tiles.find((tile) => tile.x === p.x && tile.y === p.y).setImmutable();
        }
        return tiles;
    }
    scrambleTiles(tiles) {
        let coordinates = tiles
            .filter((tile) => !tile.immutable) // only scramble the mutable tiles
            .map((tile) => { return { x: tile.x, y: tile.y }; }); // return coordinates of mutable tiles
        let scrambledCoordinates = [];
        // make deep clone
        let scrambledTiles = JSON.parse(JSON.stringify(tiles));
        let i = coordinates.length;
        let j = 0;
        while (i--) {
            j = Math.floor(Math.random() * (i + 1));
            scrambledCoordinates.push(coordinates[j]);
            coordinates.splice(j, 1);
        }
        scrambledTiles = scrambledTiles
            .filter((tile) => !tile.immutable)
            .map((tile, index) => {
            if (!tile.immutable) {
                tile.x = scrambledCoordinates[index].x;
                tile.y = scrambledCoordinates[index].y;
            }
            return tile;
        }).concat(tiles.filter((tile) => tile.immutable));
        // set the tiles back in the right order. this makes it much easier to check the solution later on.
        let orderedScrambledTiles = []; // don't judge the name :|
        tiles.forEach((tile, index) => {
            let orderedTile = scrambledTiles.filter((t) => t.id === tile.id)[0];
            orderedScrambledTiles.push(orderedTile);
        });
        return orderedScrambledTiles;
    }
    generateMask(input) {
        let mask = [];
        // use supplied pattern or select one at random
        let pattern = this.patterns.find((p) => input === p.name);
        if (!pattern) {
            let randomNum = helper_class_1.Helper.rng(0, this.patterns.length - 1);
            pattern = this.patterns[randomNum];
            console.log(`Randomly selected pattern ${pattern.name}`);
        }
        /*
         * Four corners pattern
         *  --------------------
         *  | x |   |   |   | x |
         *  |   |   |   |   |   |
         *  |   |   |   |   |   |
         *  |   |   |   |   |   |
         *  |   |   |   |   |   |
         *  |   |   |   |   |   |
         *  |   |   |   |   |   |
         *  | x |   |   |   | x |
         *  ---------------------
         */
        if (pattern.name === "four_corners") {
            mask = [
                { x: 1, y: 1 },
                { x: 1, y: this.rows },
                { x: this.columns, y: 1 },
                { x: this.rows, y: this.columns }
            ];
        }
        else if (pattern.name === "no_borders") {
            for (let x = 1; x <= this.columns; x++) {
                let y = 1;
                for (y; y <= this.rows; y++) {
                    if ((y === 1 || y === this.rows) &&
                        (x === 1 || x === this.columns)) {
                        mask.push({ x: x, y: y });
                    }
                }
            }
        }
        else if (pattern.name === "borders_only") {
            for (let x = 1; x <= this.columns; x++) {
                let y = 1;
                for (y; y <= this.rows; y++) {
                    if ((y !== 1 && y !== this.rows) &&
                        (x !== 1 && x !== this.columns)) {
                        mask.push({ x: x, y: y });
                    }
                }
            }
        }
        else {
            console.log("oops...");
        }
        return mask;
    }
}
exports.ImmutableMask = ImmutableMask;
//# sourceMappingURL=immutable-mask.class.js.map