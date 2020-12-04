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
      console.log("toggleBtnDisabled called");
      btns = document.getElementsByClassName("hitStay");
      for (let i = 0; i < btns.length; i++){
        let x = btns[i].toggleAttribute("disabled");        
        console.log("butten " + i + " disabled " + x);
      }
    },
    renderCard (suit, index) {
      console.log("card rendered at player" + index);
      _hands[index].appendChild(_newCard(suit));
    },
    setScore (value, index) {
      const scoreHolders = document.getElementsByClassName("scoreHolder")
      scoreHolders[index].innerHTML = value;
    }, 
    setWallet (num) {
      const wallet = document.getElementById("playerWallet");
      const number = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(num);
      wallet.innerHTML = number;
    },
    setHandBlocker (result) {
      console.log("handBlocker called");
      const elmt = document.getElementById("handBlocker");
      elmt.innerHTML = result;
      this.toggleBtnDisabled();
      elmt.style.display = 'flex';
    },
    showRsltScreen (result) {
      const elmn = document.getElementById("handResult");
      elmn.innerHTML = result;
      elmn.parentElement.style.display = 'flex';
      console.log('Result: ' + result);
    },
    hideModules () {
      console.log("hide modules called");
      const elmns = document.getElementsByClassName("cover");
      for (let elmn of elmns) {
        elmn.style.display = "none";
      }
    },
    clearHands () {
      console.log("clearHands Called");
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
  const _sleep = (ms) => {
    var currentTime = new Date().getTime(); 
    while (currentTime + ms >= new Date().getTime()) { console.log("...") }
  }
  const _dealPlayer = (index) => {
    let card = _deck.deal();
    Interface.renderCard(card, index);
    _hands[index].push(card);
    console.log(`Player ${index + 1} was dealt a ${card}.`)
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
        value -= 10;
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
  const _endRound = (result) => {
    console.log("endRound called :" + result);
    if (result == "Win") {
      //pay  twice players bet
    }else if (result == "Push") {
      //return players bet to their wallet
    }else if (result == "BlackJack") {
      //pay 2.5 times players bet
    }
    Interface.setWallet(_players[1].wallet);
    Interface.showRsltScreen(result);
  }
  return {
    start () {
      console.log("start called");
      _seatPlayers(2);
      _deck.shuffleDeck();
      Interface.setWallet(_players[1].wallet);
      this.resetTable();
    },
    hitPlayer () {
      _dealPlayer(1);
      let playerHand = _evalHand(_hands[1]);
      Interface.setScore(playerHand, 1);
      if (playerHand < 21)
        return;
      if (playerHand == "Bust" || playerHand === 21){
        Interface.setHandBlocker(playerHand);
        this.dealersTurn();
      }
    },
    stayPlayer () {
      Interface.toggleBtnDisabled();
      this.dealersTurn();
    },
    dealersTurn () {
      console.log("dealers turn called");    
      const dealerHand = _evalHand(_hands[0]);
      Interface.setScore(dealerHand, 0);
      if (dealerHand <= 16 && typeof dealerHand == "number"){
        _dealPlayer(0);
        setTimeout(()=>{
          this.dealersTurn();
        }, 1500);      
      } else {
        this.endGameEval();
      }
    },
    resetTable () {
      console.log("resetTable called");
      const strtCards = 2;
      const dealersIndex = 0;
      const playerIndex = 1;
      _hands.forEach((cards) => {   //move all players cards to deck discard
        while (0 < cards.length){
          _deck.discard(cards.pop());
        }
      });
      Interface.clearHands();
      Interface.hideModules();
      for (let i = 0; i < strtCards; i++){  //deal n cards...
        for (let j = 0; j < _hands.length; j++){ //...to each hand in _hand
          _dealPlayer(j)          
        }
      }
      
      Interface.setScore(_evalHand(_hands[dealersIndex]), dealersIndex);  //eval player and dealer so scores can be set
      let playerHand = _evalHand(_hands[playerIndex]);         //keep player score for BlackJack eval
      Interface.setScore(playerHand, playerIndex);
  
      if (playerHand == "BlackJack"){           //if the player has black jack
        Interface.setHandBlocker(playerHand);        //set set his hand to BlackJack
        this.dealersTurn();                           //let the dealer go
      } else {                                  //otherwise
        Interface.toggleBtnDisabled();            //allow use of HitStayBtns
      }
    },
    endGameEval () {
      console.log('end of game eval called');
      const dealer = _evalHand(_hands[0]);
      const player = _evalHand(_hands[1]);
      let result = "none";

      if (typeof player == "number" && typeof dealer == "number"){
        if (player > dealer) 
          result = "Win";
        else if (player < dealer) 
          result = "Lose";
      } else {
        if (player == dealer) 
          result = "Push";
        else if (player == "BlackJack") 
          result = "BlackJack";
        else if (player == "Bust" || dealer == "BlackJack") 
          result = "Lose";
        else if (dealer == "Bust") 
          result = "win";
        else 
          throw new Error('Game Director failed to compare dealer & player hands.')
      }

      _endRound(result);
    },
    handCheck () {
      console.log(_hands[0], _hands[1]);
      
      console.log(_players[0].cards, _players[1].cards);
    }
  }
})();