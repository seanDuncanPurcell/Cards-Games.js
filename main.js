

const Deck = (function () {

  const _standardDeck = ["c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "cJ", "cQ", "cK", "cA" 
    ,"s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "sJ", "sQ", "sK", "sA" 
    ,"h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "hJ", "hQ", "hK", "hA" 
    ,"d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "dJ", "dQ", "dK", "dA" 
  ]; //Suits; Clubs = C, Spades = S, Harts = H, Dimonds = D
  let _cards = [0];

  return {
    shuffle() {
      let counter = _standardDeck.length, temporaryValue, randomIndex;
      _cards = [..._standardDeck];
      // While there remain elements to shuffle...
      while (0 !== counter) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * counter);
        counter -= 1;
    
        // And swap it with the current element.
        temporaryValue = _cards[counter];
        _cards[counter] = _cards[randomIndex];
        _cards[randomIndex] = temporaryValue;
      }
    },
    deal () {return _cards.pop();},
    get report () {return _cards;},
    get deckValues() {return _standardDeck;}
  }
})();

const Table = (function () {
  const _players = [];

  return {
    seatPlayer(){_players.push(new Player(`player${_players.length+1}`));},
    dealAll(num){
      let playerCount = _players.length;
      let totCards = num * playerCount;
      while(totCards !== 0){
        _players[totCards % playerCount].dealCard();
        totCards--;
      }
    },
    get players(){return _players;},


  }
})();

const GameDirector = (function () {
  return{
    startNewGame = () => {
    //shuffle deck
    //seat players
    //deal all players two cards
    //evaluate values with in hands
    //--if BlackJack return 'WIN' to player
    //--if no BlackJack return to player; "HIT", or "STAY"
    //valuate for bust if not return to last step.
    },
    blackJack = () => {
      //if dealer does not have blackjack the player wins at 3 to 2 
      //promt for a new hand
    },
    dealersTurn = () => {
      //evaluate hand value
      //if <= 16 && not bust hit and return to last step.
      //evaluate all hands against dealers
    },
    win = () => {},
    lose = () => {},
    push = () => {}
  }
})();

class Player {
  constructor(name){
    this.cards = [];
    this.name = name;
  }
  dealCard(){
    let cardDealt = Deck.deal();
    this.cards.push(cardDealt);
    console.log(cardDealt + " dealt to " + this.name);
  }
  get handValue() {
    let aceCounter = 0; //tracks howmany aces are in hand so the value can be reduces if nessicary 
    let value = 0; //accumulates the values of all cards for return.
    let cardFactor = 13; //represents the 13 distince cards in each suit
    let logString = "";
    for (let i = 0; i < this.cards.length; i++){ //for each card in hand
      let cardValue;
      let tempIndex = Deck.deckValues.indexOf(this.cards[i]) + 1; //find the index of the curent cards value in the sandard deck blue print with an offset from zero to one based counting.
      let cardIndex = (tempIndex % cardFactor) + 1; //returns a consistens value for all 2s, 3, 4, Js, Qs, ect...
      if (cardIndex > 1 && cardIndex < 11){
        cardValue = cardIndex; //number cards are valued at their number
        logString += (" + " + cardValue.toString());
      }
      else if (cardIndex >= 11 && cardIndex <= 13){
        cardValue = 10; //face cards are valued at 10
        logString += (" + " + cardValue.toString());
      }
      else if (cardIndex == 1){
        aceCounter++;
        cardValue = 11; //aces are valued at 11 but will be reduced to 1 if the player busts.
        logString += (" + " + cardValue.toString());
      } else {
        throw new Error("Unable to evaluate card value");
      }
      value += cardValue;
    }
    if (value > 21 && aceCounter > 0){ 
      for (let i = 0; i < aceCounter && value > 21; i++){
        value - 10;
        logString += " - 10";
      }
    }
    console.log(`${logString} = ${value} AceCounter = ${aceCounter}`);
    return value;
  };
  stay(){}
  split(){}
  clearHand () {this.cards = []}
  bust(){}
  blackJack(){}
}

Deck.shuffle();
Table.seatPlayer();
Table.seatPlayer();
Table.dealAll(2);
Table.players[0].handValue
Table.players[1].handValue
Table.dealAll(1);
Table.players[0].handValue
Table.players[1].handValue
Table.dealAll(1);
Table.players[0].handValue
Table.players[1].handValue