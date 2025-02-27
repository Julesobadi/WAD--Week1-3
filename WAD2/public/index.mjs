async function artistSearch(theArtist) {
    try {
        // Send a request ,must be similar to the server side API
        const response = await fetch(`http://localhost:5000/song/artist/${theArtist}`);

        // Parse the JSON
        const artistSong = await response.json();

         // Get the table body element
         const tableBody = document.getElementById('searchTableBody');
         tableBody.innerHTML = ""; // Clear previous results

         // Check if no results found
        if (artistSong.length === 0) {
            document.getElementById('results').innerHTML = `<span style="color: red;">No songs found for this artist.</span>`;
            return;
        } else {
            document.getElementById('results').innerHTML = ""; // Clear error message if successful
        }
        // Loop through each song and add a row to the table
        artistSong.forEach(song => {
            const row = document.createElement('tr');
            const isHit = song.year < 2000 ? "CLASSIC HIT!" : ""
            row.innerHTML = `
                <td>${song.title}</td>
                <td>${song.artist}</td>
                <td>${song.year}</td>
                <td>${isHit}
            `;
            tableBody.appendChild(row);
        });


        /* 
        // Loop through the array of JSON objects and add the results to a <div>
        //let html = "";


       artistSong.forEach ( song => {
            html += `Artist Name: ${song.artist} Title: ${song.title} Year: ${song.year}<br />`;
        });
        document.getElementById('results').innerHTML = html;
        */


    } catch (e) {
        alert(`There was an error: ${e}`);
    }
}

// Make the AJAX run when we click a button
document.getElementById('artistButton').addEventListener('click', ()=> {
    // Read the artist from a text field
    const artist = document.getElementById('theArtist').value;
    artistSearch(artist);
});




// creating AJAX function for POST
async function addSong(title, artist, year) {
    try {
        const response = await fetch('http://localhost:5000/song/create', {  
            method: "POST",  // Declaring the method we want to us
            headers: { "Content-Type": "application/json" },  // Tell the server we're sending JSON
            body: JSON.stringify({ title, artist, year })  // Send data in the request body
        });
        // handling bad request but we have to declare it in the server side
        if (response.status === 400) {
            const errorData = await response.json();
            document.getElementById('newResult').innerHTML = `<span style="color: red;">Error: ${errorData.error}</span>`;
            return;  // Stop further execution
        }
        const newSong = await response.json(); 
        // to trigger that when we call for newResult which in html is after clicking button, 
        // it will show confirmation that it is added and send it back as html
        document.getElementById('newResult').innerHTML = `Song added with ID: ${newSong.id}`;
    } catch (e) {
        alert(`There was an error: ${e}`);
    }
}

// Make the AJAX run when we click a button
document.getElementById('addButton').addEventListener('click', ()=> {
    // Read the new song from a text field (html)
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const year = document.getElementById('year').value;

    addSong(title, artist, year);
});