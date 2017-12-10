import { Tile } from './tile.class';
import {Helper} from './helper.class';

export class Pattern {
  name:        string;
  coordinates: Array<any>;

  constructor(name: string){
    this.name = name;
    this.coordinates = [];
  }
}

export class ImmutableMask {
  mask:    Array<any>;
  rows:    number;
  columns: number;
  patterns = [
    new Pattern("borders_only"),
    new Pattern("no_borders"),
    new Pattern("four_corners")
  ];

  constructor(rows: number, columns: number, difficulty: number) {
    this.rows    = rows;
    this.columns = columns;

    this.mask = this.generateMask(this.patterns[difficulty].name);
  }

  public maskTiles(tiles: Tile[]): Tile[] {
    for (let p of this.mask) {
      (<Tile> tiles.find((tile) => tile.x === p.x && tile.y === p.y)).setImmutable();
    }
    return tiles;
  }

  public scrambleTiles(tiles: Tile[]): Tile[] {
    let coordinates = tiles
        .filter((tile) => !tile.immutable)                  // only scramble the mutable tiles
        .map((tile) => {return {x: tile.x, y: tile.y}});    // return coordinates of mutable tiles
    let scrambledCoordinates: Array<any> = [];

    // make deep clone
    let scrambledTiles = <Tile[]> JSON.parse(JSON.stringify(tiles));

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
        }).concat(
            tiles.filter((tile) => tile.immutable)
        );

    // set the tiles back in the right order. this makes it much easier to check the solution later on.
    let orderedScrambledTiles: Tile[] = [];         // don't judge the name :|
    tiles.forEach((tile, index) => {
      let orderedTile = <Tile> scrambledTiles.filter((t) => t.id === tile.id)[0];
      orderedScrambledTiles.push(orderedTile);
    });

    return orderedScrambledTiles;
  }

  private generateMask(input?: string): Array<any> {
    let mask = [];
    // use supplied pattern or select one at random
    let pattern = this.patterns.find((p) => input === p.name);
    if (!pattern) {
      let randomNum = Helper.rng(0, this.patterns.length-1);
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
      mask =  [
        {x: 1, y: 1},
        {x: 1, y: this.rows},
        {x: this.columns, y: 1},
        {x: this.rows, y: this.columns}
      ]
    }

    /*
     * No borders pattern
     *  --------------------
     *  | x | x | x | x | x |
     *  | x |   |   |   | x |
     *  | x |   |   |   | x |
     *  | x |   |   |   | x |
     *  | x |   |   |   | x |
     *  | x |   |   |   | x |
     *  | x |   |   |   | x |
     *  | x | x | x | x | x |
     *  ---------------------
     */

    else if (pattern.name === "no_borders") {
      for (let x = 1; x <= this.columns; x++) {
        let y = 1;
        for (y; y <= this.rows; y++) {
          if ((y === 1 || y === this.rows) &&
              (x === 1 || x === this.columns)) {
            mask.push({x: x, y: y});
          }
        }
      }
    }

    /*
     * Borders only pattern
     *  --------------------
     *  |   |   |   |   |   |
     *  |   | x | x | x |   |
     *  |   | x | x | x |   |
     *  |   | x | x | x |   |
     *  |   | x | x | x |   |
     *  |   | x | x | x |   |
     *  |   | x | x | x |   |
     *  |   |   |   |   |   |
     *  ---------------------
     */

    else if (pattern.name === "borders_only") {
      for (let x = 1; x <= this.columns; x++) {
        let y = 1;
        for (y; y <= this.rows; y++) {
          if ((y !== 1 && y !== this.rows) &&
              (x !== 1 && x !== this.columns)) {
            mask.push({x: x, y: y});
          }
        }
      }
    } else {
      console.log("oops...");
    }
    return mask;
  }
}
