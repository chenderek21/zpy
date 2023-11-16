import { Card } from "./Card";
import { Player } from "./Player";
import { Deck } from "./Deck";
export let globalSortOrder: Map<string, number> = new Map();

export class Game {
    players: Player[];
    deck: Deck;

    constructor(players: Player[], deck: Deck) {
        this.players = players;
        this.deck = deck;
    }

    dealCardsWithDelay() {
        const dealOneCard = () => {
            for (let player of this.players) {
                const card = this.deck.drawCard();
                if (card) {
                    player.dealCard(card);

                }
    
                if (this.deck.isEmpty()) {
                    clearInterval(dealInterval); // Stop dealing when the deck is empty
                    break;
                }
            }
        };
    
        const dealInterval = setInterval(dealOneCard, 250);
    }

    // ... other game methods ...
}

export function setTrumpCard(trumpCard: Card | null) {
    globalSortOrder = getSortOrder(trumpCard); // Assuming getSortOrder is accessible here
    // Log the global sort order of cards
    // console.log("Global Sort Order:");
    // globalSortOrder.forEach((value, key) => {
    //     console.log(`${key}: ${value}`);
    // });
}

function getSortOrder(trumpCard: Card | null) {
    let suitOrder = ['clubs', 'diamonds', 'spades', 'hearts'];
    let rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    let globalSortOrderMap: Map<string, number> = new Map();
    let ind = 0;
    // Default sort order used when no trump is declared(think hearts) 
    if (!trumpCard) {

        for (let suit of suitOrder) {
            for (let rank of rankOrder) {
                globalSortOrderMap.set(suit+"_"+rank, ind);
                ind += 1;
            }
        }
    }
    else {
        // Some logic to preserve color alternation 
        switch (trumpCard.suit) {
            case 'clubs':
                suitOrder = ['diamonds', 'spades', 'hearts', 'clubs'];
                break;
            case 'diamonds': 
                suitOrder = ['clubs', 'hearts', 'spades', 'diamonds'];
                break;
            case 'spades':
                suitOrder = ['diamonds', 'clubs', 'hearts', 'spades'];
                break;
            case 'hearts':
                break;
        }   
        // Place trumps at the end
        rankOrder = rankOrder.filter(rank => rank !== trumpCard.rank); 
        for (let suit of suitOrder) {
            for (let rank of rankOrder) {
                globalSortOrderMap.set(suit+"_"+rank, ind);
                ind += 1;
            }
        }
        for (let suit of suitOrder) {
            globalSortOrderMap.set(suit+"_"+trumpCard.rank, ind);
            ind += 1;
        }
    }
    // Add jokers and return 
    globalSortOrderMap.set("black_Joker", ind);
    globalSortOrderMap.set("red_Joker", ind+1);

    return globalSortOrderMap;
}