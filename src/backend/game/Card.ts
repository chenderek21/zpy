export type Suit = 'clubs' | 'diamonds' | 'spades' | 'hearts' | 'black' | 'red';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'Joker';

export class Card {
    public img_url: string;

    constructor(public suit: Suit, public rank: Rank) {
        if (rank === 'Joker') {
            this.img_url = `joker_${suit}.png`; // Handle Joker cards
        } else {
            this.img_url = `${rank}_of_${suit}.png`; // Handle regular cards
        }
    }

    isTrump(trumpCard: Card): boolean {
        return this.suit === trumpCard.suit || this.rank === trumpCard.rank || this.rank === 'Joker';
    }
}
