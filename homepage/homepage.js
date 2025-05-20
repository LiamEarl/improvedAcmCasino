// For countdown timers
let timeLeft = 10 * 60; // 10 minutes in seconds
const timerElement = document.getElementById('countdown-timer');
const jackpotElement = document.getElementById('last-jackpot-amount');

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds; // Add leading zero if seconds < 10

    // Use a simple string for textContent
    if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds}`;
    }

    if (timeLeft > 0) {
        timeLeft--;
    } else {
        if (timerElement) {
            timerElement.textContent = "Expired!";
        }
    }
}

// Update jackpot amount randomly for effect
function updateJackpot() {
    if(jackpotElement) {
        const randomAmount = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;
        jackpotElement.textContent = randomAmount.toLocaleString() + ' Liam Coins!';
    }
}

let timerInterval; // Declare interval variable to be able to clear it

if (timerElement) {
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Call it once immediately to avoid initial 1-second delay
}
if (jackpotElement) {
    setInterval(updateJackpot, 5000); // Update jackpot every 5 seconds
    updateJackpot(); // Call it once immediately
}