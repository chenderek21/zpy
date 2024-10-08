"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
class Lobby {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = [];
        this.gameStarted = false;
        this.numDecks = 0;
        this.numMaxPlayers = 0;
    }
    setNumDecks(numDecks) {
        this.numDecks = numDecks;
    }
    getNumDecks() {
        return this.numDecks;
    }
    setNumMaxPlayers(numMaxPlayers) {
        this.numMaxPlayers = numMaxPlayers;
    }
    getNumMaxPlayers() {
        return this.numMaxPlayers;
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
    isHost(playerId) {
        const player = this.players.find(player => player.id === playerId);
        if (player) {
            return player.host;
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
            numMaxPlayers: this.numMaxPlayers,
            numDecks: this.numDecks
        };
    }
}
exports.Lobby = Lobby;
//# sourceMappingURL=Lobby.js.map