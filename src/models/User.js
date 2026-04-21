import mongoose from "mongoose";
import bcrypt from "bcrypt";
import slugify from "slugify";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    resetPasswordCode: {
      type: String,
      required: false,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    location: {
      type: [Number],
      // default: [0, 0],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordCode;
        delete ret.__v;
        delete ret.id;

        if (!ret.activeTrades || ret.activeTrades.length === 0) {
          delete ret.activeTrades;
        }

        if (!ret.history || ret.history.length === 0) {
          delete ret.history;
        }

        delete ret._activeOwner;
        delete ret._activeRequester;
        delete ret._completedOwner;
        delete ret._completedRequester;

        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordCode;
        delete ret.__v;
        delete ret.id;

        if (!ret.activeTrades || ret.activeTrades.length === 0) {
          delete ret.activeTrades;
        }

        if (!ret.history || ret.history.length === 0) {
          delete ret.history;
        }

        delete ret._activeOwner;
        delete ret._activeRequester;
        delete ret._completedOwner;
        delete ret._completedRequester;

        return ret;
      },
    },
  },
);

userSchema.virtual("plants", {
  ref: "Plant",
  localField: "_id",
  foreignField: "ownerId",
});

userSchema.virtual("_activeOwner", {
  ref: "Trade",
  localField: "_id",
  foreignField: "ownerId",
  match: { status: { $in: ["pending", "approved"] } },
});

userSchema.virtual("_activeRequester", {
  ref: "Trade",
  localField: "_id",
  foreignField: "requesterId",
  match: { status: { $in: ["pending", "approved"] } },
});

userSchema.virtual("_completedOwner", {
  ref: "Trade",
  localField: "_id",
  foreignField: "ownerId",
  match: { status: "completed" },
});

userSchema.virtual("_completedRequester", {
  ref: "Trade",
  localField: "_id",
  foreignField: "requesterId",
  match: { status: "completed" },
});

userSchema.virtual("activeTrades").get(function () {
  const owner = this._activeOwner || [];
  const requester = this._activeRequester || [];
  const combined = [...owner, ...requester];

  if (combined.length === 0) return [];

  return combined.sort((a, b) => {
    const dateA = a && a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b && b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
});

userSchema.virtual("history").get(function () {
  const owner = this._completedOwner || [];
  const requester = this._completedRequester || [];
  const combined = [...owner, ...requester];

  if (combined.length === 0) return [];

  return combined.sort((a, b) => {
    const dateA = a && a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b && b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre("validate", async function (next) {
  if (this.isModified("name")) {
    const baseSlug = slugify(this.name, {
      lower: true,
    });

    let slug = baseSlug;

    // Same as const User = mongoose.model("Plant");
    const User = this.constructor;
    let counter = 1;

    // While slug exists in Users, run this code
    while (await User.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Change the value of slug, makes while-loop stop if new value does not exist
    this.slug = slug;
  }

  return next();
});

userSchema.methods.isSamePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
