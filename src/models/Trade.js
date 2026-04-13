import mongoose from "mongoose";
import Plant from "./Plant.js";
import User from "./User.js";

export const STATUS_LEVEL = {
  pending: "pending",
  approved: "approved",
  completed: "completed",
  cancelled: "cancelled",
};

const tradeSchema = new mongoose.Schema(
  {
    plantId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Plant",
      required: true, // Change to true later
    },
    requesterId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true, // Change to true later
    },
    ownerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true, // Change to true later
    },
    status: {
      type: String,
      required: true,
      enum: [
        STATUS_LEVEL.pending,
        STATUS_LEVEL.approved,
        STATUS_LEVEL.completed,
        STATUS_LEVEL.cancelled,
      ],
      default: STATUS_LEVEL.pending,
    },
  },
  {
    timestamps: true,
  },
);

tradeSchema.pre("validate", async function (next) {
  if (this.isNew || this.isModified("plantId")) {
    const plant = await Plant.findById(this.plantId).select("ownerId");

    if (plant) {
      this.ownerId = plant.ownerId;
    }
  }

  if (this.requesterId?.equals(this.ownerId)) {
    const error = new Error("Requester and owner cannot be the same user");
    return next(error);
  }

  next();
})

/* tradeSchema.post("save", async function (next) {
  if (this.isNew || this.isModified("status")) {
    const user = await User.findById(this.ownerId).select("_id")
    if (user) {
      this.ownerId = user._id
    }
  }
  next()
}) */

tradeSchema.post("save", async function () {
  if (this.status === STATUS_LEVEL.approved || this.status === STATUS_LEVEL.completed) {
    try {
      await Plant.findByIdAndUpdate(this.plantId, {
        available: false
      })
    } catch (error) {
      console.error("Error updating plant availability:", error)
    }
  }
    if (this.status === STATUS_LEVEL.completed){
    try {
      await User.findByIdAndUpdate(this.ownerId, {
        $addToSet: { history: this._id },
      });

      await User.findByIdAndUpdate(this.requesterId, {
        $addToSet: { history: this._id },
      });

      await Plant.findByIdAndUpdate(this.plantId, { available: false });
    } catch (err) {
      console.error("Error updating user history:", err);
    }
  }
  if (this.status === STATUS_LEVEL.cancelled) {
    try {
      await Plant.findByIdAndUpdate(this.plantId, { available: true });
    } catch (err) {
      console.error("Error updating plant availability:", err);
    }
  }

  //Deletes all other trades with the same plant id if one trade is completed
  if(this.status === STATUS_LEVEL.completed){
    try{
      await this.constructor.deleteMany({
        plantId: this.plantId,
        _id: {$ne: this._id},                 //makes sure not to delete the current trade
        status:{$ne: STATUS_LEVEL.completed}  //makes sure not to delete trades with the status completed
      })
    }
   catch (error) {
    console.error("Could not clean up old trades for plantId " + this.plantId)
  }}
});

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;
