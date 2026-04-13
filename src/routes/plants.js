import { Router } from "express";
import {
  validatePlant,
  validatePlantResult,
  validatePlantUpdate,
} from "../middleware/plantValidation.js";
import {
  createPlant,
  getPlantBySlug,
  deletePlantBySlug,
  updatePlantBySlug,
  getAvailablePlants,
  getAllPlants,
} from "../db/plants.js";

const plantRouter = Router();

// GET /plants with search
plantRouter.get("/", async (req, res) => {
  const { q } = req.query;

  const plants = await getAvailablePlants(q);

  res.json(plants);
});

// GET /plants/all with search
plantRouter.get("/all", async (req, res) => {
  const { q } = req.query;

  const plants = await getAllPlants(q);

  res.json(plants);
});

// GET /plants/:slug
plantRouter.get("/:slug", async (req, res) => {
  const slug = req.params.slug;

  const plant = await getPlantBySlug(slug);

  if (!plant) {
    return res.status(404).json({
      message: "Plant not found",
    });
  }
  res.json(plant)
})

// POST /plants
plantRouter.post("/", validatePlant, validatePlantResult, async (req, res) => {
  // TODO Validation for User and Admin
  // validatePlant, validatePlantResult,

  const plant = await createPlant(req.body);

  res.status(201).json(plant);
});

// PUT /plants/:slug
plantRouter.put("/:slug", validatePlant, validatePlantResult, async (req, res) => {
  // TODO Validation for User (owner) and Admin

  const slug = req.params.slug;
  const { name, image, species, lightLevels, coordinates, meetingTime, ownerId } = req.body;

  const updatedPlant = await updatePlantBySlug(slug, {
    name,
    image,
    species,
    lightLevels,
    coordinates,
    meetingTime,
  });

  if (!updatedPlant) {
    return res.status(404).json({
      message: "Plant does not exist",
    });
  }

  return res.status(200).json(updatedPlant);
});

// PATCH /plants/:slug
plantRouter.patch("/:slug", validatePlantUpdate, validatePlantResult, async (req, res) => {
  // TODO Validation for User (owner) and Admin
  const slug = req.params.slug
  const { ownerId, slug: bodySlug, ...updateData } = req.body

  const updatedPlant = await updatePlantBySlug(slug, updateData)

  if (!updatedPlant) {
    return res.status(404).json({
      message: "Plant does not exist",
    })
  }

  return res.status(200).json(updatedPlant)
})

// DELETE /plants/:slug
plantRouter.delete("/:slug", async (req, res) => {
  // TODO Validation for User (owner) and Admin

  const slug = req.params.slug;

  const plant = await deletePlantBySlug(slug);

  if (!plant) {
    return res.status(400).json({
      message: "Plant does not exist",
    });
  }
  
  return res.status(204).json();
});

export default plantRouter;
