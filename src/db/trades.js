import Trade, { STATUS_LEVEL } from "../models/Trade.js"
import Plant from "../models/Plant.js";

export async function getAllTrades() {
  try {
    return await Trade.find()
      .populate("plantId", "name image species meetingTime coordinates available")
      .populate("requesterId", "name")
      .populate("ownerId", "name")
      .populate("status");
  } catch (err) {
    console.error("Unable to read from 'Trades'", err);
  }
}

export async function getTradeById(id) {
  try {
    return await Trade.findById(id)
      .populate("plantId", "name image species meetingTime coordinates available")
      .populate("requesterId", "name")
      .populate("ownerId", "name")
      .populate("status");
  } catch (err) {
    console.error("Unable to read from 'Trades'", err);
  }
}

export async function createTrade(tradeData) {
  try {
    const newTrade = new Trade(tradeData);
    await newTrade.save();
    return await Trade.populate(newTrade, "plantId requesterId ownerId");
  } catch (err) {
    console.error("Unable to create 'Trade'", err);
  }
}

export async function updateTrade(id, tradeData) {
  try {
    const updatedTrade = await Trade.findById(id)

    if (!updatedTrade) return null
       if (tradeData.status === STATUS_LEVEL.cancelled) {
        if (updatedTrade.status !== STATUS_LEVEL.pending && updatedTrade.status !== STATUS_LEVEL.approved) {
          throw new Error("Trade can only be cancelled if status is pending")
        }
        await Plant.findByIdAndUpdate(updatedTrade.plantId, { available: true })
        await Trade.findByIdAndDelete(id)
        return { cancelled:true }
       }
      
    updatedTrade.status = tradeData.status ?? updatedTrade.status;
    await updatedTrade.save();
    // console.log("Function: updateTrade:", updateTrade);
    return await Trade.populate(updatedTrade, "plantId requesterId ownerId");
  } catch (err) {
    console.error("Unable to update 'Trade'", err)
    throw err;
  }
}

export async function deleteTrade(id) {
 try {
    const trade = await Trade.findById(id);
    if (!trade) return false; 
    
  
    return !!(await Trade.findByIdAndDelete(id));
  } catch (err) {
    console.error("Unable to delete 'Trade'", err)
    return false; 
  }
}
