import { body, validationResult } from "express-validator";
import { LIGHT_LEVELS } from "../models/Plant.js";

export function validatePlantResult(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return res.status(400).json({
    errors: formattedErrors,
  });
}

const plantRules = () => [
  body("name").notEmpty().withMessage("Name is required"),
  body("image").notEmpty().withMessage("Image is required"),
  body("species").notEmpty().withMessage("Species is required"),
  body("lightLevels")
    .notEmpty()
    .isIn([
      LIGHT_LEVELS.low,
      LIGHT_LEVELS.partial,
      LIGHT_LEVELS.bright,
      LIGHT_LEVELS.directSun,
    ])
    .withMessage("Light Levels must be one of: low, partial, bright, direct sun"),
  body("coordinates")
    .notEmpty()
    .withMessage("Coordinates are required")
    .isArray({ min: 2, max: 2 })
    .withMessage("Array has to contain two elements"),
  body("meetingTime")
    .notEmpty()
    .withMessage("Meeting time is required")
    .isISO8601()
    .withMessage("Must be a valid ISO8601 date")
    .toDate()
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error("Meeting time cannot be in the past");
      }
      
      return true;
    }),
];

export const validatePlant = [...plantRules(), validatePlantResult];

export const validatePlantUpdate = [
  ...plantRules().map((rule) => rule.optional()),
  validatePlantResult,
];
