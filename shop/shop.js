const storedUser = localStorage.getItem("user");
let user;
try {
    user = JSON.parse(storedUser);
} catch (e) {
    console.error("Failed to parse user from localStorage:", e);
    window.location.href = "../login/login.html";
}
if (!user || !user.id) {
    window.location.href = "../login/login.html";
}
let id = parseInt(user.id, 10); 
let liamCoins = parseInt(user.liamCoins, 10);
if (isNaN(liamCoins)) {
    window.location.href = "../login/login.html"; 
}

document.getElementById("player-chip-balance").textContent = user.liamCoins;