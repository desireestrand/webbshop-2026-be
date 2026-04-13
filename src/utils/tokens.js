import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "1d"

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d"

export function generateAccessToken(user){
  return jwt.sign({
    userId: user.id,
    role: user.role
  }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES
  })
}

export function verifyAccessToken(token){
  return jwt.verify(token, JWT_ACCESS_SECRET)
}

export function generateRefreshToken(user){
  return jwt.sign({
    userId: user.id,
    role: user.role
  }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES
  })
}

export function verifyRefreshToken(token){
  return jwt.verify(token, JWT_REFRESH_SECRET) || null
}
