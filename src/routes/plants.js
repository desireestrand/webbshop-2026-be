import { Router } from "express";
import {
  validatePlant,
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

// GET /plants - Public
plantRouter.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const plants = await getAvailablePlants(q);
    return res.json(plants);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching plants" });
  }
});

// GET /plants/all - Admin
plantRouter.get("/all", requireAuth, /* requireAdmin */ async (req, res) => {
  try {
    const { q } = req.query;
    const plants = await getAllPlants(q);
    return res.json(plants);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching all plants" });
  }
});

// GET /plants/mine - Current user
plantRouter.get("/mine", requireAuth, async (req, res) => {
  try {
    const myPlants = await getPlantsByOwnerId(req.userId);
    return res.json(myPlants);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching your plants" });
  }
});

// GET /plants/:slug - Auth
plantRouter.get("/:slug", requireAuth, async (req, res) => {
  try {
    const slug = req.params.slug;
    const plant = await getPlantBySlug(slug);
  
    if (!plant) {
      return res.status(404).json({
        message: "Plant not found",
      });
    }

    return res.json(plant);
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching the plant" });
  }
});

// POST /plants - Auth
plantRouter.post("/", requireAuth, validatePlant, async (req, res) => {
  try {
    const plantData = {
      ...req.body,
      ownerId: req.userId,
    };
    const plant = await createPlant(plantData);

    return res.status(201).json(plant);
  } catch (error) {
    return res.status(500).json({ message: "Could not create plant" });
  }
});

// PATCH /plants/:slug - Owner or Admin
plantRouter.patch("/:slug", requireAuth, validatePlantUpdate, async (req, res) => {
  try {
    const slug = req.params.slug;
    const plant = await getPlantBySlug(slug);

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    if (plant.ownerId._id.toString() !== req.userId /* && req.userRole !== "admin" */) {
      return res.status(403).json({ message: "Not allowed to update this plant" });
    }

    if (req.body.ownerId || req.body.slug) {
      return res.status(400).json({
        message: "Updating ownerId or slug is not allowed",
      });
    }

    const { ownerId, slug: bodySlug, ...updateData } = req.body;
    const updatedPlant = await updatePlantBySlug(slug, updateData);

    return res.status(200).json(updatedPlant);
  } catch (error) {
    return res.status(500).json({ message: "Error while updating plant" });
  }
});

// DELETE /plants/:slug - Owner or Admin
plantRouter.delete("/:slug", requireAuth, async (req, res) => {
  try {
    const slug = req.params.slug;
    const plant = await getPlantBySlug(slug);

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    if (plant.ownerId._id.toString() !== req.userId /* && req.userRole !== "admin" */) {
      return res.status(403).json({ message: "Not allowed to delete this plant" });
    }

    const deletedPlant = await deletePlantBySlug(slug);

    if (!deletedPlant) {
      return res.status(400).json({
        message: "Could not delete plant",
      });
    }

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ message: "Error while deleting plant" });
  }
});

export default plantRouter;

// PUT /plants/:slug - Owner or Admin
/* plantRouter.put("/:slug", requireAuth, validatePlant, validatePlantResult, async (req, res) => {
    const slug = req.params.slug;

    const plant = await getPlantBySlug(slug)

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" })
    }

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
    })

    if (!updatedPlant) {
      return res.status(404).json({
        message: "Plant does not exist",
      })
    }

    return res.status(200).json(updatedPlant)
  },
) */
