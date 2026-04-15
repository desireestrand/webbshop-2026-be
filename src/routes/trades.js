import { Router } from "express"
import {
  getAllTrades,
  getTradeById,
  createTrade,
  deleteTrade,
  updateTrade,
  getTradesByOwnerId,
} from "../db/trades.js"
import {
  validateCreateTrade,
  validateIdParam,
  validateUpdateTradeStatus,
} from "../middleware/tradeValidation.js"
import { requireAdmin, requireAuth } from "../middleware/auth.js"

const tradeRouter = Router()

// GET /trades
tradeRouter.get("/", requireAuth, requireAdmin, async (req, res) => {
  // TODO Validation for Admin
  const trades = await getAllTrades()

  res.json(trades)
})

// GET /trades/mine
tradeRouter.get("/mine", requireAuth, async (req, res) => {
  const myTrades = await getTradesByOwnerId(req.userId)

  if (!myTrades) {
    return res.status(404).json({
      message: "Your trades not found",
    })
  }

  res.json(myTrades)
})

// GET /trades/:id
tradeRouter.get("/:id", requireAuth, requireAdmin, validateIdParam, async (req, res) => {
  // TODO Validation for Admin

  const id = req.params.id
  const trade = await getTradeById(id)

  if (!trade) {
    return res.status(404).json({
      message: "Trade not found",
    })
  }

  res.json(trade)
})

// POST /trades
tradeRouter.post("/", requireAuth, validateCreateTrade, async (req, res) => {
  // TODO Validation for User (ownerId !== requesterId) and Admin
  const requesterId = req.userId
  const { plantId } = req.body;

  const trade = await createTrade({ plantId, requesterId })

  res.status(201).json(trade)
})

// TODO PATCH /trades/:id/status
tradeRouter.patch("/:id/status", requireAuth, validateUpdateTradeStatus, async (req, res) => {
  // TODO Validation for User (owner) and Admin
  try {
    const id = req.params.id;
    const status = req.body.status;
    
    const trade = await getTradeById(id)
    
    if(!trade){
      return res.status(404).json({
        message: "Trade not found",
      });
    }
    
    // Kontrollera att användaren är en del av trade
    if (trade.ownerId._id.toString() !== req.userId && trade.requesterId._id.toString() !== req.userId ) {
      return res.status(403).json({ message: "Not allowed to update trade" })
    }
    
    //Gör så att requestaren bara kan uppdatera till cancelled
    if(trade.requesterId._id.toString() === req.userId && status !== "cancelled"){
      return res.status(403).json({ message: "Not allowed to update trade" })
    }
    const updatedTrade = await updateTrade(id, { status })

    if (!updatedTrade) {
      return res.status(404).json({
      message: "Trade does not exist",
     });
    } 
    return res.status(200).json(updatedTrade)
  }catch (err) {
      return res.status(400).json({ message: err.message })
    }
})

// DELETE /trades/:id
tradeRouter.delete("/:id", requireAuth, validateIdParam, async (req, res) => {
  // TODO Validation for User (requester) and Admin

  const id = req.params.id

  const trade = await getTradeById(id)

    if(!trade){
      return res.status(404).json({
        message: "Trade not found",
      });
    }

  // Kontrollera att användaren äger trade
  if (trade.ownerId._id.toString() !== req.userId && trade.requesterId._id.toString() !== req.userId) {
    return res.status(403).json({ message: "Not allowed to delete trade" })
  }

  const deleted = await deleteTrade(id);

  if (!deleted) {
    return res.status(404).json({
      message: "Trade does not exist",
    })
  }

  return res.status(204).json()
})

export default tradeRouter
