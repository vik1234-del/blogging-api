const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  console.log("Token:", token); // Log the token
  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      return res.sendStatus(403);
    }
    console.log("Decoded Token:", decodedToken); // Log the decoded token
    req.user = decodedToken; // Assign decoded token to req.user
    next();
  });
}

module.exports = authenticateToken;
