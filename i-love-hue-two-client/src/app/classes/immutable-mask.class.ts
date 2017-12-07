import { Tile } from './tile.class';
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
    new Pattern("four_corners"),
    new Pattern("no_borders"),
    new Pattern("borders_only")/*,
    new Pattern("minefield"),*/
  ];

  constructor(pattern: string, rows: number, columns: number, tiles: Tile[]) {
    this.rows    = rows;
    this.columns = columns;

    this.mask = this.generateMask(pattern);
  }

  public maskTiles(tiles: Tile[]): Tile[] {
    // todo: return masked tiles
    return tiles;
  }

  private generateMask(input: string): Array<any> {
    // use supplied pattern or select one at random
    let pattern = this.patterns.find((p) => input === p.name);
    if (!pattern) {
      pattern = this.patterns[ImmutableMask.rng(0, this.patterns.length)];
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
      return [
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
      let mask = [];
      for (let x = 1; x <= this.columns; x++) {
        let y = 1;
        if (x !== 1 && x !== this.columns) {
          mask.push({x: x, y: y});
        }
        for (y; y <= this.rows; y++) {
          if (y !== 1 && y !== this.rows) {
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
      let mask = [];
      for (let x = 1; x <= this.columns; x++) {
        let y = 1;
        if (x === 1 || x === this.columns) {
          mask.push({x: x, y: y});
        }
        for (y; y <= this.rows; y++) {
          if (y === 1 || y === this.rows) {
            mask.push({x: x, y: y});
          }
        }
      }
    } else {
      console.log("oops...");
    }
  }

  private static rng(min: number, max: number): number {
    return Math.floor(Math.random()*(max-min+1)+min);
  }
}
