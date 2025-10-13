import { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, REST, Routes } from "discord.js"
import dotenv from "dotenv"
import Todo from "./models/Todo.js"
import TodoService from "./services/TodoService.js"
import Database from "./config/database.js"

dotenv.config()

class DiscordTodoBot {
  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    })

    this.commands = this.setupCommands()
    this.init()
  }

  setupCommands() {
    return [
      new SlashCommandBuilder()
        .setName("liste")
        .setDescription("Todo Liste Verwaltung")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Neues Todo hinzufügen")
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
              option.setName("preis").setDescription("Preis in Euro").setRequired(true).setMinValue(0),
            )
            .addStringOption((option) =>
              option.setName("preview").setDescription("Preview Link (optional)").setRequired(false),
            )
            .addStringOption((option) =>
              option.setName("shop").setDescription("Shop Link (optional)").setRequired(false),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("show")
            .setDescription("Alle Todos anzeigen")
            .addStringOption((option) =>
              option
                .setName("filter")
                .setDescription("Filter nach Status")
                .setRequired(false)
                .addChoices(
                  { name: "Alle", value: "all" },
                  { name: "Gekauft", value: "purchased" },
                  { name: "Nicht gekauft", value: "unpurchased" },
                ),
            )
            .addStringOption((option) =>
              option
                .setName("category")
                .setDescription("Filter nach Kategorie")
                .setRequired(false)
                .addChoices(
                  { name: "Alle", value: "all" },
                  { name: "MLO", value: "MLO" },
                  { name: "Script", value: "Script" },
                  { name: "Other", value: "Other" },
                ),
            ),
        )
        .addSubcommand((subcommand) => subcommand.setName("stats").setDescription("Statistiken anzeigen"))
        .addSubcommand((subcommand) =>
          subcommand
            .setName("toggle")
            .setDescription("Todo Status ändern (gekauft/nicht gekauft)")
            .addStringOption((option) =>
              option.setName("item").setDescription("Name des Items (exakte Übereinstimmung)").setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("delete")
            .setDescription("Todo löschen")
            .addStringOption((option) =>
              option.setName("item").setDescription("Name des Items (exakte Übereinstimmung)").setRequired(true),
            ),
        ),
    ]
  }

  async init() {
    try {
      // Connect to MongoDB
      await Database.connect()

      // Setup event listeners
      this.setupEventListeners()

      // Register slash commands
      await this.registerCommands()

      // Login to Discord
      await this.client.login(process.env.DISCORD_TOKEN)

      console.log("🤖 Discord Bot started successfully!")
    } catch (error) {
      console.error("❌ Failed to start Discord Bot:", error)
      process.exit(1)
    }
  }

  setupEventListeners() {
    this.client.once("ready", () => {
      console.log(`✅ Discord Bot logged in as ${this.client.user.tag}!`)
      this.client.user.setActivity("Todo Liste verwalten", { type: "WATCHING" })
    })

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return

      if (interaction.commandName === "liste") {
        await this.handleListeCommand(interaction)
      }
    })

    this.client.on("error", (error) => {
      console.error("Discord client error:", error)
    })
  }

  async registerCommands() {
    try {
      const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)

      console.log("🔄 Registering Discord slash commands...")

      await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
        body: this.commands.map((command) => command.toJSON()),
      })

      console.log("✅ Discord slash commands registered successfully!")
    } catch (error) {
      console.error("❌ Failed to register Discord commands:", error)
      throw error
    }
  }

  async handleListeCommand(interaction) {
    const subcommand = interaction.options.getSubcommand()

    try {
      switch (subcommand) {
        case "add":
          await this.handleAddCommand(interaction)
          break
        case "show":
          await this.handleShowCommand(interaction)
          break
        case "stats":
          await this.handleStatsCommand(interaction)
          break
        case "toggle":
          await this.handleToggleCommand(interaction)
          break
        case "delete":
          await this.handleDeleteCommand(interaction)
          break
        default:
          await interaction.reply({
            content: "❌ Unbekannter Befehl!",
            ephemeral: true,
          })
      }
    } catch (error) {
      console.error("Error handling liste command:", error)

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
          ephemeral: true,
        })
      }
    }
  }

  async handleAddCommand(interaction) {
    await interaction.deferReply()

    const item = interaction.options.getString("item")
    const category = interaction.options.getString("category")
    const preis = interaction.options.getNumber("preis")
    const preview = interaction.options.getString("preview") || ""
    const shop = interaction.options.getString("shop") || ""

    try {
      const todo = await TodoService.createTodo({
        item,
        category,
        price: preis,
        previewLink: preview,
        shopLink: shop,
      })

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("✅ Todo erfolgreich hinzugefügt!")
        .addFields(
          { name: "📝 Item", value: todo.item, inline: true },
          { name: "📂 Kategorie", value: todo.category, inline: true },
          { name: "💰 Preis", value: `€${todo.price.toFixed(2)}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Todo Liste Bot" })

      if (todo.previewLink) {
        embed.addFields({ name: "👁️ Preview", value: `[Link](${todo.previewLink})`, inline: true })
      }

      if (todo.shopLink) {
        embed.addFields({ name: "🛒 Shop", value: `[Link](${todo.shopLink})`, inline: true })
      }

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      await interaction.editReply({
        content: `❌ Fehler beim Hinzufügen: ${error.message}`,
      })
    }
  }

  async handleShowCommand(interaction) {
    await interaction.deferReply()

    const filter = interaction.options.getString("filter") || "all"
    const category = interaction.options.getString("category") || "all"

    try {
      const filters = {}

      if (category !== "all") {
        filters.category = category
      }

      if (filter === "purchased") {
        filters.purchased = true
      } else if (filter === "unpurchased") {
        filters.purchased = false
      }

      const { todos, stats } = await TodoService.getAllTodos(filters)

      if (todos.length === 0) {
        await interaction.editReply({
          content: "📝 Keine Todos gefunden!",
        })
        return
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("📋 Todo Liste")
        .setDescription(`Gefunden: ${todos.length} Einträge`)
        .setTimestamp()
        .setFooter({ text: "Todo Liste Bot" })

      // Add todos to embed (max 25 fields)
      const maxTodos = Math.min(todos.length, 20)
      for (let i = 0; i < maxTodos; i++) {
        const todo = todos[i]
        const status = todo.purchased ? "✅" : "⏳"
        const links = []

        if (todo.previewLink) links.push(`[Preview](${todo.previewLink})`)
        if (todo.shopLink) links.push(`[Shop](${todo.shopLink})`)

        const linkText = links.length > 0 ? `\n${links.join(" • ")}` : ""

        embed.addFields({
          name: `${status} ${todo.item} (${todo.category})`,
          value: `💰 €${todo.price.toFixed(2)}${linkText}`,
          inline: false,
        })
      }

      if (todos.length > maxTodos) {
        embed.addFields({
          name: "📊 Hinweis",
          value: `... und ${todos.length - maxTodos} weitere Einträge`,
          inline: false,
        })
      }

      // Add summary
      embed.addFields({
        name: "💰 Gesamtsumme",
        value: `€${stats.total.toFixed(2)} (Gekauft: €${stats.purchased.toFixed(2)}, Offen: €${stats.unpurchased.toFixed(2)})`,
        inline: false,
      })

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      await interaction.editReply({
        content: `❌ Fehler beim Laden: ${error.message}`,
      })
    }
  }

  async handleStatsCommand(interaction) {
    await interaction.deferReply()

    try {
      const { stats } = await TodoService.getAllTodos()

      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle("📊 Todo Statistiken")
        .addFields(
          { name: "📝 Gesamt Einträge", value: stats.count.toString(), inline: true },
          { name: "✅ Gekauft", value: stats.purchasedCount.toString(), inline: true },
          { name: "⏳ Offen", value: stats.unpurchasedCount.toString(), inline: true },
          { name: "💰 Gesamtwert", value: `€${stats.total.toFixed(2)}`, inline: true },
          { name: "✅ Gekauft Wert", value: `€${stats.purchased.toFixed(2)}`, inline: true },
          { name: "⏳ Offener Wert", value: `€${stats.unpurchased.toFixed(2)}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Todo Liste Bot" })

      // Add category breakdown
      if (stats.categories && Object.keys(stats.categories).length > 0) {
        let categoryText = ""
        for (const [category, data] of Object.entries(stats.categories)) {
          categoryText += `**${category}**: ${data.count} Einträge (€${data.total.toFixed(2)})\n`
        }
        embed.addFields({ name: "📂 Nach Kategorien", value: categoryText, inline: false })
      }

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      await interaction.editReply({
        content: `❌ Fehler beim Laden der Statistiken: ${error.message}`,
      })
    }
  }

  async handleToggleCommand(interaction) {
    await interaction.deferReply()

    const itemName = interaction.options.getString("item")

    try {
      const todo = await Todo.findOne({ item: { $regex: new RegExp(`^${itemName}$`, "i") } })

      if (!todo) {
        await interaction.editReply({
          content: `❌ Todo "${itemName}" nicht gefunden!`,
        })
        return
      }

      const updatedTodo = await TodoService.togglePurchased(todo._id)
      const status = updatedTodo.purchased ? "✅ Gekauft" : "⏳ Nicht gekauft"

      const embed = new EmbedBuilder()
        .setColor(updatedTodo.purchased ? 0x00ff00 : 0xff9900)
        .setTitle("🔄 Status geändert!")
        .addFields(
          { name: "📝 Item", value: updatedTodo.item, inline: true },
          { name: "📊 Neuer Status", value: status, inline: true },
          { name: "💰 Preis", value: `€${updatedTodo.price.toFixed(2)}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Todo Liste Bot" })

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      await interaction.editReply({
        content: `❌ Fehler beim Ändern des Status: ${error.message}`,
      })
    }
  }

  async handleDeleteCommand(interaction) {
    await interaction.deferReply()

    const itemName = interaction.options.getString("item")

    try {
      const todo = await Todo.findOne({ item: { $regex: new RegExp(`^${itemName}$`, "i") } })

      if (!todo) {
        await interaction.editReply({
          content: `❌ Todo "${itemName}" nicht gefunden!`,
        })
        return
      }

      await TodoService.deleteTodo(todo._id)

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("🗑️ Todo gelöscht!")
        .addFields(
          { name: "📝 Gelöschtes Item", value: todo.item, inline: true },
          { name: "📂 Kategorie", value: todo.category, inline: true },
          { name: "💰 Preis", value: `€${todo.price.toFixed(2)}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Todo Liste Bot" })

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      await interaction.editReply({
        content: `❌ Fehler beim Löschen: ${error.message}`,
      })
    }
  }
}

// Start the bot
const bot = new DiscordTodoBot()

// Handle process termination
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down Discord Bot...")
  await Database.disconnect()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down Discord Bot...")
  await Database.disconnect()
  process.exit(0)
})

export default bot
