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
import { requireAuth } from "../middleware/auth.js";

const plantRouter = Router();

// GET /plants with search
plantRouter.get("/", async (req, res) => {
  const { q } = req.query;

  const plants = await getAvailablePlants(q);

  res.json(plants);
});

// GET /plants/all with search
//requireAuth
plantRouter.get("/all", requireAuth, async (req, res) => {
  const { q } = req.query;

  const plants = await getAllPlants(q);

  res.json(plants);
});

// GET /plants/:slug
plantRouter.get("/:slug", requireAuth, async (req, res) => {
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
plantRouter.post("/", requireAuth, validatePlant, validatePlantResult, async (req, res) => {
  const plantData = {
    ...req.body,
    ownerId: req.userId 
  };

  const plant = await createPlant(plantData);

  res.status(201).json(plant);
});

// PUT /plants/:slug
plantRouter.put("/:slug", requireAuth, validatePlant, validatePlantResult,
  async (req, res) => {
  // TODO Validation for Admin
  const slug = req.params.slug;

  const plant = await getPlantBySlug(slug);

   if(!plant){
      return res.status(404).json({ message: "Plant not found" })
  }

  // Kontrollera att användaren äger plantan
  if (plant.ownerId._id.toString() !== req.userId) {
    return res.status(403).json({ message: "Not allowed to update this plant" })
  }

  const { name, image, species, lightLevels, coordinates, meetingTime } = req.body;

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
plantRouter.patch("/:slug", requireAuth, validatePlantUpdate, validatePlantResult, async (req, res) => {
  // TODO Validation for User (owner) and Admin
  const slug = req.params.slug

  const plant = await getPlantBySlug(slug);

   if(!plant){
      return res.status(404).json({ message: "Plant not found" })
  }

  // Kontrollera att användaren äger plantan
  if (plant.ownerId._id.toString() !== req.userId) {
    return res.status(403).json({ message: "Not allowed to update this plant" })
  }

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
plantRouter.delete("/:slug", requireAuth, async (req, res) => {
  // TODO Validation for User (owner) and Admin

  const slug = req.params.slug;

  const findPlant = await getPlantBySlug(slug);
  
  if(!findPlant){
    return res.status(404).json({ message: "Plant not found" })
  }
  
  // Kontrollera att användaren äger plantan
  if (findPlant.ownerId._id.toString() !== req.userId) {
    return res.status(403).json({ message: "Not allowed to delete this plant" })
  }
  const plant = await deletePlantBySlug(slug);
  
  if (!plant) {
    return res.status(400).json({
      message: "Plant does not exist",
    });
  }
  
  return res.status(204).json();
});

export default plantRouter;
