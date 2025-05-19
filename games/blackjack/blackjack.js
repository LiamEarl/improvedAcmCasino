const storedUser = localStorage.getItem("user");
let user;
try {
  user = JSON.parse(storedUser);
} catch (e) {
  console.error("Failed to parse user from localStorage:", e);
  window.location.href = "../../login/login.html";
}

if (!user || !user.id) {
  window.location.href = "../../login/login.html";
}

let id = parseInt(user.id, 10); 
let liamCoins = parseInt(user.liamCoins, 10);
if (isNaN(liamCoins)) {
  window.location.href = "../../login/login.html";
}

let locked = false;
let leaveWithoutPenalty = true;

class Card {
  constructor(face, suit) {
    this.face = face;
    this.suit = suit;
  }

  printCard() {
    return this.face + " of " + this.suit;
  }
}

class Deck {
  constructor() {
    this.contents = [];
  }

  genDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const faces = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K", "A"];
    const cards = [];

    for (let suit of suits) {
      for (let face of faces) {
        cards.push(new Card(face, suit));
      }
    }

    return cards;
  }

  shuffle() {
    for (let i = this.contents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.contents[i], this.contents[j]] = [this.contents[j], this.contents[i]];
    }
  }

  draw() {
    return this.contents.pop();
  }
}

class Hand {
  constructor(owner) {
    this.contents = [];
    this.owner = owner; 
  }

  print() {
    const container = document.getElementById(`${this.owner}-cards`);
    container.innerHTML = "";
    for (let card of this.contents) {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.innerHTML = `<div>${card.face}</div><div>${card.suit}</div>`;
      container.appendChild(cardDiv);
    }
  }

  add(card) {
    this.contents.push(card);
    this.print();
  }

  getPoints() {
    const valueMap = {
      "02": 2, "03": 3, "04": 4, "05": 5, "06": 6, "07": 7,
      "08": 8, "09": 9, "10": 10, "J": 10, "Q": 10, "K": 10, "A": 11
    };

    let total = 0;
    let aces = 0;

    for (let card of this.contents) {
      total += valueMap[card.face];
      if (card.face === "A") aces++;
    }

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  updatePointsDisplay() {
    document.getElementById(`${this.owner}-points`).textContent =
      (this.owner === "player" ? "Your Points: " : "House Points: ") + this.getPoints();
  }
}

const deck = new Deck();
deck.contents = deck.genDeck();
deck.shuffle();

const playerHand = new Hand("player");
const houseHand = new Hand("house");

const blackjack = {
  start() {
    playerHand.add(deck.draw());
    houseHand.add(deck.draw());
    playerHand.add(deck.draw());
    houseHand.add(deck.draw());

    playerHand.updatePointsDisplay();
    houseHand.updatePointsDisplay();
    this.updateCoins();
  },

  hitMe() {
    if(locked) return;
    playerHand.add(deck.draw());
    playerHand.updatePointsDisplay();
    playerPoints = playerHand.getPoints();
    if (playerPoints > 21) {
      document.getElementById("status").textContent = "You busted!";
      this.checkWinner();
    }
  },

  hold() {
    if(locked) return;
    this.houseTurn();
    this.checkWinner();
  },

  houseTurn() {
    if(houseHand.getPoints() >= 17) return;
    while(houseHand.getPoints() < 17) {
      houseHand.add(deck.draw());
      console.log(houseHand.getPoints());
      houseHand.updatePointsDisplay();
    }
  },

  updateCoins() {
    document.getElementById("credits").textContent = `💰 LiamCoins: ${liamCoins}`;
    user.liamCoins = liamCoins.toString();
    localStorage.setItem("user", JSON.stringify(user)); 
    fetch("http://localhost:8080/api/users/".concat(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => console.log('Updated user:', data))
    .catch(error => console.error('Error:', error));
  },

  checkWinner() {
    if(locked) return;
    const playerPoints = playerHand.getPoints();
    const housePoints = houseHand.getPoints();

    if (playerPoints > 21) {
      document.getElementById("status").textContent = "You busted!";
      liamCoins -= 20;
      
    } else if (housePoints > 21) {
      document.getElementById("status").textContent = "House busted! You win!";
      liamCoins += 20;
      
    } else if(housePoints == playerPoints) {
      document.getElementById("status").textContent = "It's a tie!";
    
    } else if(playerPoints > housePoints) {
      document.getElementById("status").textContent = "You WIN! You were closer to 21!";
      liamCoins += 20;
    } else if(housePoints > playerPoints) {
      document.getElementById("status").textContent = "You Lost! House was closer to 21!";
      liamCoins -= 20;
    }
    locked = true;
    document.getElementById("back").style.color = "";
    this.updateCoins();
  }
};

window.onload = () => {
  if(liamCoins <= 0) {
    document.getElementById("noCoins").textContent = "NO COINS? NO PLAY";
    locked = true;
  }else {
    document.getElementById("noCoins").textContent = "";
  }

  document.getElementById("new-game").onclick = () => {if(locked) location.reload();}
  document.getElementById("hit").onclick = () => {if(!locked) blackjack.hitMe();}
  document.getElementById("hold").onclick = () => {if(!locked) blackjack.hold();}

  blackjack.start();
};