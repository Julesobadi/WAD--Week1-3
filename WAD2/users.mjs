import express from 'express';
import db from './db.mjs';

const userRouter = express.Router();

userRouter.post('/login', (req, res) => {
    const stmt = db.prepare("SELECT * FROM ht_users WHERE username=? AND password=?");
    const row = stmt.get(req.body.username, req.body.password);
    if(row) {
        req.session.username = req.body.username;
        res.json({ username: req.body.username });
    } else {
        res.status(401).json({ error: "Invalid login!" });
    }
});

userRouter.get('/login', (req, res) => {
    res.json({ username: req.session.username || null });
});

userRouter.post('/logout', (req, res) => {
    req.session = null;
    res.json({ loggedout: true });
});

export default userRouter;
