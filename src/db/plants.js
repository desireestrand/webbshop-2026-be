import Plant from "../models/Plant.js";
import { getFullTextSearch } from "../utils/fullTextSearch.js";

export async function getAvailablePlants(q) {
  let filter = { available: true };

  if (q) {
    filter = {
      ...filter,
      ...getFullTextSearch(q, true, "name"),
    };
  }

  try {
    return await Plant.find(filter).populate("ownerId", "name location").lean();
  } catch (err) {
    console.error("Unable to find based on query in 'Plants'", err);
    return [];
  }
}

export async function getAllPlants(q) {
  let filter = { };

  if (q) {
    filter = {
      ...filter,
      ...getFullTextSearch(q, true, "name"),
    };
  }

  try {
    return await Plant.find(filter).populate("ownerId", "name location").lean();
  } catch (err) {
    console.error("Unable to find based on query in 'Plants'", err);
    return [];
  }
}

export async function getPlantBySlug(slug) {
  try {
    return await Plant.findOne({ slug: slug }).populate("ownerId", "name location").lean();
  } catch (err) {
    console.error("Unable to read from 'Plants'", err);
    return null;
  }
}

export async function createPlant(plantData) {
  try {
    const newPlant = new Plant(plantData);
    await newPlant.save();
    return newPlant;
  } catch (err) {
    console.error("Error creating 'Plant':", err);
    throw err;
  }
}

export async function updatePlantBySlug(slug, plantData) {
  try {
    return await Plant.findOneAndUpdate({ slug: slug }, plantData, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    console.error("Error Updating 'Plant':", err);
    throw err;
  }
}

export async function deletePlantBySlug(slug) {
  try {
    const plantToDelete = await Plant.findOne({ slug: slug });
    if (!plantToDelete) return null;
    await Plant.deleteOne({ _id: plantToDelete._id });
    return true;
  } catch (err) {
    console.error("Unable to delete 'Plant'", err);
    return false;
  }
}