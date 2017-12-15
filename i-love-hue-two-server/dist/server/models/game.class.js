"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_class_1 = require("./map.class");
const timers_1 = require("timers");
const immutable_mask_class_1 = require("./immutable-mask.class");
const helper_class_1 = require("./helper.class");
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
        this.chatMessages = [];
        this.name = name || 'Game' + helper_class_1.Helper.rng(0, 99);
        this.mode = Game.GAMEMODE[mode];
        this.websocketService = websocketService;
        this.difficulty = difficulty;
        this.map = this.generateMap();
        this.status = 0;
        this.id = helper_class_1.Helper.generateId();
    }
    generateMap() {
        return new map_class_1.Map(this.mode.rows, this.mode.columns, new immutable_mask_class_1.ImmutableMask(this.mode.rows, this.mode.columns, this.difficulty), ...Game.COLORSETS[helper_class_1.Helper.rng(0, Game.COLORSETS.length - 1)]);
    }
    newRound(callback) {
        this.map = this.generateMap();
        this.generateAndSetTiles();
        callback();
    }
    initiate(callback) {
        this.status = 1;
        //this.startClock();
        this.generateAndSetTiles();
        callback(this);
    }
    generateAndSetTiles() {
        for (let client of this.clients) {
            client.setTiles(this.map.getScrambledTiles());
        }
    }
    startClock() {
        this.time = 0;
        this.clock = timers_1.setInterval(() => {
            this.time++;
        }, 1000);
    }
    stopClock() {
        clearInterval(this.clock);
    }
    swapTiles(clientId, tileSwap, playerVictory) {
        let client = this.getClient(clientId);
        client.swapTiles(tileSwap);
        playerVictory(this.map.checkSolution(client.tiles), this);
    }
    getClient(clientId) {
        return this.clients.find((client) => client.id === clientId);
    }
    getAllClients() {
        return this.clients;
    }
    addClient(clientId, clientName) {
        let client = this.websocketService.getClient(clientId);
        if (client) {
            client.setName(clientName);
            this.clients.push(client);
        }
    }
    removeClient(id) {
        let index = this.clients.findIndex((client) => client.id === id);
        this.clients.splice(index, 1);
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
    ['#E84040', '#1D2F31', '#D4E875', '#00DCE4'],
    ['#57E048', '#FBFA6C', '#523F76', '#A361C2'],
    ['#6EB7C8', '#F5D75F', '#174BDC', '#F67E5B'],
    ['#6E1F77', '#E5134A', '#097FF8', '#FCD7BD'],
    ['#BB68DC', '#15346D', '#E1C38D', '#29B26A'],
    ['#5C2AE2', '#F85C66', '#3BDCCC', '#F2C93B']
];
exports.Game = Game;
//# sourceMappingURL=game.class.js.map