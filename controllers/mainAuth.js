const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        req.userId = decoded.userId; // Add userId to request object
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
