"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_service_1 = require("../services/websocket.service");
const game_class_1 = require("../models/game.class");
class MainController {
    constructor(websocketServer) {
        this.games = [];
        this.websocketService = new websocket_service_1.WebsocketService(websocketServer);
        this.wsObserver = this.websocketService.connection.subscribe((message) => {
            switch (message.event) {
                case 'start_new_game':
                    this.startNewGame(message);
                    break;
                case 'player_join_game':
                    this.playerJoinGame(message);
                    break;
                case 'player_forfeit':
                    this.playerForfeit(message);
                    break;
                case 'player_state_change':
                    this.playerStateChange(message);
                    break;
                case 'initiate_game':
                    this.initiateGame(message);
                    break;
                case 'player_tile_swap':
                    this.playerTileSwap(message);
                    break;
                case 'player_forfeit':
                    this.playerForfeit(message);
                    break;
            }
        });
    }
    // Return game with the supplied id
    // Why does TSLINT complain about the method possibly returning an undefined here, but not in the client?
    getGame(id) {
        let game = this.games.find((game) => game.id === id);
        return game;
    }
    // A player has toggled his/her ready state
    //  Toggle the player's ready state, get the corresponding Game object and notify its players
    playerStateChange(message) {
        let game = this.getGame(message.game_id);
        if (game) {
            let client = game.getClient(message.client_id);
            client.setStatus(message.client_status);
            this.websocketService.broadcastMessageInGame({
                event: 'player_state_change',
                client_status: message.client_status,
                client_id: message.client_id
            }, game.id);
        }
    }
    // A player wants to join a game
    //  Attempt to add the player todo: or reply with a denial
    //  Get the corresponding Game object and notify its players
    //  of the new player and send the new player the required data
    playerJoinGame(message) {
        let game = this.getGame(message.game_id);
        if (game) {
            game.addClient(message.client_id, message.client_name);
            let newPlayer = game.getClient(message.client_id);
            let clients = game.getAllClients();
            newPlayer.setStatus(1);
            for (let client of clients) {
                // send new player a list of all players already in the lobby
                this.websocketService.sendMessageToClient(newPlayer.id, {
                    event: 'player_joined',
                    client_id: client.id,
                    client_name: client.name,
                    client_status: client.status,
                    client_tiles: client.tiles,
                    solution: game.map.solution,
                    chat_messages: game.chatMessages,
                    game_name: game.name,
                    game_id: game.id
                });
            }
            // notify players in the lobby of new player
            this.websocketService.broadcastMessageInGame({
                event: 'player_joined',
                client_id: newPlayer.id,
                client_name: newPlayer.name,
                client_ready: false,
                client_status: newPlayer.status,
                client_tiles: newPlayer.tiles,
                game_name: game.name,
                game_id: game.id
            }, game.id);
        }
    }
    // A player has initiated a new game
    //  Get the corresponding Game object and notify its players
    initiateGame(message) {
        let game = this.getGame(message.game_id);
        if (game) {
            let initiate = ((game) => {
                let clients = game.getAllClients().map((c) => {
                    return { id: c.id, tiles: c.tiles };
                });
                game.getAllClients().forEach((client) => {
                    client.setStatus(3);
                });
                this.websocketService.broadcastMessageInGame({
                    event: 'initiate_game',
                    game_id: game.id,
                    players: clients
                }, game.id);
            });
            game.initiate(initiate);
        }
    }
    // todo: refactor method and integrate with initiateGame. Rename initiateGame to startNewRound
    newRound(gameId) {
        let game = this.getGame(gameId);
        if (game) {
            let newRound = ((game) => {
                game.newRound(() => {
                    let clients = game.getAllClients().map((c) => {
                        c.tileSwaps = 0;
                        return { id: c.id, tiles: c.tiles };
                    });
                    this.websocketService.broadcastMessageInGame({
                        event: 'initiate_game',
                        players: clients
                    }, game.id);
                });
            });
            newRound(game);
        }
    }
    playerTileSwap(message) {
        let game = this.getGame(message.game_id);
        if (game) {
            // update timeout after every tile swap so game does not get removed for another ten minutes
            clearTimeout(game.timeout);
            this.updateTimeout(game.id);
            let victory = ((playerVictory, game) => {
                let clients = game.getAllClients();
                clients.forEach((client) => {
                    if (client.id !== message.client_id) {
                        this.websocketService.sendMessageToClient(client.id, {
                            event: 'player_tile_swap',
                            client_id: message.client_id,
                            tile_swaps: message.tile_swaps,
                            tile_swap: {
                                from: message.tile_swap.from,
                                to: message.tile_swap.to
                            }
                        });
                    }
                });
                if (playerVictory) {
                    let winner = game.getClient(message.client_id);
                    //game.stopClock();
                    winner.incrementScore();
                    this.websocketService.broadcastMessageInGame({
                        event: 'player_win',
                        client_id: message.client_id,
                        client_score: winner.score
                    }, game.id);
                    let newRoundHandler = (id) => {
                        let newRound = this.newRound.bind(this);
                        return newRound(id);
                    };
                    setTimeout(() => {
                        return newRoundHandler(message.game_id);
                    }, 15000);
                }
            });
            game.swapTiles(message.client_id, message.tile_swap, victory);
        }
    }
    // A player has forfeited or left the game
    //  Get the corresponding Game object, remove the client from it and notify its players
    playerForfeit(message) {
        let game = this.getGame(message.game_id);
        if (game) {
            let client = game.getClient(message.client_id);
            client.setStatus(0);
            game.removeClient(message.client_id);
            this.websocketService.broadcastMessageInGame({
                event: 'player_forfeit',
                client_id: message.client_id,
                client_name: message.client_name
            }, game.id);
            if (game.clients.length === 0) {
                this.removeGame(game.id);
            }
        }
    }
    // The game has ended
    //  Notify its players and remove it from the server
    endGame(id) {
        this.notifyEndGame(id);
        this.removeGame(id);
    }
    // The game has ended
    //  Remove the game with the supplied id from the list here as well as in the websocketService
    removeGame(id) {
        let index = this.games.findIndex((g) => id === g.id);
        if (index) {
            this.games.splice(index, 1);
            this.websocketService.removeGame(id);
            console.log(`Removed game with id ${id}.`);
        }
    }
    // The game has ended
    //  Notify its players
    notifyEndGame(id) {
        let game = this.getGame(id);
        if (game) {
            // broadcast event to those that are still connected
            this.websocketService.broadcastMessageInGame({
                event: 'game_end'
            }, game.id);
        }
    }
    // Return a new timeout handler to auto remove the game after ten minutes of inactivity
    updateTimeout(id) {
        let timeoutHandler = (id) => {
            let endGame = this.endGame.bind(this);
            return endGame(id);
        };
        return setTimeout(() => {
            return timeoutHandler(id);
        }, 600000); // 10 minutes
    }
    // A player has started a new game
    //  Create a new Game object, add it to the websocketService, add the new player to the game and notify its players
    startNewGame(message) {
        // create a new game
        let newGame = new game_class_1.Game(message.game.mode, message.game.name, this.websocketService, message.game.difficulty);
        this.games.push(newGame);
        this.websocketService.games.push(newGame);
        console.log(`Game ${newGame.name} with id ${newGame.id} started!`);
        // add this client to the game
        newGame.addClient(message.client_id, message.client_name);
        let newPlayer = newGame.getClient(message.client_id);
        newPlayer.setStatus(1);
        // set timeout to remove game after ten minutes of inactivity (no tile-swaps)
        newGame.timeout = this.updateTimeout(newGame.id);
        this.websocketService.broadcastMessageInGame({
            event: 'player_joined',
            client_id: newPlayer.id,
            client_name: newPlayer.name,
            client_status: newPlayer.status,
            solution: newGame.map.solution,
            game_name: newGame.name,
            game_id: newGame.id
        }, newGame.id);
    }
}
exports.MainController = MainController;
//# sourceMappingURL=main.controller.js.map