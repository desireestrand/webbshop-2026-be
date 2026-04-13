import { Router } from "express";
import {
  getAllTrades,
  getTradeById,
  createTrade,
  deleteTrade,
  updateTrade,
} from "../db/trades.js";
import { validateCreateTrade, validateIdParam, validateUpdateTradeStatus } from "../middleware/tradeValidation.js";

const tradeRouter = Router();

// GET /trades
tradeRouter.get("/", async (req, res) => {
  // TODO Validation for Admin
  const trades = await getAllTrades();

  res.json(trades);
});

// GET /trades/:id
tradeRouter.get("/:id", validateIdParam, async (req, res) => {
  // TODO Validation for Admin

  const id = req.params.id;
  const trade = await getTradeById(id);

  if (!trade) {
    return res.status(404).json({
      message: "Trade not found",
    });
  }

  res.json(trade);
});

// TODO GET /trades/mine
// TODO Validation for User and Admin

// POST /trades
tradeRouter.post("/", validateCreateTrade, async (req, res) => {
  // TODO Validation for User (ownerId !== requesterId) and Admin
  const { plantId, requesterId } = req.body;

  const trade = await createTrade({ plantId, requesterId });

  res.status(201).json(trade);
});

// TODO PATCH /trades/:id/status
tradeRouter.patch("/:id/status", validateUpdateTradeStatus, async (req, res) => {
  // TODO Validation for User (owner) and Admin
  try {
    const id = req.params.id;
    const status = req.body.status;

    const updatedTrade = await updateTrade(id, { status })

    if (!updatedTrade) {
      return res.status(404).json({
        message: "Trade does not exist",
      });
    }

    return res.status(200).json(updatedTrade)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

// DELETE /trades/:id
tradeRouter.delete("/:id", validateIdParam, async (req, res) => {
  // TODO Validation for User (requester) and Admin

  const id = req.params.id;

  const deleted = await deleteTrade(id);

  if (!deleted) {
    return res.status(404).json({
      message: "Trade does not exist",
    });
  }

  return res.status(204).json();
});

export default tradeRouter;
