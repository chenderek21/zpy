import { Card } from './Card';
import { globalSortOrder } from './Game';

export class Hand {
    private cards: Card[];

    constructor() {
        this.cards = [];
    }

    addCard(card: Card) {
        this.cards.push(card);
    }

    addCardSorted(card: Card) {
        // Create a card identifier string
        const cardId = `${card.suit}_${card.rank}`;

        // Find the index where the new card should be inserted
        let index = this.cards.findIndex(c => 
            (globalSortOrder.get(`${c.suit}_${c.rank}`) ?? Number.MAX_SAFE_INTEGER) > 
            (globalSortOrder.get(cardId) ?? Number.MAX_SAFE_INTEGER)
        );

        if (index === -1) {
            // If not found, add the card to the end
            this.cards.push(card);
        } else {
            // Otherwise, insert the card at the found index
            this.cards.splice(index, 0, card);
        }
    }

    removeCard(cardIndex: number): Card | null {
        if (cardIndex >= 0 && cardIndex < this.cards.length) {
            return this.cards.splice(cardIndex, 1)[0];
        }
        return null;
    }

    sort() {
        this.cards.sort((a, b) => {
            const cardIdA = `${a.suit}_${a.rank}`;
            const cardIdB = `${b.suit}_${b.rank}`;
            const indexA = globalSortOrder.get(cardIdA);
            const indexB = globalSortOrder.get(cardIdB);

            // Compare the indices
            return (indexA ?? Number.MAX_SAFE_INTEGER) - (indexB ?? Number.MAX_SAFE_INTEGER);
        });
    }

    // You can add more methods as needed, such as getCards(), findCard(), etc.

    getCards(): Card[] {
        return this.cards;
    }
}