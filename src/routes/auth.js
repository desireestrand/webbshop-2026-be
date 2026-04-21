import { Router } from "express"
import {
  validateRegister,
  validateAuthResult,
  validateLogin,
  validateResetPassword,
} from "../middleware/authValidation.js"
import { updateUser, deleteUser } from "../db/users.js"
import {
  confirmPasswordReset,
  findUserByEmail,
  getAllOfMe,
  logInUser,
  refreshAccessToken,
  registerUser,
  requestPassword,
} from "../db/auth.js"
import { verifyRefreshToken } from "../utils/tokens.js"
import { validateUpdateUser } from "../middleware/userValidation.js"
import { requireAdmin, requireAuth } from "../middleware/auth.js"

const authRouter = Router()

// GET /auth/me - Current user
authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await getAllOfMe(req.userId)

    if (!user) {
      return res.status(404).json({ message: "Profile not found" })
    }

    return res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Error while fetching your profile" })
  }
})

// PATCH /auth/me - Current user
authRouter.patch("/me", requireAuth, validateUpdateUser, async (req, res) => {
  try {
    const userId = req.userId
    const { name, email, location } = req.body

    const updatedUser = await updateUser(userId, { name, email, location })

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    return res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({ message: "Could not update profile" });
  }
})

// DELETE /auth/me - Current user
authRouter.delete("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.userId
    const deleted = await deleteUser(userId)

    if (!deleted) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    return res.status(204).json();
  } catch (error) {
    res.status(500).json({ message: "Error while deleting account" });
  }
})

// POST /auth/register
authRouter.post("/register", validateRegister, validateAuthResult, async (req, res) => {
  try {
    const { name, email, password, location } = req.body

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" })
    }

    // Returns user, accessToken and refreshToken based on registered User
    const { user, accessToken, refreshToken } = await registerUser(
      name,
      email,
      password,
      location,
    )

    return res.status(201).json({ accessToken, refreshToken })
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
});

// POST /auth/login
authRouter.post("/login", validateLogin, validateAuthResult, async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Returns user, accessToken and refreshToken based on logged in User
    const { user, accessToken, refreshToken } = await logInUser(
      email,
      password,
    )

    return res.json({ accessToken, refreshToken })
  } catch (error) {
    return res.status(401).json({ message: "Invalid credentials" })
  }
})

// POST /auth/refresh
authRouter.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token is required" })

  try {
    const decodedToken = verifyRefreshToken(refreshToken)
    const userId = decodedToken?.userId

    if (!userId) {
      throw new Error()
    }

    const { accessToken } = await refreshAccessToken(refreshToken)

    return res.json({ accessToken })
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    })
  }
})

authRouter.post("/reset-password/request", async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    })
  }

  const result = await requestPassword(email)

  return res.json(result)
})

authRouter.patch("/reset-password/confirm", validateResetPassword, validateAuthResult, async (req, res) => {
  const { email, code } = req.query

  if (!email || !code) {
    return res.status(400).json({
      message: "Email and Code query params is required",
    })
  }

  const { password } = req.body

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    })
  }

  try {
    const result = await confirmPasswordReset(email, code, password)
    return res.json(result)
  } catch (error) {
    return res.status(401).json({
      message: "Unable to reset password",
    })
  }
})

export default authRouter
