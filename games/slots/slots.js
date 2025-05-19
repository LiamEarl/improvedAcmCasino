const storedUser = localStorage.getItem("user");
let user;
let bet = 20;
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

const symbols = ["🍒", "🍋", "🍉", "🍇", "🔔", "⭐", "💎"];

function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateCredits() {
  document.getElementById("credits").textContent = `💰 LiamCoins: ${liamCoins}`;
  user.liamCoins = liamCoins.toString();
  localStorage.setItem("user", user);
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
}

function checkResult(r1, r2, r3) {
  const result = document.getElementById("result");

  if (r1 === r2 && r2 === r3) {
    var jackpot = new Audio("../assets/jackpot.mp3");
    jackpot.currentTime = 0;
    jackpot.play();
    result.textContent = "🎉 JACKPOT! You won ".concat((bet*5).toString()).concat(" LiamCoins!");
    liamCoins += bet * 6;
  } else if (r1 === r2 || r2 === r3 || r1 === r3) {
    var pair1 = new Audio("../assets/pair1.mp3");
    pair1.currentTime = 0;
    pair1.play();
    result.textContent = "😊 You got a pair! You won ".concat(bet.toString()).concat(" LiamCoins!");
    liamCoins += bet * 2;
  } else {
    var noPair = new Audio("../assets/noPair.mp3");
    noPair.currentTime = 0;
    noPair.play();
    result.textContent = "🙁 No match. Better luck next time.";
  }

  updateCredits();
}

function spin() {
  if(bet < 1) return;

  var spinSound = new Audio("../assets/spin.mp3");

  if (liamCoins < bet) {
    var BrokeLiamCoins = new Audio("../assets/BrokeLiamCoins.mp3");
    BrokeLiamCoins.currentTime = 0;
    BrokeLiamCoins.play();
    document.getElementById("result").textContent = "🚫 Not enough LiamCoins to spin!";
    return;
  }

  spinSound.currentTime = 0;
  spinSound.play();

  liamCoins -= bet;
  updateCredits();

  const resultEl = document.getElementById("result");
  const spinButton = document.getElementById("spinButton");
  spinButton.disabled = true;
  resultEl.textContent = "🎰 Spinning...";

  const reelEls = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3")
  ];

  const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

  reelEls.forEach((reel, index) => {
    let count = 0;
    const spinInterval = setInterval(() => {
      reel.textContent = getRandomSymbol();
      count++;
      if (count >= 10 + index * 5) {
        clearInterval(spinInterval);
        reel.textContent = finalSymbols[index];

        if (index === 2) {
          checkResult(...finalSymbols);
          spinButton.disabled = liamCoins < 10;
        }
      }
    }, 50);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const startSound = document.getElementById("startSound");
  const spinSound = document.getElementById("spinSound");
  const pair1 = document.getElementById("pair1");
  const startButton = document.getElementById("startButton");
  const welcomeScreen = document.getElementById("welcomeScreen");
  const gameArea = document.getElementById("gameArea");
  
  startButton.addEventListener("click", () => {
    var startSound = new Audio("../../assets/start.mp3");
    startSound.currentTime = 0;
    startSound.play();
    welcomeScreen.style.display = "none";
    gameArea.style.display = "block";
    updateCredits();
  });
  bet = parseInt(document.getElementById('betAmount').value);

  document.getElementById('betAmount').addEventListener('input', function () {
    bet = parseInt(this.value, 10);
  });
  document.getElementById("spinButton").addEventListener("click", spin);
});