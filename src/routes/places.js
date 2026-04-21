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
  validateUpdatePlace,
} from "../middleware/placeValidation.js"
import { requireAuth } from "../middleware/auth.js"

const placeRouter = Router()

// GET /places - Auth
placeRouter.get("/", requireAuth, async (req, res) => {
  try {
    const { q } = req.query
    const places = await getPlaces(q)

    return res.json(places)
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching places" });
  }
})

// POST /places - Auth
placeRouter.post("/", requireAuth, validatePlace, async (req, res) => {
  try {
    const placeData = {
      ...req.body,
    }
    const place = await createPlace(placeData)

    return res.status(201).json(place)
  } catch (error) {
    return res.status(500).json({ message: "Could not create place" });
  }
})

// PATCH /places/id/:id - Auth
placeRouter.patch("/id/:id", requireAuth, validateUpdatePlace, async (req, res) => {
  try {
    const place = await updatePlace(req.params.id, req.body)

    if (!place) {
      return res.status(404).json({ message: "Place not found" })
    }
    
    return res.status(200).json(place)
  } catch (error) {
    return res.status(500).json({ message: "Error while updating place" });
  }
})

// DELETE /places/id/:id - Auth
placeRouter.delete("/id/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const findPlace = await getPlaceById(id)

    if (!findPlace) {
      return res.status(404).json({ message: "Place not found" })
    }

    const place = await deletePlaceById(id)

    if (!place) {
      return res.status(400).json({
        message: "Could not delete place",
      })
    }

    return res.status(204).json()
  } catch (error) {
    return res.status(500).json({ message: "Error while deleting place" });
  }
});

export default placeRouter
