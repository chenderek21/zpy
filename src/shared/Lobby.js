"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
class Lobby {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = [];
        this.gameStarted = false;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    removePlayer(playerId) {
        this.players = this.players.filter(player => player.id !== playerId);
    }
    getPlayer(playerId) {
        return this.players.find(player => player.id === playerId);
    }
    toggleReady(playerId) {
        const player = this.getPlayer(playerId);
        if (player) {
            player.ready = !player.ready;
        }
    }
    areAllPlayersReady() {
        return this.players.every(player => player.ready);
    }
    startGameIfReady() {
        if (this.areAllPlayersReady()) {
            this.gameStarted = true;
        }
    }
    getLobbyState() {
        return {
            players: this.players,
            gameStarted: this.gameStarted,
        };
    }
}
exports.Lobby = Lobby;
//# sourceMappingURL=Lobby.js.map