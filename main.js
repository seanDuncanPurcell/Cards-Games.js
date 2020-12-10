// Convention: The location of a players individual hand is indicated by...
// ...a 2d array due to the need have a second player hand for when the player splits.


class Player {
  constructor(){
    this.handValue = [0, 0];
    this.hands = [[],[]];
    this.wallet = 500;
    this.betHolder = [0, 0];
    this.evalMe = () => {
      let i = 0;
      while (i < this.hand.length){
        if (this.hand[i] != undefined){
          this.handValue[i] = evalfunc(this.hand[i]);
        }
        i++;
      }
    }
    this.bet = (num) => {
      this.bet[0] += num;
      this.wallet -= num;
    }
    this.double = (i) => {
      this.wallet - this.bet[i];
      this.bet[i] *=  2;
    }
    this.split = () => {      
      this.wallet - this.bet[0];
      this.bet[1] = his.bet[0];
    }
    this.payOut = (blackJack = false) => {
      let winFactor = 2;
      if (blackJack) winFactor = 2.5;
      let winnings = this.bet.reduce((a, b)=> {a + b});
      this.wallet += (winnings * winFactor);
      return winnings;
    }
  }
  handClear () {this.hand = [[], []];}
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
    this.shuffleDiscards = () => {
      _shuffle(_discards);
      _discards.forEach((card) => {
        _cards.unshift(card);
      });
      _discards.length = 0;
    }
    this.deal = () => {return _cards.pop();}
    this.reset = () => {_cards = [..._standardDeck];}
    this.discard = (card) => {_discards.push(card);}
    this.deckValues = () => {return _standardDeck;}
    this.reportDiscard = () => {return _discards;}
    this.reportCards = () => {return _cards;}
  }
}

class Table {
  constructor(playerCount = 2){
    this.deck = new Deck;
    this.players = ((i)=>{
      let plyArr = [];
      while(i > plyArr.length) plyArr.push(new Player);
      return plyArr
    })(playerCount);
  }
  evalHand(input){
    let x = input[0], y = input[1];
    let hand = this.players[x].hand[y];
    let handVal = this.players[x].handValue[y];
    let aceCounter = 0; //tracks howmany aces are in hand so the value can be reduces if nessicary 
    let value = 0; //accumulates the values of all cards for return.
    let cardFactor = 13; //represents the 13 distince cards in each suit
    let logString = "";
    for (let i = 0; i < hand.length; i++){ //for each card in hand
      let cardValue;
      let tempIndex = this.deck.deckValues().indexOf(hand[i]) + 1; //find the index of the curent cards value in the sandard deck blue print with an offset from zero to one based counting.
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
      if(i == 1 && value == 21) {
        handVal = 'BlackJack';
        return;
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
    handVal = value;
  }
  dealCard(input){
    let player = input[0];
    let hand = input[1];
    const card = this.deck.deal();

    this.players[player].hands[hand].push(card);
    this.evalHand(input);
    return card;
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
    btnsDisable (i) {
      let btns = document.getElementsByClassName("pan" + i);

      for (let i = 0; i < btns.length; i++){
        btns[i].setAttribute('disabled', '');        
        console.log('butten ' + i + ' disabled ');
      }
    },
    btnsEnable (i) {
      let btns = document.getElementsByClassName("pan" + i);

      for (let i = 0; i < btns.length; i++){
        btns[i].removeAttribute('disabled');        
        console.log('butten ' + i + ' enabled ');
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
    dispBetScreen () {
      this.hideModules();
      document.getElementById("betScreen").style.display = "flex";      
    },
    setWallet (num) {
      const wallet = document.getElementById("playerWallet");
      const number = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(num);
      wallet.innerHTML = number;
    },
    setHandBlocker (result, i) {
      console.log("handBlocker called");
      const elmt = document.getElementById(`handBlocker${i}`);
      elmt.innerHTML = result;
      this.btnsDisable(i);
      elmt.parentElement.style.display = 'flex';
    },
    setDealerBlocker (text) {
      const elmt = document.getElementById("dealerBlocker");
      elmt.innerHTML = text;
      elmt.parentElement.style.display = 'flex';
      console.log("dealer Blocker called, Elmn set to: " + elmt.parentElement.style.display);
    },
    showRsltScreen (result) {
      const elmn = document.getElementById("handResult");
      elmn.innerHTML = result;
      elmn.parentElement.style.display = 'flex';
      console.log('Result: ' + result);
    },
    hideModules () {
      console.log("hide modules called");
      const covers = document.getElementsByClassName("cover");
      for (let elmn of covers) {
        elmn.style.display = "none";
      }
    },
    clearHands () {
      console.log("clearHands Called");
      for (let hand of _hands){
        hand.innerHTML = "";
      }
    },
    split() {}
  }
})();

const GameDirector = (function(){
  let _playerHasSplit = false;
  const _table = new Table();
  const _deck = _table.deck;
  const _players = _table.players;
  const _dealCard = (input) => {
    if (_deck.reportCards().length <= 1) _deck.shuffleDiscards();

    let player = input[0];
    let hand = input[1];
    let handVal = _players[player].handValue[hand];    
    let card = _table.dealCard(input);
    
    Interface.renderCard(card, input);
    Interface.setScore(handVal, input)

    console.log(`Player ${player + 1} was dealt a ${card}.`);
  }
  const _endRound = () => {
    console.log('end of game eval called');
    const dealersIndex = 0; 
    const dealerHand = _players[dealersIndex].handValue[0];
    const playersIndex = 1; 
    const playerHand = _players[playersIndex].handValue;
    const playerBets = _players[playersIndex].betHolder;
    
    playerHand.forEach( (hand, i) => {
      let result = _handCompare(hand, dealerHand);
      console.log("endRound called :" + result);

      if (result == "Win") _players[1].wallet += (playerBets[i] * 2);
      else if (result == "Push") _players[1].wallet += playerBets[i];
      else if (result == "BlackJack") _players[1].wallet += (playerBets[i] * 2.5);
      else console.log("bet failed" + result);

      playerBets[i] = 0;
      Interface.setWallet(_players[1].wallet);

      //set player individual hand to show outcome;
      Interface.setHandBlocker(result, i)
    });
    //promt player to play again;
    Interface.dispBetScreen();
  }
  const _handCompare = (player, dealer) => {
    let result = "none";
    if (player === dealer || (player > 21 && dealer > 21)) result = "Push";
    else if (player === "BlackJack") result = "BlackJack"; 
    else if (player > dealer && player <= 21) result = "Win";
    else if (player < dealer && dealer <= 21) result = "Lose";
    else throw new Error('Game Director failed to compare dealer & player hands.')

    return result;
  }
  const _evalForSplit = () => {
    let aCard = _players[1].hands[0][0];
    let bCard = _players[1].hands[0][1];
    let aRank = aCard.substring(0, aCard.length - 1);
    let bRank = bCard.substring(0, aCard.length - 1);
    console.log(`${aRand} of ${aCard} & ${bRand} of ${bCard} were looked at by _evalForSplit.`);
    if (aRank !== bRank) {
      document.getElementById('split').setAttribute('disabled', '');
    }
  }
  return {
    start () {
      console.log("start called");
      _deck.shuffleDeck();
      Interface.setWallet(_players[1].wallet);
      Interface.hideModules();
      Interface.dispBetScreen();
    },
    hitPlayer (i) {
      const playerIndex = 1;
      const input = [playerIndex, i]

      //dealCard to hand it was called from
      _dealCard(input);

      //fetch value of calling hand and use to determin available action
      let playerHand = _players[playerIndex].handValue[i];
      Interface.setScore(playerHand, input);
      if (playerHand < 21)
        return true;
      else if (playerHand >= 21){
        Interface.setHandBlocker(_players[playerIndex].getState[i]);
        setTimeout(()=>{
          this.dealersTurn();
        }, 2000);
      }
    },
    stayPlayer (i) {
      Interface.setHandBlocker(`Stay at ${_players[1][i]}`, i);
      if(!_playerHasSplit || i === 1) this.dealersTurn();
      else Interface.btnsEnable(1);
    },
    doublePlayer (i) {
      _players[1].double(i);
      const notBust = this.hitPlayer(i); //returns true if the player has not busted. If they have pusted the dealer's turn will be triggered in hitPlayer();
      if (notBust) this.stayPlayer(i);
    },
    splitPlayer () {
      let handA = _players[1].hands[0];
      let handB = _players[1].hands[1];
      Interface.split();
      //move players second card from first hand to second hand arrray;
      handB.push(handA.pop());
      //set _playerHasSplit to True
      _playerHasSplit = true;
      _players[1].split();
      //set players second hand btns to disable
      Interface.btnsDisable[1];
    },
    dealersTurn () {
      console.log("dealers turn called");
      const dealersIndex = 0; 
      const input = [dealersIndex, 0];
      setTimeout(dealersCard = () => {
        const dealerHand = _players[dealersIndex].handValue[0];
        if (dealerHand <= 16 ){
          _dealCard(input);
          setTimeout(dealersCard(), 1500);
        } else {
          if (dealerHand <= 21) {
            Interface.setDealerBlocker(`Stays at ${dealerHand}`);
          } else {
            Interface.setDealerBlocker(_players[dealersIndex].getState()[0]);
          }
          _endRound();
        }
      }, 1500);
    },
    setTable (bet) {
      console.log("setTable called");
      const strtCards = 2;
      const dealersIndex = 0;
      const playerIndex = 1;
      const allHands = [_players[0].hands, _players[1].hands];      
      
      _players[1].bet(bet);

      allHands.forEach((hands) => {   //move all players cards to deck discard
        hands.forEach((cards)=>{
          while (0 < cards.length){
            _deck.discard(cards.pop());
          }
        });
      });

      Interface.setWallet(_players[1].wallet);
      Interface.clearHands();
      Interface.hideModules();
      for (let i = 0; i < strtCards; i++){  //deal strtCards cards...
        for (let j = 0; j < _players.length; j++){ //...to each player's first hand.
          _dealCard([j, 0]);    
        }
      }
      
      Interface.setScore(_players[dealersIndex].handValue[0], [dealersIndex, 0]);  //eval player and dealer so scores can be set
      Interface.setScore(_players[playerIndex].handValue[0], [playerInput, 0]);
      Interface.btnsEnable(0);      
      Interface.btnsEnable(1);
      _evalForSplit();
  
      if (_players[playerIndex].getState()[0] == "BlackJack"){  //if the player has black jack
        Interface.setHandBlocker("BlackJack");                 //set set his hand to BlackJack
        this.dealersTurn();                                   //let the dealer go
      }
    },
    handCheck () {
      console.log(`Discard Pile: ${_deck.reportDiscard()}`);
    }
  }
})();