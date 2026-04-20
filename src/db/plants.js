import Plant from "../models/Plant.js";
import { getFullTextSearch } from "../utils/fullTextSearch.js";

const OWNER_PUBLIC_INFO = "name location slug";
const OWNER_ADMIN_INFO = "name email location slug role";

export async function getAvailablePlants(q) {
  try {
    let filter = { available: true };
    if (q) {
      filter = {
        ...filter,
        ...getFullTextSearch(q, true, "name"),
      };
    }

    return await Plant.find(filter)
      .populate("ownerId", OWNER_PUBLIC_INFO)
      .lean();
  } catch (error) {
    console.error("Unable to read from 'Plants'", error.message);
    throw error;
  }
}

export async function getAllPlants(q) {
  try {
    let filter = {};
    if (q) {
      filter = {
        ...filter,
        ...getFullTextSearch(q, true, "name"),
      };
    }

    return await Plant.find(filter)
      .populate("ownerId", OWNER_ADMIN_INFO)
      .lean();
  } catch (error) {
    console.error("Unable to read all from 'Plants'", error.message);
    throw error;
  }
}

export async function getPlantsByOwnerId(ownerId) {
  try {
    return await Plant.find({ ownerId }).lean();
  } catch (error) {
    console.error(`Unable to read from 'Plants' for owner ${ownerId}:`, error.message);
    throw error;
  }
}

export async function getPlantBySlug(slug) {
  try {
    return await Plant.findOne({ slug })
      .populate("ownerId", OWNER_PUBLIC_INFO)
      .lean();
  } catch (error) {
    console.error(`Unable to read from 'Plant' for slug ${slug}:`, error.message);
    throw error;
  }
}

export async function createPlant(plantData) {
  try {
    const newPlant = new Plant(plantData);
    await newPlant.save();

    const populatedPlant = await Plant.populate(newPlant, {
      path: "ownerId",
      select: OWNER_ADMIN_INFO,
    });

    const plantObject = populatedPlant.toObject();

    if (plantObject.ownerId) {
      delete plantObject.ownerId.activeTrades;
      delete plantObject.ownerId.history;
    }

    return plantObject;
  } catch (error) {
    console.error("Unable to create 'Plant'", error.message);
    throw error;
  }
}

export async function updatePlantBySlug(slug, updateData) {
  try {
    const updatedPlant = await Plant.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlant) return null;

    const populatedPlant = await updatedPlant.populate({
      path: "ownerId",
      select: OWNER_ADMIN_INFO,
    });
  
     const plantObject = populatedPlant.toObject();

    if (plantObject.ownerId) {
      delete plantObject.ownerId.activeTrades;
      delete plantObject.ownerId.history;
    }

    return plantObject;
  } catch (error) {
    console.error(`Unable to update 'Plant' for slug ${slug}:`, error.message);
    throw error;
  }
}

export async function deletePlantBySlug(slug) {
  try {
    const deletedPlant = await Plant.findOneAndDelete({ slug });
    
    if (deletedPlant) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Unable to delete 'Plant' for slug ${slug}:`, error.message);
    throw error;
  }
}
