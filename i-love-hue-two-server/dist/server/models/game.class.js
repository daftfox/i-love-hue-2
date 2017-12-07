"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_class_1 = require("./map.class");
const timers_1 = require("timers");
const immutable_mask_class_1 = require("./immutable-mask.class");
class GameMode {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
    }
}
exports.GameMode = GameMode;
class Game {
    constructor(mode, name, websocketService, difficulty) {
        this.clients = [];
        this.name = name || 'Game' + immutable_mask_class_1.ImmutableMask.rng(0, 99);
        this.mode = Game.GAMEMODE[mode];
        this.im = new immutable_mask_class_1.ImmutableMask(this.mode.rows, this.mode.columns, difficulty);
        this.websocketService = websocketService;
        this.map = new map_class_1.Map(this.mode.rows, this.mode.columns, ...Game.COLORSETS[immutable_mask_class_1.ImmutableMask.rng(0, Game.COLORSETS.length - 1)]);
        this.state = 'ready';
    }
    initiate(callback) {
        this.state = 'initiated';
        this.startClock();
        let tiles = this.im.maskTiles(this.map.tiles);
        // this is the solution, keep it safe you hear!
        this.map.setSolution(tiles);
        for (let client of this.clients) {
            client.setTiles(this.im.scrambleTiles(tiles));
        }
        callback();
    }
    startClock() {
        this.time = 0;
        this.clock = timers_1.setInterval(() => {
            this.time++;
        }, 1000);
    }
    stopClock() {
        this.clock();
    }
    swapTiles(clientId, tileSwap, playerVictory) {
        let client = this.getClient(clientId);
        client.swapTiles(tileSwap);
        playerVictory(this.map.checkSolution(client.tiles));
    }
    getClient(clientId) {
        return this.clients.find((client) => client.id === clientId);
    }
    getAllClients() {
        return this.clients;
    }
    addClient(clientId, clientName) {
        let client = this.websocketService.getClient(clientId);
        client.setName(clientName);
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