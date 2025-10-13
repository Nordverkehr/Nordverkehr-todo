import { REST, Routes } from "discord.js"
import dotenv from "dotenv"

dotenv.config()

const commands = [
  {
    name: "liste",
    description: "Todo Liste Verwaltung",
    options: [
      {
        name: "add",
        description: "Neues Todo hinzufügen",
        type: 1, // SUB_COMMAND
        options: [
          {
            name: "item",
            description: "Name des Items",
            type: 3, // STRING
            required: true,
          },
          {
            name: "category",
            description: "Kategorie des Items",
            type: 3, // STRING
            required: true,
            choices: [
              { name: "MLO", value: "MLO" },
              { name: "Script", value: "Script" },
              { name: "Other", value: "Other" },
            ],
          },
          {
            name: "preis",
            description: "Preis in Euro",
            type: 10, // NUMBER
            required: true,
            min_value: 0,
          },
          {
            name: "preview",
            description: "Preview Link (optional)",
            type: 3, // STRING
            required: false,
          },
          {
            name: "shop",
            description: "Shop Link (optional)",
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: "show",
        description: "Alle Todos anzeigen",
        type: 1, // SUB_COMMAND
        options: [
          {
            name: "filter",
            description: "Filter nach Status",
            type: 3, // STRING
            required: false,
            choices: [
              { name: "Alle", value: "all" },
              { name: "Gekauft", value: "purchased" },
              { name: "Nicht gekauft", value: "unpurchased" },
            ],
          },
          {
            name: "category",
            description: "Filter nach Kategorie",
            type: 3, // STRING
            required: false,
            choices: [
              { name: "Alle", value: "all" },
              { name: "MLO", value: "MLO" },
              { name: "Script", value: "Script" },
              { name: "Other", value: "Other" },
            ],
          },
        ],
      },
      {
        name: "stats",
        description: "Statistiken anzeigen",
        type: 1, // SUB_COMMAND
      },
      {
        name: "toggle",
        description: "Todo Status ändern (gekauft/nicht gekauft)",
        type: 1, // SUB_COMMAND
        options: [
          {
            name: "item",
            description: "Name des Items (exakte Übereinstimmung)",
            type: 3, // STRING
            required: true,
          },
        ],
      },
      {
        name: "delete",
        description: "Todo löschen",
        type: 1, // SUB_COMMAND
        options: [
          {
            name: "item",
            description: "Name des Items (exakte Übereinstimmung)",
            type: 3, // STRING
            required: true,
          },
        ],
      },
    ],
  },
]

async function registerCommands() {
  try {
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)

    console.log("🔄 Registering Discord slash commands to guild...")

    await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, "1114504004899192843"), {
      body: commands,
    })

    console.log("✅ Discord slash commands registered to guild successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Failed to register Discord commands:", error)
    process.exit(1)
  }
}

registerCommands()
