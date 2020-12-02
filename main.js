
class Player {
  constructor(name){
    this.cards = [];
    this.name = name;
    this.wallet = 500;
    this.handValue;
  }
  dealCard(){
    let cardDealt = Deck.deal();
    this.cards.push(cardDealt);
    console.log(cardDealt + " dealt to " + this.name);
    (()=>{ //set this.handValue
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
        if(i == 1 && value ==21){
          this.handValue = "BlackJack";
          return;
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
      if (value > 21){        
        this.handValue = "Bust";
        return;
      }
      this.handValue = value;
    })();
  }
  clearHand () {this.cards = []}
}

const Deck = (function () {
  const _standardDeck = ["2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AC" 
    ,"2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "AS" 
    ,"2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AH" 
    ,"2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD", "AD" 
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
  const _dealer = new Player("Dealer");
  const _players = [];

  return {
    get player () {return _players;},
    get dealer () {return _dealer;},

    seatPlayer () {_players.push(new Player(`player${_players.length+1}`));},
    dealAll (num) {
      const playerCount = _players.length; //total players plus dealer
      let cardsDealt = 0;
      while(cardsDealt < num){
        for(let i = 0; i < playerCount; i++){
          _players[i].dealCard();
        }
        _dealer.dealCard();
        cardsDealt++;
      }
    },
  }
})();

const userIf_BJ = (function () { //User Interface director
  const hands = document.getElementsByClassName("hand");
  function newCard (suit) {
    let card = document.createElement("div");
    let img = document.createElement("img");
    card.className = "card";
    img.src = `./img/${suit}.svg`;
    card.appendChild(img);
    return card;
  }
  return {
    setHandScore () {
      const scoreHolders = document.getElementsByClassName("scoureHolder");
      const players = [Table.dealer, ...Table.player];
      for(let i = 0; i < players.length; i++){
        scoreHolders[i].innerHTML = players[i].handValue;
      }
    },
    setPlayerWallets () {
      document.getElementById("playerWallet").innerHTML = Table.player[0].wallet;
    },    
    renderAllCards() {
      const players = [Table.dealer, ...Table.player];
      players.forEach((player, index) => {
        for (suit of player.cards){hands[index].appendChild(newCard(suit));}
      });
    },
    renderHitCard(index) {
      const players = [Table.dealer, ...Table.player];
      const player = players[index];
      const suit = player.cards[player.cards.length - 1];
      hands[index].appendChild(newCard(suit))
    },
    clearHands() {
      for(hand of hands)
        hand.innerHTML = "";
    },
    toggleCover(element) {
      const style = element.parentElement.style
      console.log(element.parentElement);
      if (style.display === "none") {
        style.display = "flex";
      } else {
        style.display = "none";
      }
    },
    displayResult(result) {
      let element = document.getElementById("handResult");
      element.innerHTML = result;
      this.toggleCover(element);
      console.log(element);
    },
    toggleHitStay() {
      btns = document.getElementsByClassName("hitStay");
      for (let i = 0; i < btns.length; i++){
        btns[i].toggleAttribute("disabled");
      }
      // btns.forEach((btn) => {btn.value = ""});
    },
  }
})();

const GameDirector = (function () {
  let _dealerState = '';
  let _playerState = '';
  let _hndRes;
  handRes = (handRes) => {
    userIf_BJ.displayResult(handRes);
    let betMod;
    if (handRes == "BlackJack") {
      betMod = 1.5;
    } else if (handRes == "Win") {
      betMod = 1;
    } else if (handRes == "Lose") {
      betMod = -1;
    }
    //mulitply players bet by betMod and add it to the wallet
  }
  evalPlayerHand = () => {
    _playerState = Table.player[0].handValue;
  };
  dealCard = (player) => {
    console.log(player.name + " gets a card");
    player.dealCard();
    userIf_BJ.renderHitCard()
  };
  
  return{
    startNewGame (element) {
      Deck.shuffle();
      Table.seatPlayer();
      userIf_BJ.setPlayerWallets();
      userIf_BJ.toggleCover(element);
      Table.dealAll(2);
      userIf_BJ.renderAllCards();
      //bet
      userIf_BJ.setHandScore();
      //turn over cards      
      _playerState = Table.player[0].handValue;
      evalPlayerHand();
      userIf_BJ.toggleHitStay();
    },
    hitPlayer () {
      console.log("player hits");
      let player = Table.player[0];
      player.dealCard();
      userIf_BJ.renderHitCard(1, player.cards[player.cards.length - 1]);
      userIf_BJ.setHandScore();
      evalPlayerHand();
    },
    stayPlayer () {      
      userIf_BJ.toggleHitStay();
      this.dealersTurn();
    },
    nextHand (ele) {
      //clear table and hands, but save players and wallets
      userIf_BJ.toggleCover(ele);
      userIf_BJ.clearHands();
    },
    dealersTurn () {
      //evaluate hand value
      const dealer = Table.dealer;
      const val = dealer.handValue;
      window.setTimeout(()=>{
        if (val <= 16){          
          Table.dealer.dealCard();
          userIf_BJ.renderHitCard(0);
          userIf_BJ.setHandScore();
          this.dealersTurn();
        }
      }, 5*100);

      //if <= 16 && not bust hit and return to last step.
      if (val > 21) {
        //bust dealer
        console.log("Dealer Busts");
      }
      userIf_BJ.toggleHitStay();
      //evaluate all hands against dealers
    },
  }
})();

