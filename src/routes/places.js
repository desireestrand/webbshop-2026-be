import { Router } from "express"
import {
  createPlace,
  deletePlaceById,
  getPlaceById,
  getPlaces,
  updatePlace,
} from "../db/places.js"
import {
  validatePlace,
  validatePlaceResult,
  validateUpdatePlace,
} from "../middleware/placeValidation.js"
import { requireAuth } from "../middleware/auth.js"

const placeRouter = Router()

// GET /places - Auth
placeRouter.get("/", requireAuth, async (req, res) => {
  const { q } = req.query

  const places = await getPlaces(q)

  res.json(places)
})

// POST /places - Auth
placeRouter.post("/", requireAuth, validatePlace, validatePlaceResult, async (req, res) => {
  const placeData = {
    ...req.body,
  }

  const place = await createPlace(placeData)

  res.status(201).json(place)
})

// PATCH /places/id/:id - Auth
placeRouter.patch("/id/:id", requireAuth, validateUpdatePlace, validatePlaceResult, async (req, res) => {
  const place = await updatePlace(req.params.id, req.body)

  if (!place) {
    return res.status(404).json({ message: "Place not found" })
  }

  res.status(200).json(place)
})

// DELETE /places/id/:id - Auth
placeRouter.delete("/id/:id", requireAuth, async (req, res) => {
  const { id } = req.params
  console.log("sees id as: ", id)

  const findPlace = await getPlaceById(id)
  console.log("sees findPlace as: ", findPlace)

  if (!findPlace) {
    return res.status(404).json({ message: "Place not found" })
  }

  const place = await deletePlaceById(id)

  if (!place) {
    return res.status(400).json({
      message: "Place does not exist",
    })
  }

  return res.status(204).json()
})

export default placeRouter
