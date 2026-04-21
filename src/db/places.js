import Place from "../models/Place.js";
import { getFullTextSearch } from "../utils/fullTextSearch.js";

export async function getPlaces(q) {
  try {
    let filter = {};
    if (q) {
      filter = {
        ...filter,
        ...getFullTextSearch(q, true, "city"),
      };
    }

    return await Place.find(filter).select("city placeName coordinates createdAt updatedAt")
  } catch (error) {
    console.error("Unable to read from 'Places'", error.message);
    throw error;
  }
}

export async function getPlaceById(id) {
  try {
    return await Place.findById({ _id: id });
  } catch (error) {
    console.error(`Unable to read from 'Place' for id ${id}:`, error.message);
    throw error;
  }
}

export async function createPlace(placeData) {
  try {
    const newPlace = new Place(placeData);
    await newPlace.save();
    return newPlace;
  } catch (error) {
    console.error("Unable to create 'Place'", error.message);
    throw error;
  }
}

export async function updatePlace(id, placeData) {
  try {
    return await Place.findByIdAndUpdate(id, placeData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    console.error(`Unable to update 'Place' for id ${id}:`, error.message);
    throw error;
  }
}

export async function deletePlaceById(id) {
  try {
    const deletedPlace = await Place.findOneAndDelete({ _id: id });

    if (deletedPlace) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Unable to delete 'Place' for id ${id}:`, error.message);
    throw error;
  }
}