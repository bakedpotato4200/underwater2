// backend/middleware/auth.js
// ========================================
// Underground Water 2 - Auth Middleware
// Validates JWT and attaches user info to req
// ========================================

import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header =
    req.headers.authorization || req.headers["authorization"];

  // No auth header found
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    // Token payload contains: { userId, email }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}