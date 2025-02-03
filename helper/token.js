import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    // const token = req.cookies.token;
    const tokenHeader = authHeader && authHeader.split(" ")[1];

    if (tokenHeader == null) {
      return res.status(401).json({
        success: false,
        message: "Token required",
      });
    }

    jwt.verify(tokenHeader, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log("Error:", err);

        return res.status(403).json({
          success: false,
          message: "Invalid token",
        });
      }

      console.log("User:", user);

      req.user = user; // Tambahkan user ke request
      next();
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export default authenticateToken;
