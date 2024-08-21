const jwt = require("jsonwebtoken");

const validate = async (req, res, next) => {
  const token = req.headers.authorization;
 
  if (!token) {
    res.status(403).json({ message: "Access denied" });
  }
  try {
    const isUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = isUser;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message || " Invalid Token " });
  }
};

module.exports = validate
