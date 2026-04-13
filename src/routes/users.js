import { Router } from "express";
import { validateUpdateUser } from "../middleware/userValidation.js";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBySlug,
  updateUserBySlug,
  deleteUserBySlug,
} from "../db/users.js";


const userRouter = Router();

userRouter.get("/", async (req, res) => {
  // TODO Validation for Admin

  const { q } = req.query;

  const users = await getUsers(q);

  res.json(users);
});

// GET /users/id/:id
userRouter.get("/id/:id", async (req, res) => {
  // TODO Validation for User and Admin
  const user = await getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// GET /users/:slug
userRouter.get("/:slug", async (req, res) => {
  const user = await getUserBySlug(req.params.slug);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json(user);
});

// POST /users
userRouter.post("/", async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json(user);
});

// PUT /users/id/:id
userRouter.put("/id/:id", async (req, res) => {
  // TODO Validation for User

  const user = await updateUser(req.params.id, req.body);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
}); 

// PUT /users/:slug
userRouter.put("/:slug", validateUpdateUser, async (req, res) => {
  //kommer ha validering för user och admin

  const slug = req.params.slug;
  const { name, email, location } = req.body;

  const updatedUser = await updateUserBySlug(slug, { name, email, location })

  if (!updatedUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json(updatedUser);
});

//PATCH /users/:slug
userRouter.patch("/:slug", validateUpdateUser, async (req, res) => {
  //kommer ha validering för user och admin
  

  const slug = req.params.slug;
  const { email, name, location } = req.body;

  const updatedUser = await updateUserBySlug(slug, { email, name, location });

  if (!updatedUser) {
    return res.status(404).json({
      message: "User does not exist",
    });
  }

  return res.status(200).json(updatedUser);
});

// DELETE /users/id/:id
userRouter.delete("/id/:id", async (req, res) => {
  // TODO Validation for Admin

  const user = await deleteUser(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(204).json();
});

// DELETE /users/:slug
userRouter.delete("/:slug", async (req, res) => {
  //kommer ha validering för user och admin
  const slug = req.params.slug;
  const user = await deleteUserBySlug(slug);
  if (!user) {
    return res.status(400).json({
      message: "user does not exist",
    });
  }
  return res.status(204).json();
});

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

export default userRouter;
