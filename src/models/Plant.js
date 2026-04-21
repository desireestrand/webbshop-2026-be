import mongoose from "mongoose";
import slugify from "slugify";

export const LIGHT_LEVELS = {
  directSun: "direct sun",
  bright: "bright",
  partial: "partial",
  low: "low",
};

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    species: {
      type: String,
      required: true,
    },
    lightLevels: {
      type: String,
      required: true,
      enum: [
        LIGHT_LEVELS.directSun,
        LIGHT_LEVELS.bright,
        LIGHT_LEVELS.partial,
        LIGHT_LEVELS.low,
      ],
    },
    ownerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    meetingTime: {
      type: Date,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
 {
    timestamps: true,
    /*allows virtuals and
    hides duplicate id and unwanted info when
    sending JSON via API calls*/
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  }
);

plantSchema.pre("validate", async function (next) {
  if (this.isModified("name")) {
    const baseSlug = slugify(this.name, {
      lower: true,
    });

    let slug = baseSlug

    // Same as const Plant = mongoose.model("Plant");
    const Plant = this.constructor
    let counter = 1;

    // While slug exists in Plants, run this code
    while(await Plant.exists({slug})){
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Change the value of slug, makes while-loop stop if new value does not exist
    this.slug = slug
  }

  return next();
});

const Plant = mongoose.model("Plant", plantSchema);

export default Plant;