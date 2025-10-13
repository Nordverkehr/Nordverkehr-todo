import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  discordId: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  preferences: {
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "auto",
    },
    defaultCategory: {
      type: String,
      enum: ["MLO", "Script", "Other"],
      default: "Other",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
})

userSchema.methods.updateLastActive = function () {
  this.lastActive = Date.now()
  return this.save()
}

export default mongoose.model("User", userSchema)
