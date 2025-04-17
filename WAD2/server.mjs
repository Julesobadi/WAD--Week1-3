import express from 'express';
import Database from 'better-sqlite3';
import ViteExpress from 'vite-express';
import expressSession from 'express-session';
import betterSqlite3Session from 'express-session-better-sqlite3';

import userRouter from './users.mjs';
import 'dotenv/config';
import { checkUserSession } from './middleware/auth.mjs';




const app = express();
app.use(express.json()); // for express to parse JSON data from the body of HTTP request

// to give access to public folder
app.use(express.static('public'));


// load Database
import db from './db.mjs';


const sessDb = new Database("session.db");
const SqliteStore = betterSqlite3Session(expressSession, sessDb);



app.use(expressSession({
    store: new SqliteStore(), 
    secret: 'BinnieAndClyde', 
    resave: true, 
    saveUninitialized: false, 
    rolling: true, 
    unset: 'destroy', 
    proxy: true, 
    cookie: { 
        maxAge: 600000, // 600000 ms = 10 mins expiry time
        httpOnly: false // allow client-side code to access the cookie, otherwise it's kept to the HTTP messages
    }
}));



app.use('/users', userRouter);

app.use(checkUserSession);




// Setup root
app.get('/', (req, res) => {
    // res.send is method to send back to client
    res.send(`Hello World!`)
});

// time route
app.get('/time', (req, res) => {
    res.send(`There have been ${Date.now()} milliseconds since 1/1/70.`);
});

// greet route that takes parameter
app.get('/greet/:userName', (req, res) => {
    // to set parameter
    const userName = req.params.userName;
    res.send(`Hello ${userName}`)
});

// search for all songs by given artist
app.get('/song/artist/:theArtist', (req, res) => {
    const theArtist = req.params.theArtist;
    try {
        const stmt = db.prepare("SELECT * FROM wadsongs WHERE artist = ? ");
        const results = stmt.all(theArtist);
        res.json(results);
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});

// search by title
app.get('/song/title/:title', (req, res) => {
    const title = req.params.title;
    try {
        const stmt = db.prepare("SELECT * FROM wadsongs WHERE title = ?")
        const results = stmt.all(title);
        res.json(results);
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});

// search by artist and title
app.get('/song/artist/:theArtist/:title', (req, res) => {
    const theArtist = req.params.theArtist;
    const title = req.params.title;
    try {
        const stmt = db.prepare("SELECT * FROM wadsongs WHERE artist = ? AND title = ? ");
        const results = stmt.all(theArtist, title);
        res.json(results);
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});


// search by song id
app.get('/song/id/:songId', (req, res) => {
    const songId = req.params.songId;
    
    try {
        const stmt = db.prepare("SELECT * FROM wadsongs WHERE id = ? ");
        const results = stmt.all(songId);
        res.json(results);
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});


// add song
app.post('/song/create', (req, res) => {
    try {
        //If any field is empty, return 400 Bad Request
        if (!title || !artist || !year) {
            return res.status(400).json({ error: "All fields (title, artist, year) are required." });
        }
        const stmt = db.prepare("INSERT INTO wadsongs(title, artist, year) VALUES(?,?,?)");
        const info = stmt.run(req.body.title, req.body.artist, req.body.year);
        res.json({id: info.lastInsertRowid});
    } catch(error) {
        console.log(error); 
        res.status(500).json({ error: error });
    }
});

// to edit price and quantity with given ID
app.put('/song/put/:id', (req, res) => {
    try {
        const stmt = db.prepare("UPDATE wadsongs SET price=?, quantity=? WHERE id=?");
        const info = stmt.run(req.body.price, req.body.quantity, req.params.id);
        if(info.changes == 1) {
            res.status(200).json({success: true});
        } else {
            res.status(404).json({error: "Could not find id"})
        }
    } catch(error) {
        res.status(500).json({error: error});
    }
});

// delete song with given ID
app.delete('/song/delete/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM wadsongs WHERE id=?');
        const info = stmt.run(req.params.id);
        if(info.changes == 1) {
            res.json({success:1});
        } else {
            res.status(404).json({error: 'No song with that ID'});
        }
    } catch(error) {
        res.status(500).json({ error: error });
    }
});





// Start up the server
const PORT = 5000;

ViteExpress.listen(app, PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});
