class Player {
  constructor(){
    this.cards = [];
    this.wallet = 500;
  }
  clearHand () {this.cards = []}
}

class Deck {
  constructor(){
    const _standardDeck = ["2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AC" 
      ,"2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "AS" 
      ,"2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AH" 
      ,"2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD", "AD" 
    ]; //Suits; Clubs = C, Spades = S, Harts = H, Dimonds = D
    const _cards = [..._standardDeck];
    const _discards = [];
    const _shuffle = (array) => {
      let counter = array.length, temporaryValue, randomIndex;
      // While there remain elements to shuffle...
      while (0 !== counter) {  
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * counter);
        counter -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[counter];
        array[counter] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
    }
    this.shuffleDeck = () => {
      _shuffle(_cards);
    }
    this.shuffleDiscard = () => {
      _shuffle(_discards);
      _discards.forEach((card) => {_cards.unshift(card)});
    }
    this.deal = () => {return _cards.pop();}
    this.reset = () => {_cards = [..._standardDeck];}
    this.discard = (card) => {_discards.push(card)}
    this.deckValues = () => {return _standardDeck;}
  }
}

const Interface = (function () {
  const _hands = document.getElementsByClassName("hand");
  const _newCard = (suit) => {
    let card = document.createElement("div");
    let img = document.createElement("img");
    card.className = "card";
    img.src = `./img/${suit}.svg`;
    card.appendChild(img);
    return card;
  }
  return {
    toggleBtnDisabled () {
      btns = document.getElementsByClassName("hitStay");
      for (let i = 0; i < btns.length; i++){
        btns[i].toggleAttribute("disabled");
      }
    },
    toggleElmtFlex (elmt) {
      const style = elmt.style
      if (style.display === "none")
        style.display = "flex";
      else
        style.display = "none";
    },
    renderCard (suit, index) {_hands[index].appendChild(_newCard(suit));},
    setScore (value, index) {
      const scoreHolders = document.getElementsByClassName("scoreHolder")
      scoreHolders[index].innerHTML = value;
    }, 
    setWallet (num) {
      const wallet = document.getElementById("playerWallet");
      const number = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(num);
      wallet.innerHTML = number;
    },
    handBlocker (result) {
      const elmt = document.getElementById("handBlocker");
      elmt.innerHTML = result;
      this.toggleElmtFlex(elmt);
    },
    dispResult (result) {
      const elmn = document.getElementById("handResult");
      elmn.innerHTML = result;
      this.toggleElmtFlex(elmn.parentElement);
    },
    hideModules () {
      const elmns = document.getElementsByClassName("cover");
      for (let elmn of elmns) {
        elmn.style.display = "none";
      }
    },
    clearHands () {
      for (let hand of _hands){
        hand.innerHTML = "";
      }
    },
  }
})();

const GameDirector = (function(){
  const _deck = new Deck();
  const _players = [];
  const _hands = [];
  const _dealPlayer = (index) => {
    let card = _deck.deal();
    _hands[index].push(card);
    Interface.renderCard(card, index);
    console.log(`Player${index + 1} was dealt a ${card}.`)
  }
  const _evalHand = (hand) => {
    let aceCounter = 0; //tracks howmany aces are in hand so the value can be reduces if nessicary 
    let value = 0; //accumulates the values of all cards for return.
    let cardFactor = 13; //represents the 13 distince cards in each suit
    let logString = "";
    for (let i = 0; i < hand.length; i++){ //for each card in hand
      let cardValue;
      let tempIndex = _deck.deckValues().indexOf(hand[i]) + 1; //find the index of the curent cards value in the sandard deck blue print with an offset from zero to one based counting.
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
      if(i == 1 && value == 21){
        return "BlackJack";
      }
    }

    //devalue aces if the push the value over 21
    if (value > 21 && aceCounter > 0){ 
      for (let i = 0; i < aceCounter && value > 21; i++){
        value - 10;
        logString += " - 10";
      }
    }

    console.log(`${logString} = ${value} AceCounter = ${aceCounter}`);
    //check for "BUST!"
    if (value > 21){        
      return "Bust";      
    }

    return value;
  }
  const _seatPlayers = (n) => {
    let i = 0;
    while (i < n) {
      _players.push(new Player());
      _hands[i] = _players[i].cards;
      i++
    }
  }
  const _dealersTurn = () => {
    let dealerHand = _evalHand(_hands[0]);
    window.setTimeout(() => {
      if (dealerHand <= 16){
        _dealPlayer(0)
        _dealersTurn();
      }
      let playerHand = _evalHand(_hands[1]);

      //if dealers hand is not under 17 then compare dealer and player
      if (playerHand == dealerHand){
        _endRound("Push");
      } else if (playerHand == "BlackJack") {          
        _endRound("BlackJack");
      } else if (playerHand == "Bust" || dealerHand == "BlackJack" || playerHand < dealerHand){
        _endRound("Lose");
      } else if (playerHand > dealerHand){
        _endRound("Win");
      } else {
        throw new Error("Game Director fail to compare dealer and players hands at _dealersTurn()");
      }
    }, 5*100 );
  }
  const _endRound = (result) => {
    if (result == "Win") {
      //pay  twice players bet
    }else if (result == "Push") {
      //return players bet to their wallet
    }else if (result == "BlackJack") {
      //pay 2.5 times players bet
    }
    Interface.setWallet(_players[1].wallet);
    Interface.dispResult(result);
  }
  return {
    start () {
      _seatPlayers(2);
      _deck.shuffleDeck();
      Interface.setWallet(_players[1].wallet);
      this.resetTable();
    },
    hitPlayer () {
      _dealPlayer(1);
      let playerHand = _evalHand(_hands[1]);
      Interface.setScore(playerHand, 1);
      if (playerHand < 21){
        return;
      }
      if (playerHand >= 21){
        Interface.handBlocker(playerHand);
      }
    },
    stayPlayer () {
      Interface.toggleBtnDisabled();
      _dealersTurn();
    },
    resetTable () {
      if (_hands[0].length > 0){      //if first player has cards
        _hands.forEach((cards) => {   //move all players cards to deck discard
          let i = 0;
          while (i < cards.length){
            _deck.discard(cards[i]);
            i++;
          }
        });
        Interface.clearHands();      
      }
      Interface.hideModules();      //hide all module
      for (let i = 0; i < 2; i++){  //deal all players two cards
        _hands.forEach((hand, i) => { 
          _dealPlayer(i);
        });
      }
      
      Interface.setScore(_evalHand(_hands[0]), 0);  //eval player and dealer so scores can be set
      let playerHand = _evalHand(_hands[1]);         //keep player score for BlackJack eval
      Interface.setScore(playerHand, 1);
  
      if (playerHand == "BlackJack"){           //if the player has black jack
        Interface.handBlocker(playerHand);        //set set his hand to BlackJack
        _dealersTurn();                           //let the dealer go
      } else {                                  //otherwise
        Interface.toggleBtnDisabled();            //allow use of HitStayBtns
      }
    }
  }
})();