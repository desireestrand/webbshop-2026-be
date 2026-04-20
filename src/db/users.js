import User from "../models/User.js"
import Plant from "../models/Plant.js"
import Trade from "../models/Trade.js"
import { getFullTextSearch } from "../utils/fullTextSearch.js"

export async function getUsers(q) {
  let filter = {}

  if (q) {
    filter = {
      ...filter,
      ...getFullTextSearch(q, true, "name"),
    }
  }

  try {
    return await User.find(filter)
      .select("name email slug role location createdAt updatedAt")
      .lean()
  } catch (err) {
    console.error("Unable to find based on query in 'Users'", err)
    return []
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
  }

  try {
    return await User.findById(id)
      .select("name email slug role location createdAt updatedAt")
      .populate(
        "plants",
        "name image species meetingTime coordinates available",
      )
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
    console.error("Unable to read from 'Users'", err)
    return null
  }
}

export async function getUserBySlug(slug) {
  try {
    return await User.findOne({ slug: slug })
      .select("name location")
      .lean()
      .populate({
        path: "plants",
        match: { available: true },
      })
  } catch (err) {
    console.error("Unable to read from 'Users'", err)
  }
}

export async function updateUser(id, userData) {
  try {
    return await User.findByIdAndUpdate(id, userData, {
      new: true, // returnera den uppdaterade användaren
      runValidators: true, // kontrollera att uppdateringen följer schemat
    })
      .select("name email location")
      .lean()
  } catch (err) {
    console.error("Error updating 'User':", err)
    throw err
  }
}

export async function updateUserBySlug(slug, userData) {
  try {
    return await User.findOneAndUpdate({ slug: slug }, userData, { new: true })
  } catch (err) {
    console.error("Error Updating 'User':", err)
    throw err
  }
}

export async function deleteUser(id) {
  try {
    const userToDelete = await User.findById(id)
    if (!userToDelete) return null

    // Delete trades where user is requester and set plant back to available
    const requesterTrades = await Trade.find({ requesterId: id })
    for (const trade of requesterTrades) {
      if (trade.status === "pending" || trade.status === "approved") {
        await Plant.findByIdAndUpdate(trade.plantId, { available: true })
      }
      await Trade.deleteOne({ _id: trade._id })
    }

    // Delete trades and plants where user is owner
    const ownerTrades = await Trade.find({ ownerId: id })
    for (const trade of ownerTrades) {
      await Trade.deleteOne({ _id: trade._id })
    }
    await Plant.deleteMany({ ownerId: id })

    // Delete User
    await User.deleteOne({ _id: userToDelete._id })
    return true
  } catch (err) {
    console.error("Unable to delete 'User'", err)
    return false
  }
}

export async function deleteUserBySlug(slug) {
  try {
    const userToDelete = await User.findOne({ slug: slug })
    if (!userToDelete) return null

    const id = userToDelete._id

    // Delete trades where user is requester and set plant back to available
    const requesterTrades = await Trade.find({ requesterId: id })
    for (const trade of requesterTrades) {
      if (trade.status === "pending" || trade.status === "approved") {
        await Plant.findByIdAndUpdate(trade.plantId, { available: true })
      }
      await Trade.deleteOne({ _id: trade._id })
    }

    // Delete trades and plants where user is owner
    const ownerTrades = await Trade.find({ ownerId: id })
    for (const trade of ownerTrades) {
      await Trade.deleteOne({ _id: trade._id })
    }
    await Plant.deleteMany({ ownerId: id })

    // Delete user
    await User.deleteOne({ _id: userToDelete._id })
    return true
  } catch (err) {
    console.error("Unable to delete 'User'", err)
    return false
  }
}

export async function findUserByEmail(email) {
  return await User.findOne({ email })
}
