import { Router } from "express";
import { validateUpdateUser } from "../middleware/userValidation.js";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBySlug,
  /* updateUserBySlug, */
  /*deleteUserBySlug,*/
} from "../db/users.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const userRouter = Router();

// GET /users - Admin
userRouter.get("/", requireAuth, /* requireAdmin */ async (req, res) => {
  try {
    const { q } = req.query;
    const users = await getUsers(q);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching users" });
  }
});

// GET /users/id/:id - Admin
userRouter.get("/id/:id", requireAuth, /* requireAdmin */ async (req, res) => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching the user" });
  }
});

// GET /users/:slug - Auth
userRouter.get("/:slug", requireAuth, async (req, res) => {
  try {
    const user = await getUserBySlug(req.params.slug);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching the user" });
  }
});

// PATCH /users/id/:id - Admin
userRouter.patch("/id/:id", requireAuth, /* requireAdmin */ validateUpdateUser, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user._id.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Not allowed to update this user" });
    }

    const updatedUser = await updateUser(id, req.body);

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "Error while updating user" });
  }
});

// DELETE /users/id/:id - Admin
userRouter.delete("/id/:id", requireAuth, /* requireAdmin */ async (req, res) => {
  try {
    const id = req.params.id;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user._id.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Not allowed to delete this user" });
    }

    const deletedUser = await deleteUser(id);

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ message: "Error while deleting user" });
  }
});

export default userRouter;

/* // PUT /users/id/:id
userRouter.put(
  "/id/:id",
  requireAuth, requireAdmin, validateUpdateUser,
  async (req, res) => {
    const id = req.params.id;

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user._id.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not allowed to update this user" });
    }

    const updatedUser = await updateUser(id, req.body);

    return res.status(200).json(updatedUser);
  },
); */

/* // PUT /users/:slug
userRouter.put("/:slug", requireAuth, validateUpdateUser, async (req, res) => {
  const slug = req.params.slug;

  const user = await getUserBySlug(slug);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  if (user._id.toString() !== req.userId) {
    return res.status(403).json({ message: "Not allowed to update this user" });
  }

  const { name, email, location } = req.body;

  const updatedUser = await updateUserBySlug(slug, { name, email, location });

  if (!updatedUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json(updatedUser);
}); */

// Replaced by PATCH /auth/me
/* // PATCH /users/:slug
userRouter.patch(
  "/:slug",
  requireAuth,
  validateUpdateUser,
  async (req, res) => {
    const slug = req.params.slug;
    const user = await getUserBySlug(slug);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user._id.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not allowed to update this user" });
    }

    const { name, email, location } = req.body;

    const updatedUser = await updateUserBySlug(slug, { name, email, location });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(updatedUser);
  },
); */

// Replaced by DELETE /auth/me
/* // DELETE /users/:slug
userRouter.delete("/:slug", requireAuth, async (req, res) => {
  const slug = req.params.slug;

  const user = await getUserBySlug(slug);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  if (user._id.toString() !== req.userId) {
    return res.status(403).json({ message: "Not allowed to delete this user" });
  }

  const deletedUser = await deleteUserBySlug(slug);
  if (!deletedUser) {
    return res.status(400).json({
      message: "User does not exist",
    });
  }
  return res.status(204).json();
}); */
