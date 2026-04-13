import User from "../models/User.js"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/tokens.js"
import { getUserById } from "./users.js"

function _generateTokens(user){
  const payload = { 
    userId: user._id, 
    role: user.role,
    email: user.email 
  };

  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)
  return {accessToken, refreshToken}
}

function _getUserObject(user){
/*   const userObject = user.toObject()
  delete userObject.password
  return userObject */
  return user.toJSON();
}

export async function registerUser(name, email, password, location){
  const newUser = new User({name, email, password, location})
  await newUser.save()
  
  const {accessToken, refreshToken} = _generateTokens(newUser)

  const userObject = _getUserObject(newUser)

  return { user: userObject, accessToken, refreshToken}
}

export async function logInUser(email, password){
    const user = await User.findOne({email: email.toLowerCase()}).select(
      "+password" //gör så att man ska kunna få password
    )
  
    const response = "Invalid credentials"
  
    if(!user){
      throw new Error(response)
    }
  
    const isSamePassword = await user.isSamePassword(password)
  
    if(!isSamePassword){
      throw new Error(response)
    }
  
    const {accessToken, refreshToken} = _generateTokens(user)
    const userObject = _getUserObject(user)

    return {user: userObject, accessToken, refreshToken}
}

export async function refreshAccessToken(refreshToken) {
  const decodedToken = verifyRefreshToken(refreshToken)
  const userId = decodedToken?.userId

  if(!userId){
    throw new Error("Invalid refresh token")
  }

  const user = await getUserById(userId)

  if(!user){
    throw new Error("User not found")
  }

    const payload = { 
    userId: user._id, 
    role: user.role,
    email: user.email 
  };

  const accessToken = generateAccessToken(payload)
  return{accessToken}
}

export async function requestPassword(email = ""){
  await User.findOneAndUpdate(
    {
      email: email.toLowerCase()
    },
    {
      resetPasswordCode: `${Math.floor(Math.random() * 100000)}`
    }
  )

  return {
    message: "If the email exists, a reset code has been sent"
  }
}

export async function confirmPasswordReset( email, code, newPassword){
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordCode: code,
  })

  if(!user){
    throw new Error("Unauthorized")
  }

  user.password = newPassword
  user.resetPasswordCode = null
  await user.save()

  return{
    message: "Password has been reset"
  }
}