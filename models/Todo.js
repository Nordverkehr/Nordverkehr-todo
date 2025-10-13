import mongoose from "mongoose"

const todoSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["MLO", "Script", "Other"],
    default: "Other",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  previewLink: {
    type: String,
    trim: true,
    default: "",
  },
  shopLink: {
    type: String,
    trim: true,
    default: "",
  },
  purchased: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

todoSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model("Todo", todoSchema)
