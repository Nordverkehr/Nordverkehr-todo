import { EmbedBuilder } from "discord.js"

export class DiscordEmbedBuilder {
  static createSuccessEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`✅ ${title}`)
      .setDescription(description)
      .setTimestamp()
      .setFooter({ text: "Todo Liste Bot" })
  }

  static createErrorEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp()
      .setFooter({ text: "Todo Liste Bot" })
  }

  static createInfoEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`ℹ️ ${title}`)
      .setDescription(description)
      .setTimestamp()
      .setFooter({ text: "Todo Liste Bot" })
  }

  static createTodoEmbed(todo, action = "info") {
    const colors = {
      success: 0x00ff00,
      error: 0xff0000,
      info: 0x0099ff,
      warning: 0xff9900,
    }

    const embed = new EmbedBuilder()
      .setColor(colors[action] || colors.info)
      .setTitle(`📝 ${todo.item}`)
      .addFields(
        { name: "📂 Kategorie", value: todo.category, inline: true },
        { name: "💰 Preis", value: `€${todo.price.toFixed(2)}`, inline: true },
        { name: "📊 Status", value: todo.purchased ? "✅ Gekauft" : "⏳ Nicht gekauft", inline: true },
      )
      .setTimestamp()
      .setFooter({ text: "Todo Liste Bot" })

    if (todo.previewLink) {
      embed.addFields({ name: "👁️ Preview", value: `[Link](${todo.previewLink})`, inline: true })
    }

    if (todo.shopLink) {
      embed.addFields({ name: "🛒 Shop", value: `[Link](${todo.shopLink})`, inline: true })
    }

    return embed
  }

  static createStatsEmbed(stats) {
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

    return embed
  }
}

export function formatPrice(price) {
  return `€${price.toFixed(2)}`
}

export function formatTodoStatus(purchased) {
  return purchased ? "✅ Gekauft" : "⏳ Nicht gekauft"
}

export function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
