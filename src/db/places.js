import Place from "../models/Place.js"
import { getFullTextSearch } from "../utils/fullTextSearch.js"

export async function getPlaces(q) {
  let filter = {}

  if (q) {
    filter = {
      ...filter,
      ...getFullTextSearch(q, true, "city"),
    }
  }

  try {
    return await Place.find(filter)
      .select("city placeName coordinates createdAt updatedAt")
      .lean()
  } catch (err) {
    console.error("Unable to find based on query in 'Places'", err)
    return []
  }
}

export async function createPlace(placeData) {
  try {
    const newPlace = new Place(placeData)
    await newPlace.save()
    return newPlace
  } catch (err) {
    console.error("Error creating 'Place':", err)
    throw err
  }
}

export async function getPlaceById(id) {
  try {
    return await Place.find({ _id: id })
  } catch (error) {
    console.error("Unable to read from 'Place'", err)
    return null
  }
}

export async function updatePlace(id, placeData) {
  try {
    return await Place.findByIdAndUpdate(id, placeData, {
      new: true, // returnera den uppdaterade användaren
      runValidators: true, // kontrollera att uppdateringen följer schemat
    })
  } catch (err) {
    console.error("Error updating 'Place':", err)
    throw err
  }
}

export async function deletePlaceById(id) {
  try {
    const placeToDelete = await Place.findOne({ _id: id })
    if (!placeToDelete) return null
    await Place.deleteOne({ _id: placeToDelete._id })
    return true
  } catch (err) {
    console.error("Unable to delete 'Place'", err)
    return false
  }
}
