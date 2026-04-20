import User from "../models/User.js";
import Plant from "../models/Plant.js";
import Trade from "../models/Trade.js";
import { getFullTextSearch } from "../utils/fullTextSearch.js";

const USER_INFO = "name email slug role location createdAt updatedAt";
const PLANT_INFO = "name image species meetingTime coordinates available slug";
const TRADE_USER_INFO = "name email location slug";

const HISTORY_INFO = [
  { path: "plantId", select: PLANT_INFO },
  { path: "ownerId", select: TRADE_USER_INFO },
  { path: "requesterId", select: TRADE_USER_INFO },
];

export async function getUsers(q) {
  try {
    let filter = {};
    if (q) {
      filter = {
        ...filter,
        ...getFullTextSearch(q, true, "name"),
      };
    }

    return await User.find(filter).select(USER_INFO);
  } catch (error) {
    console.error("Unable to read from 'Users'", error.message);
    throw error;
  }
}

export async function getUserById(id) {
  try {
    return await User.findById(id)
      .select(USER_INFO)
      .populate("plants", PLANT_INFO)
      .populate({ path: "_activeOwner", populate: HISTORY_INFO })
      .populate({ path: "_activeRequester", populate: HISTORY_INFO })
      .populate({ path: "_completedOwner", populate: HISTORY_INFO })
      .populate({ path: "_completedRequester", populate: HISTORY_INFO });
  } catch (error) {
    console.error(`Unable to read from 'Users' for id ${id}:`, error.message);
    throw error;
  }
}

export async function getUserBySlug(slug) {
  try {
    return await User.findOne({ slug })
      .select("name location slug")
      .populate({
        path: "plants",
        match: { available: true },
        select: PLANT_INFO,
      });
  } catch (error) {
    console.error(`Unable to read from 'Users' for slug ${slug}:`, error.message);
    throw error;
  }
}

export async function updateUser(id, userData) {
  try {
    return await User.findByIdAndUpdate(id, userData, {
      new: true, // returnera den uppdaterade användaren
      runValidators: true, // kontrollera att uppdateringen följer schemat
    }).select(USER_INFO);
  } catch (error) {
    console.error(`Error updating 'User' for id ${id}:`, error.message);
    throw error;
  }
}

export async function updateUserBySlug(slug, userData) {
  try {
    return await User.findOneAndUpdate({ slug }, userData, {
      new: true,
      runValidators: true,
    }).select(USER_INFO);
  } catch (error) {
    console.error(`Error Updating 'User' for slug ${slug}:`, error.message);
    throw error;
  }
}

async function performCascadeDelete(userId) {
  // 1. Återställ plantor från aktiva trades där användaren var requester
  const requesterTrades = await Trade.find({
    requesterId: userId,
    status: { $in: ["pending", "approved"] },
  });

  for (const trade of requesterTrades) {
    await Plant.findByIdAndUpdate(trade.plantId, { available: true });
  }

  // 2. Radera alla trades kopplade till användaren
  await Trade.deleteMany({
    $or: [{ requesterId: userId }, { ownerId: userId }],
  });

  // 3. Radera alla plantor användaren ägde
  await Plant.deleteMany({ ownerId: userId });

  // 4. Radera användaren
  return await User.deleteOne({ _id: userId });
}

export async function deleteUser(id) {
  try {
    const user = await User.findById(id);
    if (!user) return null;

    await performCascadeDelete(user._id);

    return true;
  } catch (error) {
    console.error(`Unable to delete 'User' with id ${id}:`, error.message);
    throw error;
  }
}

export async function deleteUserBySlug(slug) {
  try {
    const user = await User.findOne({ slug });
    if (!user) return null;

    await performCascadeDelete(user._id);
    return true;
  } catch (error) {
    console.error(`Unable to delete 'User' with slug ${slug}:`, error.message);
    throw error;
  }
}

export async function findUserByEmail(email) {
  return await User.findOne({ email }).select("+password");
}
