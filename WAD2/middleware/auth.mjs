export function checkUserSession(req, res, next) {
    if (["POST", "PUT", "DELETE"].includes(req.method)) {
        if (req.session.username) {
            next();
        } else {
            res.status(401).json({ error: "You're not logged in. Please try again!" });
        }
    } else {
        next();
    }
}
