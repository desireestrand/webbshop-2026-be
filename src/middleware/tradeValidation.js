import { body, param, validationResult } from "express-validator";
import { STATUS_LEVEL } from "../models/Trade.js";

export const validateTradeResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateCreateTrade = [
  body("plantId").isMongoId().withMessage("A valid plantId is required"),
  body("requesterId").isMongoId().withMessage("A valid requesterId is required"),
  validateTradeResult
];

export const validateUpdateTradeStatus = [
  param("id").isMongoId().withMessage("Invalid trade ID"),
  body("status").notEmpty().isIn(STATUS_LEVEL).withMessage("Status must be one of: pending, accepted, rejected, completed"),
  validateTradeResult
];

export const validateIdParam = [
  param("id").isMongoId().withMessage("Invalid trade ID"),
  validateTradeResult
];