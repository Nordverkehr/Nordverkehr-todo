import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import todoRoutes from "./routes/todos.js"
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

async function startApplication() {
  try {
    console.log("🚀 Starting Todo Application...")

    // Step 1: Connect to MongoDB
    console.log("📊 Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todolist", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ MongoDB connected successfully")

    // Step 2: Setup Express Server
    console.log("🌐 Setting up Express server...")
    setupMiddleware()
    setupRoutes()

    // Step 3: Start Server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`)
    })

    // Step 4: Start Discord Bot
    if (process.env.DISCORD_TOKEN && process.env.DISCORD_CLIENT_ID) {
      console.log("🤖 Starting Discord Bot...")
      await startDiscordBot()
    } else {
      console.log("⚠️ Discord credentials missing, skipping bot startup")
    }
  } catch (error) {
    console.error("❌ Failed to start application:", error)
    process.exit(1)
  }
}

function setupMiddleware() {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  )
  app.use(cors())
  app.use(morgan("combined"))
  app.use(express.json())
  app.use(express.static(path.join(__dirname, "public")))
}

function setupRoutes() {
  // Routes
  app.use("/api/todos", todoRoutes)

  // Serve frontend
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
  })

  // Status endpoint for connection monitoring
  app.get("/api/status", (req, res) => {
    res.json({
      status: "connected",
      timestamp: new Date().toISOString(),
      discord: discordClient ? discordClient.isReady() : false,
    })
  })

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: "Something went wrong!" })
  })
}

// Discord Bot Setup
let discordClient = null

async function startDiscordBot() {
  try {
    discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    })

    // Setup event listeners
    discordClient.once("ready", async () => {
      console.log(`✅ Discord Bot logged in as ${discordClient.user.tag}!`)

      // Send DM to specified user
      try {
        const user = await discordClient.users.fetch("1362049719307862056")
        await user.send(
          `🤖 **${discordClient.user.tag}** ist erfolgreich gestartet!\n⏰ ${new Date().toLocaleString("de-DE")}`,
        )
        console.log("✅ Startup DM sent successfully")
      } catch (error) {
        console.error("❌ Failed to send startup DM:", error)
      }
    })

    discordClient.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return

      if (interaction.commandName === "liste") {
        await handleListeCommand(interaction)
      }
    })

    discordClient.on("error", (error) => {
      console.error("Discord client error:", error)
    })

    // Login to Discord
    await discordClient.login(process.env.DISCORD_TOKEN)

    // Register commands to specific guild
    console.log("📝 Registering Discord commands to guild...")
    await registerCommands()
  } catch (error) {
    console.error("❌ Failed to start Discord Bot:", error)
    throw error
  }
}

async function registerCommands() {
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

  try {
    // Register to specific guild
    await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, "1114504004899192843"), {
      body: commands,
    })
    console.log("✅ Discord slash commands registered to guild successfully")
  } catch (error) {
    console.error("❌ Failed to register Discord commands:", error)
    throw error
  }
}

async function handleListeCommand(interaction) {
  const subcommand = interaction.options.getSubcommand()

  try {
    if (subcommand === "add") {
      const item = interaction.options.getString("item")
      const category = interaction.options.getString("category")
      const price = interaction.options.getNumber("preis")

      // Add to database using the same logic as the API
      const Todo = (await import("./models/Todo.js")).default
      const newTodo = new Todo({
        item,
        category,
        price,
        purchased: false,
      })

      await newTodo.save()

      await interaction.reply({
        content: `✅ **${item}** wurde zur Liste hinzugefügt!\n📂 Kategorie: ${category}\n💰 Preis: €${price.toFixed(2)}`,
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
        .map(
          (todo) => `${todo.purchased ? "✅" : "⏳"} **${todo.item}** - €${todo.price.toFixed(2)} (${todo.category})`,
        )
        .join("\n")

      await interaction.reply(`📋 **Todo Liste** (${todos.length} Items):\n\n${todoList}`)
    } else if (subcommand === "stats") {
      const TodoService = (await import("./services/TodoService.js")).default
      const stats = await TodoService.getStats()

      await interaction.reply({
        embeds: [
          {
            title: "📊 Todo Liste Statistiken",
            color: 0xdc2626,
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

      await interaction.reply(`${todo.purchased ? "✅" : "⏳"} **${todo.item}** Status geändert!`)
    } else if (subcommand === "delete") {
      const itemName = interaction.options.getString("item")
      const Todo = (await import("./models/Todo.js")).default

      const todo = await Todo.findOneAndDelete({ item: { $regex: new RegExp(`^${itemName}$`, "i") } })
      if (!todo) {
        await interaction.reply(`❌ Item "${itemName}" nicht gefunden!`)
        return
      }

      await interaction.reply(`🗑️ **${todo.item}** wurde gelöscht!`)
    }
  } catch (error) {
    console.error("Discord command error:", error)
    await interaction.reply("❌ Ein Fehler ist aufgetreten!")
  }
}

// Start the application
startApplication()
