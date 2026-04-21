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
    console.error(
      `Unable to read from 'Users' for slug ${slug}:`,
      error.message,
    );
    throw error;
  }
}

export async function updateUser(id, userData) {
  try {
    return await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    }).select(USER_INFO);
  } catch (error) {
    console.error(`Error updating 'User' for id ${id}:`, error.message);
    throw error;
  }
}

// Replaced by PATCH /auth/me
/* export async function updateUserBySlug(slug, userData) {
  try {
    return await User.findOneAndUpdate({ slug }, userData, {
      new: true,
      runValidators: true,
    }).select(USER_INFO);
  } catch (error) {
    console.error(`Error Updating 'User' for slug ${slug}:`, error.message);
    throw error;
  }
} */

export async function deleteUser(id) {
  try {
    const user = await User.findById(id);
    if (!user) return null;

    // 1. Restore plants from active trades where user was requester
    const requesterTrades = await Trade.find({
      requesterId: user._id,
      status: { $in: ["pending", "approved"] },
    });

    for (const trade of requesterTrades) {
      await Plant.findByIdAndUpdate(trade.plantId, { available: true });
    }

    // 2. Delete all trades connected to user
    await Trade.deleteMany({
      $or: [{ requesterId: user._id }, { ownerId: user._id }],
    });

    // 3. Delete all plants owned by user
    await Plant.deleteMany({ ownerId: user._id });

    // 4. Delete user
    return await User.deleteOne({ _id: user._id });

    return true;
  } catch (error) {
    console.error(`Unable to delete 'User' with id ${id}:`, error.message);
    throw error;
  }
}

// Replaced by DELETE /auth/me
// export async function deleteUserBySlug(slug) {
//   try {
//     const user = await User.findOne({ slug });
//     if (!user) return null;

//     await performCascadeDelete(user._id);
//     return true;
//   } catch (error) {
//     console.error(`Unable to delete 'User' with slug ${slug}:`, error.message);
//     throw error;
//   }
// }