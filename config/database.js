import mongoose from "mongoose"

class Database {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      if (this.connection) {
        return this.connection
      }

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
      }

      this.connection = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todolist", options)

      console.log("✅ MongoDB Atlas connected successfully")

      // Handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err)
      })

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected")
      })

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected")
      })

      return this.connection
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error)
      process.exit(1)
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect()
      this.connection = null
      console.log("📴 MongoDB disconnected")
    }
  }
}

export default new Database()
