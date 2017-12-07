"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_class_1 = require("./map.class");
class GameMode {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
    }
}
exports.GameMode = GameMode;
class Game {
    constructor(mode, name) {
        this.clients = [];
        this.name = name;
        this.map = new map_class_1.Map(Game.GAMEMODE[mode].rows, Game.GAMEMODE[mode].columns, ...Game.COLORSETS[0]);
    }
    addClient(client) {
        this.clients.push(client);
    }
}
Game.GAMEMODE = [
    new GameMode(8, 8),
    new GameMode(10, 10),
    new GameMode(15, 15) // hard
];
Game.COLORSETS = [
    ['#474A9B', '#1E966C', '#C74FAA', '#F5DFB8'],
    ['#EFFC54', '#78EFC5', '#FD42CD', '#4A45D7'],
    ['#E84040', '#1D2F31', '#D4E875', '#00DCE4']
];
exports.Game = Game;
//# sourceMappingURL=game.class.js.map