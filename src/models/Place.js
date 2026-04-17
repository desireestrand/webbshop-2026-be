import mongoose from "mongoose"
import slugify from "slugify"

const placeSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    },
    library: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number],
      // default: [0, 0],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Place = mongoose.model("Place", placeSchema)

export default Place
