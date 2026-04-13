import User from "../models/User.js";
import { getFullTextSearch } from "../utils/fullTextSearch.js";

export async function getUsers(q) {
  let filter = {};

  if (q) {
    filter = {
      ...filter,
      ...getFullTextSearch(q, true, "name"),
    };
  }

  try {
    return await User.find(filter)
    .select("name email slug role location createdAt updatedAt")
    .lean()
  } catch (err) {
    console.error("Unable to find based on query in 'Users'", err);
    return [];
  }
}

export async function getUserById(id) {
  const historyPopulate = {
    populate: [
      {
        path: "plantId",
        select: "name image species meetingTime coordinates available",
      },
      { path: "ownerId", select: "name email location" },
      { path: "requesterId", select: "name email location" },
    ],
    options: { sort: { createdAt: -1 } },
  };

  try {
    return await User.findById(id)
      .select("name email slug role location createdAt updatedAt")
      .populate("plants","name image species meetingTime coordinates available")
      .populate({
        path: "_activeOwner",
        ...historyPopulate,
      })
      .populate({
        path: "_activeRequester",
        ...historyPopulate,
      })
      .populate({
        path: "_completedOwner",
        ...historyPopulate,
      })
      .populate({
        path: "_completedRequester",
        ...historyPopulate,
      })
  } catch (err) {
    console.error("Unable to read from 'Users'", err);
    return null;
  }
}

export async function getUserBySlug(slug) {
  try {
    return await User.findOne({ slug: slug })
      .select("name location").lean()
      .populate({
        path: "plants",
        match: { available: true },
      });
  } catch (err) {
    console.error("Unable to read from 'Users'", err);
  }
}

export async function updateUser(id, userData) {
  try {
    return await User.findByIdAndUpdate(id, userData, {
      new: true, // returnera den uppdaterade användaren
      runValidators: true, // kontrollera att uppdateringen följer schemat
    });
  } catch (err) {
    console.error("Error updating 'User':", err);
    throw err;
  }
}

export async function updateUserBySlug(slug, userData) {
  try {
    return await User.findOneAndUpdate({ slug: slug }, userData, { new: true });
  } catch (err) {
    console.error("Error Updating 'User':", err);
    throw err;
  }
}

export async function deleteUser(id) {
  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) return null;
    await User.deleteOne({ _id: userToDelete._id });
    return true;
  } catch (err) {
    console.error("Unable to delete 'User'", err);
    return false;
  }
}

export async function deleteUserBySlug(slug) {
  try {
    const userToDelete = await User.findOne({ slug: slug });
    if (!userToDelete) return null;
    await User.deleteOne({ _id: userToDelete._id });
    return true;
  } catch (err) {
    console.error("Unable to delete 'User'", err);
    return false;
  }
}

export async function findUserByEmail(email) {
  return await User.findOne({ email });
}
