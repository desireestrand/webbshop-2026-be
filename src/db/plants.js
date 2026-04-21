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

    return await Plant.find(filter).populate("ownerId", OWNER_PUBLIC_INFO);
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

    return await Plant.find(filter).populate("ownerId", OWNER_ADMIN_INFO);
  } catch (error) {
    console.error("Unable to read all from 'Plants'", error.message);
    throw error;
  }
}

export async function getPlantsByOwnerId(ownerId) {
  try {
    return await Plant.find({ ownerId });
  } catch (error) {
    console.error(`Unable to read from 'Plants' for owner ${ownerId}:`, error.message);
    throw error;
  }
}

export async function getPlantBySlug(slug) {
  try {
    return await Plant.findOne({ slug }).populate("ownerId", OWNER_PUBLIC_INFO);
  } catch (error) {
    console.error(`Unable to read from 'Plant' for slug ${slug}:`, error.message);
    throw error;
  }
}

export async function createPlant(plantData) {
  try {
    const newPlant = new Plant(plantData);
    await newPlant.save();
    return await newPlant.populate("ownerId", OWNER_ADMIN_INFO);
  } catch (error) {
    console.error("Unable to create 'Plant'", error.message);
    throw error;
  }
}

export async function updatePlantBySlug(slug, updateData) {
  try {
    const updatedPlant = await Plant.findOneAndUpdate({ slug }, updateData, {
      //new returns the changed Plant and runValidators runs through to check rules from Plant schema
      new: true,
      runValidators: true,
    }).populate("ownerId", OWNER_ADMIN_INFO);

    return updatedPlant;
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
