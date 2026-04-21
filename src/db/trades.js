import Trade, { STATUS_LEVEL } from "../models/Trade.js";
import Plant from "../models/Plant.js";

const PLANT_INFO = "name image species meetingTime coordinates available slug";
const USER_INFO = "name location slug";

export async function getAllTrades() {
  try {
    return await Trade.find()
      .populate("plantId", PLANT_INFO)
      .populate("requesterId", USER_INFO)
      .populate("ownerId", USER_INFO);
  } catch (error) {
    console.error("Unable to read from 'Trades'", error.message);
    throw error;
  }
}

export async function getTradeById(id) {
  try {
    return await Trade.findById(id)
      .populate("plantId", PLANT_INFO)
      .populate("requesterId", USER_INFO)
      .populate("ownerId", USER_INFO);
  } catch (error) {
    console.error(`Unable to read from 'Trades' for id ${id}:`, error.message);
    throw error;
  }
}

export async function getTradesByOwnerId(ownerId) {
  try {
    //Looks for Trades matching ownerId on EITHER ownerId in Trade or requesterId in Trade
    return await Trade.find({
      $or: [{ ownerId: ownerId }, { requesterId: ownerId }],
    }) 
      .sort({ updatedAt: -1 })
      .populate("plantId", PLANT_INFO)
      .populate("ownerId", USER_INFO)
      .populate("requesterId", USER_INFO);
  } catch (error) {
    console.error(`Unable to read from 'Trades' for owner ${ownerId}:`, error.message);
    throw error;
  }
}

export async function createTrade(tradeData) {
  try {
    const newTrade = new Trade({
      plantId: tradeData.plantId,
      requesterId: tradeData.requesterId,
    });

    await newTrade.save();

    return await newTrade.populate([
      { path: "plantId", select: PLANT_INFO },
      { path: "ownerId", select: USER_INFO },
      { path: "requesterId", select: USER_INFO },
    ]);
  } catch (error) {
    console.error("Unable to create 'Trade'", error.message);
    throw error;
  }
}

export async function updateTrade(id, tradeData) {
  try {
    const updatedTrade = await Trade.findById(id);
    if (!updatedTrade) return null;
    //if user tries to change status to cancelled, only allow when status is NOT completed
    if (updatedTrade.status === STATUS_LEVEL.completed) {
      throw new Error("Trade can not be cancelled if already completed");
    }
    if (tradeData.status === STATUS_LEVEL.cancelled) {
      
      // if (updatedTrade.status !== STATUS_LEVEL.pending && updatedTrade.status !== STATUS_LEVEL.approved) {
      //   throw new Error("Trade can only be cancelled if status is pending or approved");
      // }

      await Plant.findByIdAndUpdate(updatedTrade.plantId, { available: true });
      await Trade.findByIdAndDelete(id);
      return { cancelled: true };
    }

    updatedTrade.status = tradeData.status ?? updatedTrade.status;
    await updatedTrade.save();

    return await updatedTrade.populate([
      { path: "plantId", select: PLANT_INFO },
      { path: "ownerId", select: USER_INFO },
      { path: "requesterId", select: USER_INFO },
    ]);
  } catch (error) {
    console.error(`Unable to update 'Trade' for id ${id}:`, error.message);
    throw error;
  }
}

export async function deleteTrade(id) {
  try {
    const deletedTrade = await Trade.findByIdAndDelete(id);

    if (deletedTrade) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Unable to delete 'Trade'", error);
    return false;
  }
}
