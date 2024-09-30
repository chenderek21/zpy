"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    constructor(code) {
        this.code = code;
        this.players = [];
    }
    addPlayer(player) {
        if (!this.players.find(p => p.getName() === player.getName())) {
            this.players.push(player);
            console.log(`Player ${player.getName()} added to room ${this.code}`);
        }
        else {
            console.log(`Player ${player.getName()} is already in room ${this.code}`);
        }
    }
    removePlayer(playerName) {
        this.players = this.players.filter(player => player.getName() !== playerName);
        console.log(`Player ${playerName} removed from room ${this.code}`);
    }
    getPlayers() {
        return this.players;
    }
    getRoomCode() {
        return this.code;
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map