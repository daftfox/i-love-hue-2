import { Tile }    from './tile.class';
const tinygradient = require('tinygradient');

export class Map {
    private rows:                 number;
    private columns:              number;
    private colorTopLeft:         string;
    private colorTopRight:        string;
    private colorBottomLeft:      string;
    private colorBottomRight:     string;
    
    public  tiles:                Tile[];
    private gradientMap:          Array<any>;

    constructor(rows:             number,
                columns:          number,
                ...colors:        Array<string>
    ) {
        this.rows                 = rows;
        this.columns              = columns;
        this.colorTopLeft         = colors[0];
        this.colorTopRight        = colors[1];
        this.colorBottomLeft      = colors[2];
        this.colorBottomRight     = colors[3];

        // first generate a two dimensional gradient map
        this.generateGradientMap();

        // secondly, generate the tiles
        this.generateTiles();
    }

    private generateTiles(): void {
        this.tiles = [];
        for (let y = 1; y <= this.rows; y++) {
            for (let x = 1; x <= this.columns; x++) {
                let tile = new Tile(Tile.generateId(), y, x, this.setColor(y, x));
                this.tiles.push(tile);
            }
        }
    }

    private generateGradientMap(): void {
        let map = [];

        // fill top and bottom row
        map[0] = this.generateGradientRow(this.colorTopLeft, this.colorTopRight);
        map[this.rows - 1] = this.generateGradientRow(this.colorBottomLeft, this.colorBottomRight);


        // fill remaining rows
        this.gradientMap = this.fillEmptyRows(map);
    }

    private generateGradientRow(color1: string, color2: string): any {
        return tinygradient(color1, color2).rgb(this.columns);
    }

    private fillEmptyRows(map: Array<Array<any>>): any {
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

    private setColor(x: number, y: number): string {
        return this.pickColorFromGradientMap(x, y);
    }

    private pickColorFromGradientMap(x: number, y: number): string {
        return this.gradientMap[y - 1][x - 1].toHexString();
    }
}