document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loggedInMessage = document.getElementById('loggedInMessage');
    const currentUser = document.getElementById('currentUser');
    const loginButton = document.getElementById('loginButton');
    
    // These are the search and add song elements
    const searchAndAddSongSection = document.getElementById('searchAndAddSongSection');
    
    // Hide search and add song section by default
    searchAndAddSongSection.style.display = 'none';

    // Send a GET request to /login to check if the user is already logged in
    checkLoginStatus();

    // Handle login form submission
    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const loginData = {
            username: username,
            password: password
        };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (response.status === 200) {
                // If login is successful
                const userData = await response.json();
                displayLoggedIn(userData.username);
            } else {
                // If login fails
                alert('Login failed. Please check your username and password.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred while logging in.');
        }
    });

        // Handle logout button click
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', { method: 'POST' });
    
                if (response.status === 200) {
                    // On successful logout, hide the logout button and show login form
                    logoutButton.style.display = 'none';
                    loggedInMessage.innerHTML = '';  // Clear "Logged in as" message
                    loginForm.style.display = 'block';
                    searchAndAddSongSection.style.display = 'none';  // Hide search and add song section
                } else {
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('An error occurred while logging out.');
            }
        });

    async function checkLoginStatus() {
        try {
            const response = await fetch('/login', { method: 'GET' });

            if (response.status === 200) {
                // If user is logged in, hide the login form and show the "Logged in as..." message
                const data = await response.json();

                if (data.username) {
                    displayLoggedIn(data.username);
                } else {
                    loginForm.style.display = 'block';
                    loggedInMessage.style.display = 'none';
                    searchAndAddSongSection.style.display = 'none';
                }
            } else {
                // If user is not logged in, show the login form and hide the "Logged in as..." message
                loginForm.style.display = 'block';
                loggedInMessage.style.display = 'none';
                searchAndAddSongSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    }

    function displayLoggedIn(username) {
        loginForm.style.display = 'none';
        loggedInMessage.style.display = 'block';
        currentUser.textContent = username;
        logoutButton.style.display = 'inline';  // Show the logout button
        searchAndAddSongSection.style.display = 'block';  // Show search and add song section
    }
});

// Search function
async function artistSearch(theArtist) {
    try {
        const response = await fetch(`http://localhost:5000/song/artist/${theArtist}`);

        const artistSong = await response.json();
        const tableBody = document.getElementById('searchTableBody');
        tableBody.innerHTML = ""; // Clear previous results

        if (artistSong.length === 0) {
            document.getElementById('results').innerHTML = `<span style="color: red;">No songs found for this artist.</span>`;
            return;
        } else {
            document.getElementById('results').innerHTML = "";
        }

        artistSong.forEach(song => {
            const row = document.createElement('tr');
            const isHit = song.year < 2000 ? "CLASSIC HIT!" : "";
            row.innerHTML = `
                <td>${song.title}</td>
                <td>${song.artist}</td>
                <td>${song.year}</td>
                <td>${isHit}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (e) {
        alert(`There was an error: ${e}`);
    }
}

// Artist search button click event
document.getElementById('artistButton').addEventListener('click', () => {
    const artist = document.getElementById('theArtist').value;
    artistSearch(artist);
});

// Add song function (AJAX POST)
async function addSong(title, artist, year) {
    try {
        const response = await fetch('http://localhost:5000/song/create', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, artist, year })
        });

        if (response.status === 400) {
            const errorData = await response.json();
            document.getElementById('newResult').innerHTML = `<span style="color: red;">Error: ${errorData.error}</span>`;
            return;
        }

        const newSong = await response.json();
        document.getElementById('newResult').innerHTML = `Song added with ID: ${newSong.id}`;
    } catch (e) {
        alert(`There was an error: ${e}`);
    }
}

// Add song button click event
document.getElementById('addButton').addEventListener('click', () => {
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const year = document.getElementById('year').value;

    addSong(title, artist, year);
});
