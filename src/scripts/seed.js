import { readFile } from "fs/promises"
import User from "../models/User.js"
import Plant from "../models/Plant.js"
import Trade from "../models/Trade.js"
import Place from "../models/Place.js"

import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../config/database.js"

const USERS_PATH = new URL("../data/users.json", import.meta.url)
const PLANTS_PATH = new URL("../data/plants.json", import.meta.url)
const TRADES_PATH = new URL("../data/trades.json", import.meta.url)
const PLACES_PATH = new URL("../data/place.json", import.meta.url)

async function seedUser() {
  if ((await User.countDocuments()) > 0) return
  const usersFromFile = JSON.parse(await readFile(USERS_PATH, "utf8"))
  const toInsert = usersFromFile.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    password: u.password,
    resetPasswordCode: u.resetPasswordCode,
    role: u.role,
    location: u.location,
    plants: u.plants,
    history: u.history,
  })) //slug: u.slug
  await User.insertMany(toInsert)
  console.info("Users seeded")
}

async function seedPlants() {
  if ((await Plant.countDocuments()) > 0) return
  const plantsFromFile = JSON.parse(await readFile(PLANTS_PATH, "utf8"))
  const toInsert = plantsFromFile.map((p) => ({
    _id: p._id,
    image: p.image,
    name: p.name,
    slug: p.slug,
    species: p.species,
    lightLevels: p.lightLevels,
    ownerId: p.ownerId,
    coordinates: p.coordinates,
    meetingTime: p.meetingTime,
    available: p.available,
  }))
  await Plant.insertMany(toInsert)
  console.info("Plants seeded")
}

async function seedTrades() {
  if ((await Trade.countDocuments()) > 0) return
  const tradesFromFile = JSON.parse(await readFile(TRADES_PATH, "utf8"))
  const toInsert = tradesFromFile.map((t) => ({
    _id: t._id,
    plantId: t.plantId,
    requesterId: t.requesterId,
    ownerId: t.ownerId,
    status: t.status,
  })) //slug: u.slug
  await Trade.insertMany(toInsert)
  console.info("Trades seeded")
}

async function seedPlaces() {
  if ((await Place.countDocuments()) > 0) return
  const placesFromFile = JSON.parse(await readFile(PLACES_PATH, "utf8"))
  const toInsert = placesFromFile.map((t) => ({
    _id: t._id,
    city: t.city,
    library: t.library,
    coordinates: t.coordinates,
  })) //slug: u.slug
  await Place.insertMany(toInsert)
  console.info("Places seeded")
}

async function seedIfEmpty() {
  await seedUser() // User first (plants reference by user)
  await seedPlants()
  await seedTrades() // Trades last (Reference plants)
  await seedPlaces()
}

// Standalone script: connect, seed, disconnect so process exits
connectToDatabase("webshop")
  .then(() => seedIfEmpty())
  .then(() => disconnectFromDatabase())
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
