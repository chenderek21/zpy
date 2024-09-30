"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hand = void 0;
const Game_1 = require("./Game");
class Hand {
    constructor() {
        this.cards = [];
    }
    addCard(card) {
        this.cards.push(card);
    }
    addCardSorted(card) {
        // Create a card identifier string
        const cardId = `${card.suit}_${card.rank}`;
        // Find the index where the new card should be inserted
        let index = this.cards.findIndex(c => {
            var _a, _b;
            return ((_a = Game_1.globalSortOrder.get(`${c.suit}_${c.rank}`)) !== null && _a !== void 0 ? _a : Number.MAX_SAFE_INTEGER) >
                ((_b = Game_1.globalSortOrder.get(cardId)) !== null && _b !== void 0 ? _b : Number.MAX_SAFE_INTEGER);
        });
        if (index === -1) {
            // If not found, add the card to the end
            this.cards.push(card);
        }
        else {
            // Otherwise, insert the card at the found index
            this.cards.splice(index, 0, card);
        }
    }
    removeCard(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.cards.length) {
            return this.cards.splice(cardIndex, 1)[0];
        }
        return null;
    }
    sort() {
        this.cards.sort((a, b) => {
            const cardIdA = `${a.suit}_${a.rank}`;
            const cardIdB = `${b.suit}_${b.rank}`;
            const indexA = Game_1.globalSortOrder.get(cardIdA);
            const indexB = Game_1.globalSortOrder.get(cardIdB);
            // Compare the indices
            return (indexA !== null && indexA !== void 0 ? indexA : Number.MAX_SAFE_INTEGER) - (indexB !== null && indexB !== void 0 ? indexB : Number.MAX_SAFE_INTEGER);
        });
    }
    // You can add more methods as needed, such as getCards(), findCard(), etc.
    getCards() {
        return this.cards;
    }
}
exports.Hand = Hand;
//# sourceMappingURL=Hand.js.map