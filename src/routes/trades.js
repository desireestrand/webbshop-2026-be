import { Router } from "express";
import {
  getAllTrades,
  getTradeById,
  createTrade,
  deleteTrade,
  updateTrade,
  getTradesByOwnerId,
} from "../db/trades.js";
import {
  validateCreateTrade,
  validateIdParam,
  validateUpdateTradeStatus,
} from "../middleware/tradeValidation.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const tradeRouter = Router();

// GET /trades - Admin
tradeRouter.get("/", requireAuth, /* requireAdmin */ async (req, res) => {
  try {
    const trades = await getAllTrades();
    return res.json(trades);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching trades" });
  }
});

// GET /trades/mine - Current user
tradeRouter.get("/mine", requireAuth, async (req, res) => {
  try {
    const myTrades = await getTradesByOwnerId(req.userId);

    if (!myTrades || myTrades.length === 0) {
      return res.status(404).json({
        message: "No trades found",
      });
    }

    return res.json(myTrades);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching your trades" });
  }
});

// GET /trades/:id - Admin
tradeRouter.get("/:id", requireAuth, /* requireAdmin */ validateIdParam, async (req, res) => {
  try {
    const id = req.params.id;
    const trade = await getTradeById(id);

    if (!trade) {
      return res.status(404).json({
        message: "Trade not found",
      });
    }

    return res.json(trade);
  } catch (error) {
    res.status(500).json({ message: "Error while fetching the trade" });
  }
});

// POST /trades - Auth
tradeRouter.post("/", requireAuth, validateCreateTrade, async (req, res) => {
  try {
    const requesterId = req.userId;
    const { plantId } = req.body;

    const trade = await createTrade({ plantId, requesterId });

    return res.status(201).json(trade);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not create trade" });
  }
});

// PATCH /trades/:id/status - Owner, Requester or Admin
tradeRouter.patch("/:id/status", requireAuth, validateUpdateTradeStatus, async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    const trade = await getTradeById(id);

    if (!trade) {
      return res.status(404).json({
        message: "Trade not found",
      });
    }

    // Check if user is a part of the trade or admin
    if (trade.ownerId._id.toString() !== req.userId && trade.requesterId._id.toString() !== req.userId /* && req.userRole !== "admin" */) {
      return res.status(403).json({ message: "Not allowed to update trade status" });
    }

    // Makes requester only able to cancel trade
    if (trade.requesterId._id.toString() === req.userId && status !== "cancelled") {
      return res.status(403).json({ message: "Requester can only cancel trades" });
    }

    const updatedTrade = await updateTrade(id, { status });

    if (updatedTrade.cancelled) {
      return res.status(200).json({ message: "Trade cancelled and deleted" });
    }

    return res.status(200).json(updatedTrade);
  } catch (error) {
    return res.status(500).json({ message: "Error while updating trade status" });
  }
});

export default tradeRouter;

// Replaced by cancelled logic
// DELETE /trades/:id - Owner or Admin
/* tradeRouter.delete("/:id", requireAuth,  validateIdParam, async (req, res) => {
  const id = req.params.id

  const trade = await getTradeById(id)

    if(!trade){
      return res.status(404).json({
        message: "Trade not found",
      });
    }

  if (trade.ownerId._id.toString() !== req.userId && trade.requesterId._id.toString() !== req.userId) { //&& req.userRole !== "admin"
    return res.status(403).json({ message: "Not allowed to delete trade" })
  } 

  const deleted = await deleteTrade(id);

  if (!deleted) {
    return res.status(404).json({
      message: "Trade does not exist",
    })
  }

  return res.status(204).json()
}) */