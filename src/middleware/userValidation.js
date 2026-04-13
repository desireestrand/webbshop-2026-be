import { body, param, validationResult } from "express-validator"

export const validateUserResult = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

export const validateUpdateUser = [
    body("name")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Name cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("location")
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage("Location must be an array with two numbers"),
    body("location.*")
      .optional()
      .isNumeric()
      .withMessage("Location values must be numbers"),
    validateUserResult
  ]