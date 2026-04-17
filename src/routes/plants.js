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
  getPlantsByOwnerId,
} from "../db/plants.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const plantRouter = Router();

// GET /plants with search
plantRouter.get("/", async (req, res) => {
  const { q } = req.query;

  const plants = await getAvailablePlants(q);

  res.json(plants);
});

// GET /plants/all with search
plantRouter.get("/all", requireAuth, requireAdmin, async (req, res) => {
    const { q } = req.query;

    const plants = await getAllPlants(q);

    res.json(plants);
  },
);

// GET /plants/mine
plantRouter.get("/mine", requireAuth, async (req, res) => {
  const myPlants = await getPlantsByOwnerId(req.userId);

  if (!myPlants) {
    return res.status(404).json({
      message: "Your plants not found",
    });
  }

  res.json(myPlants);
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

    res.json(plant);
  },
);

// POST /plants
plantRouter.post("/", requireAuth, validatePlant, validatePlantResult,
  async (req, res) => {
    const plantData = {
      ...req.body,
      ownerId: req.userId,
    };

    const plant = await createPlant(plantData);

    res.status(201).json(plant);
  },
);

// PUT /plants/:slug
plantRouter.put("/:slug", requireAuth, validatePlant, validatePlantResult, async (req, res) => {
    const slug = req.params.slug;

    const plant = await getPlantBySlug(slug);

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    // Kontrollera att användaren äger plantan eller är admin
    if (plant.ownerId._id.toString() !== req.userId && req.userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Not allowed to update this plant" });
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
  },
);

// PATCH /plants/:slug
plantRouter.patch("/:slug", requireAuth,  validatePlantUpdate, validatePlantResult,
  async (req, res) => {
    // TODO Validation for Admin
    const slug = req.params.slug;

    const plant = await getPlantBySlug(slug);

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    if (req.body.ownerId || req.body.slug) {
      return res.status(400).json({
        message:
          "You are not allowed to update restricted fields (ownerId, slug).",
      });
    }

    // Kontrollera att användaren äger plantan eller är admin
    if (plant.ownerId._id.toString() !== req.userId  && req.userRole !== "admin")  {
      return res.status(403).json({ message: "Not allowed to update this plant" })
    } 

    const { slug: bodySlug, ...updateData } = req.body;

    const updatedPlant = await updatePlantBySlug(slug, updateData);

    if (!updatedPlant) {
      return res.status(404).json({
        message: "Plant does not exist",
      });
    }

    return res.status(200).json(updatedPlant);
  },
);

// DELETE /plants/:slug
plantRouter.delete("/:slug", requireAuth,  async (req, res) => {

    const slug = req.params.slug;

    const findPlant = await getPlantBySlug(slug);

    if (!findPlant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    // Kontrollera att användaren äger plantan eller är admin
    if (findPlant.ownerId._id.toString() !== req.userId  && req.userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this plant" });
    } 
    const plant = await deletePlantBySlug(slug);

    if (!plant) {
      return res.status(400).json({
        message: "Plant does not exist",
      });
    }

    return res.status(204).json();
  }
);

export default plantRouter;
