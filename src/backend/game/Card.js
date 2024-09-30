"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        if (rank === 'Joker') {
            this.img_url = `joker_${suit}.png`; // Handle Joker cards
        }
        else {
            this.img_url = `${rank}_of_${suit}.png`; // Handle regular cards
        }
    }
    isTrump(trumpCard) {
        return this.suit === trumpCard.suit || this.rank === trumpCard.rank || this.rank === 'Joker';
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map