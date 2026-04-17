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

const placeRouter = Router()

placeRouter.get("/", async (req, res) => {
  const { q } = req.query

  const places = await getPlaces(q)

  res.json(places)
})

placeRouter.post("/", validatePlace, validatePlaceResult, async (req, res) => {
  const placeData = {
    ...req.body,
  }

  const place = await createPlace(placeData)

  res.status(201).json(place)
})

placeRouter.patch(
  "/id/:id",
  validateUpdatePlace,
  validatePlaceResult,
  async (req, res) => {
    const place = await updatePlace(req.params.id, req.body)

    if (!place) {
      return res.status(404).json({ message: "Place not found" })
    }

    res.status(200).json(place)
  },
)

placeRouter.delete("/id/:id", async (req, res) => {
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
