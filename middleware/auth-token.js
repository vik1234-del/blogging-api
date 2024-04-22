// auth-token.js
const jwt = require("jsonwebtoken");
const secretKey = "W3H4euYdDJvj";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = decodedToken; // Assign decoded token to req.user
    next();
  });
}

module.exports = authenticateToken;
