import { Player } from './Player'
export class Room {
    private code: string;
    private players: Player[];

    constructor(code: string) {
        this.code = code;
        this.players = [];
    }

    addPlayer(player: Player) {
        if (!this.players.find(p => p.getName() === player.getName())) {
            this.players.push(player);
            console.log(`Player ${player.getName()} added to room ${this.code}`);
        } else {
            console.log(`Player ${player.getName()} is already in room ${this.code}`);
        }
    }

    removePlayer(playerName: string) {
        this.players = this.players.filter(player => player.getName() !== playerName);
        console.log(`Player ${playerName} removed from room ${this.code}`);
    }

    getPlayers(): Player[] {
        return this.players;
    }

    getRoomCode(): string {
        return this.code;
    }
}