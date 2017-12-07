import { Tile } from './tile.class';
import * as tinygradient from 'tinygradient';

export class GradientMap {
  topLeft:     string;
  topRight:    string;
  bottomLeft:  string;
  bottomRight: string;
  columns:     number;
  rows:        number;
  gradientMap: Array<any>;

  tiles: Tile[];

  constructor(topLeft, topRight, bottomLeft, bottomRight, columns, rows) {
    this.topLeft     = topLeft;
    this.topRight    = topRight;
    this.bottomLeft  = bottomLeft;
    this.bottomRight = bottomRight;
    this.columns     = columns;
    this.rows        = rows;

    this.gradientMap = this.generateGradientMap();
    this.generateTiles();
  }

  public swapTiles(action) {
    let tile1Index = this.tiles.findIndex((tile) => {
      return tile.id === action.tile1;
    });
    let tile2Index = this.tiles.findIndex((tile) => {
      return tile.id === action.tile2;
    });

    // make deep clone of tiles
    let tilesCopy =   JSON.parse(JSON.stringify(this.tiles));

    tilesCopy[tile1Index].x = this.tiles[tile2Index].x;
    tilesCopy[tile1Index].y = this.tiles[tile2Index].y;
    tilesCopy[tile2Index].x = this.tiles[tile1Index].x;
    tilesCopy[tile2Index].y = this.tiles[tile1Index].y;

    // reassign tiles. changes object reference, thus triggering the board's onChange() method
    this.tiles = tilesCopy;
  }

  private generateTiles(): void {
    this.tiles = [];
    let i;
    let j;
    for (i = 1; i <= this.rows; i++) {
      for (j = 1; j <= this.columns; j++) {
        let tile = new Tile(Tile.generateId(), i, j, this.setColor(i, j));
        this.tiles.push(tile);
      }
    }
  }

  private generateGradientMap(): Array<Array<string>> {
    let map = [];

    // fil top and bottom row
    map[0] = this.generateGradientRow(this.topLeft, this.topRight);
    map[this.rows - 1] = this.generateGradientRow(this.bottomLeft, this.bottomRight);


    // fill remaining rows
    map = this.fillEmptyRows(map);
    return map;
  }

  private generateGradientRow(color1, color2): any {
    return tinygradient(color1, color2).rgb(this.columns);
  }

  private fillEmptyRows(map): any {
    /*
     * First and last rows have already been calculated.
     * Use their leftmost and rightmost colors to calculate the gradient
     * for the leftmost and rightmost column;
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
      {color: map[0][0].toHexString(), pos: 0},
      {color: map[this.rows - 1][0], pos: 1}
    ]).rgb(this.columns);

    let rightColumn = tinygradient([
      {color: map[0][this.columns - 1].toHexString(), pos: 0},
      {color: map[this.rows - 1][this.columns - 1], pos: 1}
    ]).rgb(this.columns);

    for (let i = 0; i < this.rows; i++) {
      map[i] = tinygradient([
        {color: leftColumn[i].toHexString(), pos: 0},
        {color: rightColumn[i].toHexString(), pos: 1}
      ]).rgb(this.columns);
    }

    return map;
  }

  private setColor(x, y): string {
    return this.pickColorFromGradientMap(x, y);
  }

  private pickColorFromGradientMap(x, y): string {
    return this.gradientMap[y - 1][x - 1].toHexString();
  }
}
