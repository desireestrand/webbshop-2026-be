import "dotenv/config"
import express from "express"
import mongoose from "mongoose"
import plantRouter from "./routes/plants.js"
import tradeRouter from "./routes/trades.js"
import authRouter from "./routes/auth.js"
import userRouter from "./routes/users.js"
import placeRouter from "./routes/place.js"
import cors from "cors"

const app = express()

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let isConnected = false

async function connectDB() {
  if (isConnected) return
  await mongoose.connect(process.env.MONGODB_URI)
  isConnected = true
}

// Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    next(err)
  }
})

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Webbshop API",
    stack: "MEN (MongoDB, Express, Node.js)",
  })
})

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use("/auth", authRouter)
app.use("/plants", plantRouter)
app.use("/trades", tradeRouter)
app.use("/users", userRouter)
app.use("/places", placeRouter)

export default app
