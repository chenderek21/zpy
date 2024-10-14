"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.trumpCardGlobal = exports.globalCardStrengthMap = exports.globalSortOrder = void 0;
exports.setTrumpCard = setTrumpCard;
exports.globalSortOrder = new Map();
exports.globalCardStrengthMap = new Map();
class Game {
    constructor(players, deck) {
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
}
exports.Game = Game;
function setTrumpCard(trumpCard) {
    exports.globalSortOrder = getSortOrder(trumpCard);
    if (trumpCard != null) {
        exports.globalCardStrengthMap = getCardStrengthMap(trumpCard);
        exports.trumpCardGlobal = trumpCard;
    }
    // Log the global sort order of cards
    // console.log("Global Card Strength:");
    // globalCardStrengthMap.forEach((value, key) => {
    //     console.log(`${key}: ${value}`);
    // });
}
function getSortOrder(trumpCard) {
    let suitOrder = ['clubs', 'diamonds', 'spades', 'hearts'];
    let rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let globalSortOrderMap = new Map();
    let ind = 0;
    // Default sort order used when no trump is declared(think MS hearts) 
    if (!trumpCard) {
        for (let suit of suitOrder) {
            for (let rank of rankOrder) {
                globalSortOrderMap.set(suit + "_" + rank, ind);
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
                globalSortOrderMap.set(suit + "_" + rank, ind);
                ind += 1;
            }
        }
        for (let suit of suitOrder) {
            globalSortOrderMap.set(suit + "_" + trumpCard.rank, ind);
            ind += 1;
        }
    }
    // Add jokers and return 
    globalSortOrderMap.set("black_Joker", ind);
    globalSortOrderMap.set("red_Joker", ind + 1);
    return globalSortOrderMap;
}
function getCardStrengthMap(trumpCard) {
    let suitOrder = ['clubs', 'diamonds', 'spades', 'hearts'];
    let rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let globalCardStrengthMap = new Map();
    rankOrder = rankOrder.filter(rank => rank !== trumpCard.rank);
    suitOrder = suitOrder.filter(suit => suit !== trumpCard.suit);
    //non trump suit, non trump rank (0-11)
    for (let suit of suitOrder) {
        let indRank = 0;
        for (let rank of rankOrder) {
            globalCardStrengthMap.set(suit + "_" + rank, indRank);
            indRank += 1;
        }
    }
    //trump suit, non trump rank (13-24)
    let indRank = 13;
    for (let rank of rankOrder) {
        globalCardStrengthMap.set(trumpCard.suit + "_" + rank, indRank);
        indRank += 1;
    }
    //trump rank, non trump suit (26)
    for (let suit of suitOrder) {
        globalCardStrengthMap.set(suit + "_" + trumpCard.rank, 26);
    }
    //trump rank and trump suit (28)
    globalCardStrengthMap.set(trumpCard.suit + "_" + trumpCard.rank, 28);
    //jokers (29,30)
    globalCardStrengthMap.set("black_Joker", 29);
    globalCardStrengthMap.set("red_Joker", 30);
    return globalCardStrengthMap;
}
function parsePlay(cardsPlayed) {
}
//# sourceMappingURL=Game.js.map