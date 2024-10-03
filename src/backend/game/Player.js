"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const Hand_1 = require("./Hand");
class Player {
    constructor(id) {
        this.id = id;
        this.score = 2; //All players start at rank 2. 
        this.team = "Offense"; //All players are on offense, declarer is first on defense
        this.currentPoints = 0;
        this.hand = new Hand_1.Hand();
        this.isPlaying = false;
        this.isDeclarer = false;
        this.name = "Player";
    }
    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
    setName(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
    updateScore(numRanks) {
        this.score += numRanks;
    }
    updatePoints(points) {
        this.currentPoints += points;
    }
    declare() {
        this.team = "Defense";
        this.isDeclarer = true;
    }
    setHand(hand) {
        this.hand = hand;
    }
    dealCard(card) {
        this.hand.addCardSorted(card);
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map