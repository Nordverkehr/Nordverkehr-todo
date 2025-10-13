import mongoose from "mongoose"
import dotenv from "dotenv"
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActivityType } from "discord.js"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import path from "path"
import { fileURLToPath } from "url"
import todoRoutes from "./routes/todos.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class TodoApplication {
  constructor() {
    this.app = express()
    this.PORT = process.env.PORT || 3000
    this.discordClient = null
    this.server = null
  }

  async start() {
    try {
      console.log("🚀 Starting Todo Application with proper sequence...")

      // Step 1: MongoDB Connection
      await this.connectMongoDB()

      // Step 2: Setup and Start Express Server
      await this.startServer()

      // Step 3: Initialize Discord Bot
      await this.initializeDiscordBot()

      // Step 4: Register Commands to Guild
      await this.registerCommands()

      // Step 5: Login Bot and Output Bot Name
      await this.loginBot()

      // Step 6: Send DM to specified User ID
      await this.sendStartupDM()

      console.log("✅ Todo Application started successfully!")
    } catch (error) {
      console.error("❌ Failed to start Todo Application:", error)
      process.exit(1)
    }
  }

  async connectMongoDB() {
    console.log("📊 Step 1: Connecting to MongoDB...")

    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todolist")

    console.log("✅ MongoDB connected successfully")
  }

  async startServer() {
    console.log("🌐 Step 2: Setting up Express Server...")

    // Middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    )
    this.app.use(cors())
    this.app.use(morgan("combined"))
    this.app.use(express.json())
    this.app.use(express.static(path.join(__dirname, "public")))

    // Routes
    this.app.use("/api/todos", todoRoutes)

    // Serve frontend
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"))
    })

    // Status endpoint
    this.app.get("/api/status", (req, res) => {
      res.json({
        status: "connected",
        timestamp: new Date().toISOString(),
        discord: this.discordClient ? this.discordClient.isReady() : false,
      })
    })

    // Error handling
    this.app.use((err, req, res, next) => {
      console.error(err.stack)
      res.status(500).json({ error: "Something went wrong!" })
    })

    // Start server
    return new Promise((resolve) => {
      this.server = this.app.listen(this.PORT, () => {
        console.log(`✅ Server running on http://localhost:${this.PORT}`)
        resolve()
      })
    })
  }

  async initializeDiscordBot() {
    console.log("🤖 Step 3: Initializing Discord Bot...")

    if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
      throw new Error("Discord credentials missing in environment variables")
    }

    this.discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    })

    // Setup event listeners
    this.setupDiscordEventListeners()

    console.log("✅ Discord Bot initialized")
  }

  setupDiscordEventListeners() {
    this.discordClient.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return

      if (interaction.commandName === "liste") {
        await this.handleListeCommand(interaction)
      }
    })

    this.discordClient.on("error", (error) => {
      console.error("Discord client error:", error)
    })
  }

  async registerCommands() {
    console.log("📝 Step 4: Registering Commands to Guild...")

    const commands = [
      new SlashCommandBuilder()
        .setName("liste")
        .setDescription("Todo Liste Befehle")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Füge ein neues Item zur Liste hinzu")
            .addStringOption((option) => option.setName("item").setDescription("Name des Items").setRequired(true))
            .addStringOption((option) =>
              option
                .setName("category")
                .setDescription("Kategorie des Items")
                .setRequired(true)
                .addChoices(
                  { name: "MLO", value: "MLO" },
                  { name: "Script", value: "Script" },
                  { name: "Other", value: "Other" },
                ),
            )
            .addNumberOption((option) =>
              option.setName("preis").setDescription("Preis des Items in Euro").setRequired(true),
            )
            .addStringOption((option) => 
              option.setName("preview").setDescription("Preview Link (optional)").setRequired(false)
            )
            .addStringOption((option) => 
              option.setName("shop").setDescription("Shop Link (optional)").setRequired(false)
            ),
        )
        .addSubcommand((subcommand) => subcommand.setName("show").setDescription("Zeige alle Items der Liste"))
        .addSubcommand((subcommand) => subcommand.setName("stats").setDescription("Zeige Statistiken der Liste"))
        .addSubcommand((subcommand) =>
          subcommand
            .setName("toggle")
            .setDescription("Ändere den Status eines Items")
            .addStringOption((option) => option.setName("item").setDescription("Name des Items").setRequired(true)),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("delete")
            .setDescription("Lösche ein Item")
            .addStringOption((option) => option.setName("item").setDescription("Name des Items").setRequired(true)),
        ),
    ].map((command) => command.toJSON())

    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)

    // Register to specific guild (1114504004899192843)
    await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, "1114504004899192843"), {
      body: commands,
    })

    console.log("✅ Discord slash commands registered to guild successfully")
  }

  async loginBot() {
    console.log("🔐 Step 5: Logging in Discord Bot...")

    return new Promise((resolve, reject) => {
      this.discordClient.once("ready", async () => {
        console.log(`✅ Discord Bot logged in as: ${this.discordClient.user.tag}`)
        
        await this.updateBotStatus()
        
        resolve()
      })

      this.discordClient.login(process.env.DISCORD_TOKEN).catch(reject)
    })
  }

  async updateBotStatus() {
    try {
      const Todo = (await import("./models/Todo.js")).default
      const todoCount = await Todo.countDocuments()
      
      this.discordClient.user.setActivity(`${todoCount} Einträge | Powered by Nonylabs`, {
        type: ActivityType.Watching
      })
    } catch (error) {
      console.error("Failed to update bot status:", error)
      this.discordClient.user.setActivity("Todo Liste | Powered by Nonylabs", {
        type: ActivityType.Watching
      })
    }
  }

  async handleListeCommand(interaction) {
    const subcommand = interaction.options.getSubcommand()

    try {
      if (subcommand === "add") {
        const item = interaction.options.getString("item")
        const category = interaction.options.getString("category")
        const price = interaction.options.getNumber("preis")
        const previewLink = interaction.options.getString("preview") || ""
        const shopLink = interaction.options.getString("shop") || ""

        const Todo = (await import("./models/Todo.js")).default
        const newTodo = new Todo({
          item,
          category,
          price,
          previewLink,
          shopLink,
          purchased: false,
        })

        await newTodo.save()

        await this.updateBotStatus()

        let response = `✅ **${item}** wurde zur Liste hinzugefügt!\n📂 Kategorie: ${category}\n💰 Preis: €${price.toFixed(2)}`
        
        if (previewLink) {
          response += `\n👁️ Preview: ${previewLink}`
        }
        if (shopLink) {
          response += `\n🛒 Shop: ${shopLink}`
        }

        await interaction.reply({
          content: response,
          ephemeral: false,
        })
      } else if (subcommand === "show") {
        const Todo = (await import("./models/Todo.js")).default
        const todos = await Todo.find().sort({ createdAt: -1 }).limit(10)

        if (todos.length === 0) {
          await interaction.reply("📝 Die Liste ist leer!")
          return
        }

        const todoList = todos
          .map((todo) => {
            let line = `${todo.purchased ? "✅" : "⏳"} **${todo.item}** - €${todo.price.toFixed(2)} (${todo.category})`
            if (todo.previewLink) line += ` [Preview](${todo.previewLink})`
            if (todo.shopLink) line += ` [Shop](${todo.shopLink})`
            return line
          })
          .join("\n")

        await interaction.reply(`📋 **Todo Liste** (${todos.length} Items):\n\n${todoList}`)
      } else if (subcommand === "stats") {
        const TodoService = (await import("./services/TodoService.js")).default
        const stats = await TodoService.getStats()

        await interaction.reply({
          embeds: [
            {
              title: "📊 Todo Liste Statistiken",
              color: 0xdc2626, // Red color for black theme
              fields: [
                { name: "📝 Gesamt Items", value: stats.count.toString(), inline: true },
                { name: "✅ Gekauft", value: stats.purchasedCount.toString(), inline: true },
                { name: "⏳ Offen", value: stats.unpurchasedCount.toString(), inline: true },
                { name: "💰 Gesamtpreis", value: `€${stats.total.toFixed(2)}`, inline: true },
                { name: "💸 Ausgegeben", value: `€${stats.purchased.toFixed(2)}`, inline: true },
                { name: "💳 Noch zu kaufen", value: `€${stats.unpurchased.toFixed(2)}`, inline: true },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        })
      } else if (subcommand === "toggle") {
        const itemName = interaction.options.getString("item")
        const Todo = (await import("./models/Todo.js")).default

        const todo = await Todo.findOne({ item: { $regex: new RegExp(`^${itemName}$`, "i") } })
        if (!todo) {
          await interaction.reply(`❌ Item "${itemName}" nicht gefunden!`)
          return
        }

        todo.purchased = !todo.purchased
        await todo.save()

        await this.updateBotStatus()

        await interaction.reply(`${todo.purchased ? "✅" : "⏳"} **${todo.item}** Status geändert!`)
      } else if (subcommand === "delete") {
        const itemName = interaction.options.getString("item")
        const Todo = (await import("./models/Todo.js")).default

        const todo = await Todo.findOneAndDelete({ item: { $regex: new RegExp(`^${itemName}$`, "i") } })
        if (!todo) {
          await interaction.reply(`❌ Item "${itemName}" nicht gefunden!`)
          return
        }

        await this.updateBotStatus()

        await interaction.reply(`🗑️ **${todo.item}** wurde gelöscht!`)
      }
    } catch (error) {
      console.error("Discord command error:", error)
      await interaction.reply("❌ Ein Fehler ist aufgetreten!")
    }
  }

  async sendStartupDM() {
    console.log("💬 Step 6: Sending startup DM...")

    try {
      const userId = "1362049719307862056"
      const user = await this.discordClient.users.fetch(userId)

      const startupMessage = `🤖 **${this.discordClient.user.tag}** ist erfolgreich gestartet!

📊 **System Status:**
✅ MongoDB: Verbunden
✅ Express Server: Läuft auf Port ${this.PORT}
✅ Discord Bot: Online
✅ Commands: Registriert zu Guild

⏰ **Startzeit:** ${new Date().toLocaleString("de-DE")}
🌐 **Server:** http://localhost:${this.PORT}`

      await user.send(startupMessage)
      console.log("✅ Startup DM sent successfully to user:", userId)
    } catch (error) {
      console.error("❌ Failed to send startup DM:", error)
    }
  }

  // Graceful shutdown
  async shutdown() {
    console.log("🛑 Shutting down Todo Application...")

    if (this.discordClient) {
      this.discordClient.destroy()
    }

    if (this.server) {
      this.server.close()
    }

    await mongoose.disconnect()
    console.log("✅ Application shut down gracefully")
    process.exit(0)
  }
}

// Create and start application
const app = new TodoApplication()

// Handle process termination
process.on("SIGINT", () => app.shutdown())
process.on("SIGTERM", () => app.shutdown())

// Start the application
app.start()
