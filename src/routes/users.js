import { Router } from "express"
import { validateUpdateUser } from "../middleware/userValidation.js"
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBySlug,
  updateUserBySlug,
  deleteUserBySlug,
} from "../db/users.js"
import { requireAuth, requireAdmin } from "../middleware/auth.js"

const userRouter = Router()

userRouter.get("/", requireAuth, /*requireAdmin*/ async (req, res) => {
  const { q } = req.query

    const users = await getUsers(q)

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    res.json(users)
  },
)

// GET /users/id/:id
userRouter.get("/id/:id", requireAuth, /*requireAdmin*/ async (req, res) => {
  const user = await getUserById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  },
)

// GET /users/:slug
userRouter.get("/:slug", requireAuth, async (req, res) => {
  const user = await getUserBySlug(req.params.slug)

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    res.json(user)
  },
)

// POST /users
userRouter.post("/", requireAuth, async (req, res) => {
  const user = await createUser(req.body)
  res.status(201).json(user)
})

// PUT /users/id/:id
userRouter.put("/id/:id", requireAuth, /*requireAdmin*/ validateUpdateUser, async (req, res) => {
  const id = req.params.id

  const user = await getUserById(id)
  if(!user){
      return res.status(404).json({
        message: "User not found",
      })
  }
  if (user._id.toString() !== req.userId ) {
    return res
      .status(403)
      .json({ message: "Not allowed to update this user" });
  }
  const updatedUser = await updateUser(id, req.body)

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(updatedUser)
  },
)

// PUT /users/:slug
userRouter.put("/:slug", requireAuth, validateUpdateUser, async (req, res) => {
  const slug = req.params.slug

  const user = await getUserBySlug(slug)
  if(!user){
      return res.status(404).json({
        message: "User not found",
      })
  }
  if (user._id.toString() !== req.userId ) {
    return res
      .status(403)
      .json({ message: "Not allowed to update this user" });
  }

  const { name, email, location } = req.body

    const updatedUser = await updateUserBySlug(slug, { name, email, location })

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    return res.status(200).json(updatedUser)
  },
)

//PATCH /users/id/:id
userRouter.patch("/id/:id", requireAuth, /*requireAdmin*/ validateUpdateUser, async (req, res) => {

  const id = req.params.id

  const user = await getUserById(id)
  if(!user){
    return res.status(404).json({
      message: "User not found",
    })
  }
  if (user._id.toString() !== req.userId ) {
    return res
      .status(403)
      .json({ message: "Not allowed to update this user" });
  }
  const updatedUser = await updateUser(id, req.body)

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(updatedUser)
  },
)

// PATCH /users/:slug
userRouter.patch("/:slug", requireAuth, validateUpdateUser, async (req, res) => {
  const slug = req.params.slug

  const user = await getUserBySlug(slug)
  if(!user){
      return res.status(404).json({
        message: "User not found",
      })
  }
  if (user._id.toString() !== req.userId ) {
    return res
      .status(403)
      .json({ message: "Not allowed to update this user" });
  }

  const { name, email, location } = req.body

  const updatedUser = await updateUserBySlug(slug, { name, email, location })

  if (!updatedUser) {
    return res.status(404).json({
      message: "User not found",
    })
  }

  return res.status(200).json(updatedUser)
})

// DELETE /users/id/:id
userRouter.delete("/id/:id", requireAuth, /*requireAdmin*/ async (req, res) => {
  const id = req.params.id

  const user = await getUserById(id)

  if(!user){
    return res.status(404).json({
      message: "User not found",
    })
  }
  if (user._id.toString() !== req.userId ) {
    return res
      .status(403)
      .json({ message: "Not allowed to delete this user" });
  }

  const deletedUser = await deleteUser(id)

  if (!deletedUser) {
    return res.status(404).json({ message: "User not found" })
  }

  res.status(204).json()
})

// DELETE /users/:slug
userRouter.delete("/:slug", requireAuth, async (req, res) => {
  const slug = req.params.slug
  const user = await deleteUserBySlug(slug)
  if (!user) {
    return res.status(400).json({
      message: "User does not exist",
    })
  }
  return res.status(204).json()
})

// userRouter.put("/:id", async (req, res) => {
//   const user = await updateUser(req.params.id, req.body)
//   if (!user) return res.status(404).json({ message: "User not found" })
//   res.json(user)
// })

// userRouter.patch("/:id", async (req, res) => {
//   const id = req.params.id
//   const updateData = req.body

//   const updatedUser = await updateUser(id, updateData)

//   if (!updatedUser) {
//     return res.status(404).json({
//       message: "User does not exist",
//     })
//   }

//   return res.status(200).json(updatedUser)
// })

// userRouter.delete("/:id", async (req, res) => {
//   const user = await deleteUser(req.params.id)
//   if (!user) return res.status(404).json({ message: "User not found" })
//   res.status(204).json()
// })

export default userRouter
