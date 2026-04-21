import { verifyAccessToken } from "../utils/tokens.js";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers?.authorization;
    //to save the accessToken from headers.authorization if it exists
    const token = header?.split(" ")?.[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Access token missing" });
    }

    const decodedToken = verifyAccessToken(token);
    req.userId = decodedToken.userId;
    req.userRole = decodedToken.role;
  } catch (error) {
    if (error?.message?.includes("expired")) {
      return res.status(401).json({
        message: "Unauthorized: Expired",
      });
    }

    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
  
  next();
}

export function requireAdmin(req, res, next) {
  if (req?.userRole !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
}
