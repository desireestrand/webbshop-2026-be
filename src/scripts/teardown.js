import User from "../models/User.js"
import Plant from "../models/Plant.js"
import Trade from "../models/Trade.js"
import Place from "../models/Place.js"
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../config/database.js"

async function teardown() {
  await connectToDatabase("webshop")
  await Trade.deleteMany() // Trade first (reference plant and user)
  await Plant.deleteMany()
  await User.deleteMany()
  await Place.deleteMany()
  console.info("Database cleared")
  await disconnectFromDatabase() // Disconnect so process can exit
}

teardown().catch((err) => {
  console.error(err)
  process.exit(1)
})
