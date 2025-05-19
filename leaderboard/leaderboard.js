const leaderboardDiv = document.getElementById('leaderboard');
const messageBox = document.getElementById('message-box');
const refreshButton = document.getElementById('refreshButton');
let messageTimeout;
let currentLocalUser = null; // Stores { username: "name_from_localstorage", liamCoins: 123 }
let lastFetchedLeaderboardData = []; // Stores the last successfully fetched array from API

// Function to show a message (success or error)
function showMessage(message, type = 'success') {
    messageBox.textContent = message;
    messageBox.className = ''; // Clear existing type classes
    messageBox.classList.add(type); // 'success' or 'error'
    messageBox.classList.add('show');

    if (messageTimeout) {
        clearTimeout(messageTimeout);
    }
    messageTimeout = setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}

// Function to load local user data from localStorage
function loadLocalUserData() {
    const userString = localStorage.getItem("user");
    currentLocalUser = null; // Reset before loading
    if (userString) {
        try {
            const parsedUser = JSON.parse(userString);
            // Expecting 'username' (for local identification) and 'liamCoins' in localStorage
            if (parsedUser && typeof parsedUser.username === 'string' && parsedUser.liamCoins !== undefined) {
                const coins = parseInt(parsedUser.liamCoins, 10);
                if (!isNaN(coins)) {
                    currentLocalUser = {
                        username: parsedUser.username, // This is the current browser user's display name
                        liamCoins: coins
                    };
                    // console.log("Local user data loaded for leaderboard:", currentLocalUser);
                } else {
                    console.warn("Parsed liamCoins from localStorage is NaN for local user.");
                }
            } else {
                    console.warn("Local user data in localStorage is missing 'username' or 'liamCoins', or 'username' is not a string.");
            }
        } catch (e) {
            console.error("Error parsing local user data for leaderboard:", e);
        }
    }
}

/**
 * Updates the leaderboard display.
 * @param {Array<Object>} usersArrayFromServer - An array of user objects from the API.
 * Each object from API is expected to have 'name' (for display) and 'liamCoins'.
 */
function updateLeaderboard(usersArrayFromServer) {
    if (!leaderboardDiv) {
        console.error("Leaderboard DIV not found!");
        return;
    }
    leaderboardDiv.innerHTML = ''; // Clear previous entries

    // Create a mutable shallow copy of the user objects from the server
    let displayArray = usersArrayFromServer.map(u => ({ ...u }));

    if (currentLocalUser) {
        // API provides 'name', local user has 'username'. We match these.
        const localUserIndex = displayArray.findIndex(u => u.name === currentLocalUser.username);
        if (localUserIndex > -1) {
            displayArray[localUserIndex].liamCoins = currentLocalUser.liamCoins;
        } else {
            // Add local user if not in the fetched list, using 'name' for consistency in displayArray structure
            displayArray.push({
                name: currentLocalUser.username, // This will be used for display
                liamCoins: currentLocalUser.liamCoins
                // id: "local_user" // Optional: for debugging or specific styling
            });
        }
    }

    if (displayArray.length === 0) {
        leaderboardDiv.innerHTML = '<p class="text-center text-gray-500">The leaderboard is empty or no data received.</p>';
        return;
    }

    const sortedLeaderboard = displayArray.sort((a, b) => (b.liamCoins || 0) - (a.liamCoins || 0) );

    sortedLeaderboard.forEach((user, index) => {
        const rank = index + 1;
        let rankBadgeClass = 'rank-other';
        if (rank === 1) rankBadgeClass = 'rank-1';
        else if (rank === 2) rankBadgeClass = 'rank-2';
        else if (rank === 3) rankBadgeClass = 'rank-3';

        // API provides 'name', local user has 'username'.
        const isCurrentUser = currentLocalUser && user.name === currentLocalUser.username;

        const item = document.createElement('div');
        item.className = `leaderboard-item flex items-center justify-between p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md ${isCurrentUser ? 'ring-2 ring-indigo-500' : ''}`;
        item.innerHTML = `
            <div class="flex items-center overflow-hidden mr-2">
                <span class="rank-badge rounded-full text-xs mr-3 ${rankBadgeClass}">${rank}</span>
                <span class="font-medium text-gray-700 truncate pr-1 ${isCurrentUser ? 'font-bold' : ''}">${user.name || 'Unnamed User'}</span>
            </div>
            <span class="font-semibold text-indigo-600 whitespace-nowrap">${(user.liamCoins || 0).toLocaleString()} Liam Coins</span>
        `;
        leaderboardDiv.appendChild(item);
    });
}

// Function to fetch the leaderboard state via HTTP from Spring Boot API
async function fetchLeaderboard() {
    const apiURL = 'http://localhost:8080/api/users';
    if (leaderboardDiv) {
            leaderboardDiv.innerHTML = '<p class="text-center text-gray-500">🔄 Refreshing leaderboard...</p>';
    }
    if (refreshButton) {
        refreshButton.disabled = true;
    }

    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}. Details: ${errorText}. URL: ${apiURL}`);
        }
        const usersArray = await response.json(); // Expecting an array of user objects
        lastFetchedLeaderboardData = usersArray;
        loadLocalUserData(); 
        updateLeaderboard(usersArray);
        showMessage('Leaderboard updated!', 'success');
    } catch (error) {
        console.error('Failed to fetch leaderboard from API:', error);
        if (leaderboardDiv) {
            leaderboardDiv.innerHTML = `<p class="text-center text-red-500">Failed to load. ${error.message}</p>`;
        }
        showMessage('Failed to load leaderboard data.', 'error');
    } finally {
        if (refreshButton) {
                refreshButton.disabled = false;
        }
    }
}

// Listen for localStorage changes from other tabs
window.addEventListener('storage', (event) => {
    if (event.key === 'user' && event.newValue) {
        const oldCoins = currentLocalUser ? currentLocalUser.liamCoins : null;
        loadLocalUserData(); // Reload local user data

        if (currentLocalUser && (oldCoins === null || currentLocalUser.liamCoins !== oldCoins)) {
            updateLeaderboard(lastFetchedLeaderboardData); // Re-render with stored full list
        }
    }
});

// Event listener for the refresh button
if (refreshButton) {
    refreshButton.addEventListener('click', fetchLeaderboard);
} else {
    console.warn("Refresh button (id='refreshButton') not found. Manual refresh will not work.");
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadLocalUserData(); 
    fetchLeaderboard(); 
});