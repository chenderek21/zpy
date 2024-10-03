export interface LobbyPlayer {
    id: string;
    name: string;
    ready: boolean;
}

export class Lobby {
    private players: LobbyPlayer[] = [];
    private gameStarted: boolean = false;

    constructor(private roomCode: string) {}

    addPlayer(player: LobbyPlayer) {
        this.players.push(player);
    }

    removePlayer(playerId: string) {
        this.players = this.players.filter(player => player.id !== playerId);
    }

    getPlayer(playerId: string): LobbyPlayer | undefined {
        return this.players.find(player => player.id === playerId);
    }

    toggleReady(playerId: string) {
        const player = this.getPlayer(playerId);
        if (player) {
            player.ready = !player.ready;
        }
    }

    areAllPlayersReady(): boolean {
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