import { body, validationResult } from "express-validator"

const placeRules = () => [
  body("city").notEmpty().withMessage("City is required"),
  body("placeName").notEmpty().withMessage("placeName is required"),
  body("coordinates")
    .notEmpty()
    .withMessage("Coordinates are required")
    .isArray({ min: 2, max: 2 })
    .withMessage("Array has to contain two elements"),
]

export const validatePlace = placeRules()

const updatePlaceRules = () => [
  body("city").optional().notEmpty().withMessage("City is required"),
  body("placeName").optional().notEmpty().withMessage("placeName is required"),
  body("coordinates")
    .optional()
    .notEmpty()
    .withMessage("Coordinates are required")
    .isArray({ min: 2, max: 2 })
    .withMessage("Array has to contain two elements"),
]
export const validateUpdatePlace = updatePlaceRules()

//needed to print out the errors
export function validatePlaceResult(req, res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

  const formattedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }))

  return res.status(400).json({
    errors: formattedErrors,
  })
}
