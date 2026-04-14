import { verifyAccessToken } from "../utils/tokens.js";

export function requireAuth(req, res, next){
  try{
    const header = req.headers?.authorization
    const token = header?.split(" ")?.[1]

    if(!token){
      throw new Error("Unauthorized")
    }

    const decodedToken = verifyAccessToken(token)
    req.userId = decodedToken.userId
    req.userRole = decodedToken.userRole

  }catch(error){
    if(error?.message?.includes("expired")){
      return res.status(401).json({
        message: "Unauthorized - Expired"
      })
    }
    return res.status(401).json({
      message: "Unauthorized"
    })
  }
  next()
}