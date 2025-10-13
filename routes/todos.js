import express from "express"
import Todo from "../models/Todo.js"

const router = express.Router()

// GET all todos with optional filtering
router.get("/", async (req, res) => {
  try {
    const {
      category,
      purchased,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      priceMin,
      priceMax,
      dateFrom,
      dateTo,
      limit = 50,
      page = 1,
    } = req.query

    const filter = {}

    // Category filter
    if (category && category !== "all") {
      filter.category = category
    }

    // Purchase status filter
    if (purchased !== undefined && purchased !== "all") {
      filter.purchased = purchased === "true"
    }

    // Search filter (item name)
    if (search && search.trim()) {
      filter.item = { $regex: search.trim(), $options: "i" }
    }

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {}
      if (priceMin !== undefined) filter.price.$gte = Number.parseFloat(priceMin)
      if (priceMax !== undefined) filter.price.$lte = Number.parseFloat(priceMax)
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }

    // Sorting
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const [todos, totalCount] = await Promise.all([
      Todo.find(filter).sort(sortOptions).limit(Number.parseInt(limit)).skip(skip),
      Todo.countDocuments(filter),
    ])

    // Calculate comprehensive stats
    const allFilteredTodos = await Todo.find(filter)
    const stats = calculateAdvancedStats(allFilteredTodos)

    res.json({
      todos,
      stats,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: Number.parseInt(limit),
        hasNext: skip + todos.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create new todo
router.post("/", async (req, res) => {
  try {
    const { item, category, price, previewLink, shopLink } = req.body

    if (!item || !category || price === undefined) {
      return res.status(400).json({ error: "Item, category, and price are required" })
    }

    const todo = new Todo({
      item,
      category,
      price: Number.parseFloat(price),
      previewLink: previewLink || "",
      shopLink: shopLink || "",
    })

    await todo.save()
    res.status(201).json(todo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT update todo
router.put("/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" })
    }

    res.json(todo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE todo
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id)

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" })
    }

    res.json({ message: "Todo deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH toggle purchased status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" })
    }

    todo.purchased = !todo.purchased
    todo.updatedAt = Date.now()
    await todo.save()

    res.json(todo)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET advanced analytics
router.get("/analytics", async (req, res) => {
  try {
    const { timeframe = "30d" } = req.query

    const dateFilter = {}
    const now = new Date()

    switch (timeframe) {
      case "7d":
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        break
      case "30d":
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        break
      case "90d":
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
        break
      case "1y":
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
        break
    }

    const todos = await Todo.find(dateFilter)
    const analytics = generateAnalytics(todos)

    res.json(analytics)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST bulk operations
router.post("/bulk", async (req, res) => {
  try {
    const { action, ids, data } = req.body

    if (!action || !ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Action and ids array are required" })
    }

    let result

    switch (action) {
      case "delete":
        result = await Todo.deleteMany({ _id: { $in: ids } })
        break
      case "toggle":
        const todosToToggle = await Todo.find({ _id: { $in: ids } })
        result = await Promise.all(
          todosToToggle.map((todo) => {
            todo.purchased = !todo.purchased
            todo.updatedAt = Date.now()
            return todo.save()
          }),
        )
        break
      case "update":
        if (!data) {
          return res.status(400).json({ error: "Data is required for update action" })
        }
        result = await Todo.updateMany({ _id: { $in: ids } }, { ...data, updatedAt: Date.now() })
        break
      default:
        return res.status(400).json({ error: "Invalid action" })
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      result,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

function calculateAdvancedStats(todos) {
  const total = todos.reduce((sum, todo) => sum + todo.price, 0)
  const purchased = todos.filter((todo) => todo.purchased)
  const unpurchased = todos.filter((todo) => !todo.purchased)

  const categoryStats = {}
  const monthlyStats = {}
  const priceRanges = {
    "0-10": 0,
    "10-50": 0,
    "50-100": 0,
    "100-500": 0,
    "500+": 0,
  }

  todos.forEach((todo) => {
    // Category stats
    if (!categoryStats[todo.category]) {
      categoryStats[todo.category] = {
        count: 0,
        total: 0,
        purchased: 0,
        unpurchased: 0,
        avgPrice: 0,
      }
    }
    categoryStats[todo.category].count++
    categoryStats[todo.category].total += todo.price
    if (todo.purchased) {
      categoryStats[todo.category].purchased += todo.price
    } else {
      categoryStats[todo.category].unpurchased += todo.price
    }

    // Monthly stats
    const monthKey = todo.createdAt.toISOString().substring(0, 7) // YYYY-MM
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = { count: 0, total: 0, purchased: 0 }
    }
    monthlyStats[monthKey].count++
    monthlyStats[monthKey].total += todo.price
    if (todo.purchased) {
      monthlyStats[monthKey].purchased += todo.price
    }

    // Price range stats
    if (todo.price <= 10) priceRanges["0-10"]++
    else if (todo.price <= 50) priceRanges["10-50"]++
    else if (todo.price <= 100) priceRanges["50-100"]++
    else if (todo.price <= 500) priceRanges["100-500"]++
    else priceRanges["500+"]++
  })

  // Calculate averages for categories
  Object.keys(categoryStats).forEach((category) => {
    categoryStats[category].avgPrice = categoryStats[category].total / categoryStats[category].count
  })

  return {
    total: Number.parseFloat(total.toFixed(2)),
    purchased: Number.parseFloat(purchased.reduce((sum, todo) => sum + todo.price, 0).toFixed(2)),
    unpurchased: Number.parseFloat(unpurchased.reduce((sum, todo) => sum + todo.price, 0).toFixed(2)),
    count: todos.length,
    purchasedCount: purchased.length,
    unpurchasedCount: unpurchased.length,
    avgPrice: Number.parseFloat((total / todos.length || 0).toFixed(2)),
    categories: categoryStats,
    monthly: monthlyStats,
    priceRanges,
    purchaseRate: Number.parseFloat(((purchased.length / todos.length || 0) * 100).toFixed(2)),
  }
}

function generateAnalytics(todos) {
  const analytics = {
    overview: calculateAdvancedStats(todos),
    trends: {
      daily: {},
      weekly: {},
      monthly: {},
    },
    insights: [],
  }

  // Generate daily trends for last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split("T")[0]
  }).reverse()

  last30Days.forEach((date) => {
    const dayTodos = todos.filter((todo) => todo.createdAt.toISOString().split("T")[0] === date)
    analytics.trends.daily[date] = {
      count: dayTodos.length,
      total: dayTodos.reduce((sum, todo) => sum + todo.price, 0),
      purchased: dayTodos.filter((todo) => todo.purchased).length,
    }
  })

  // Generate insights
  const totalValue = analytics.overview.total
  const purchaseRate = analytics.overview.purchaseRate

  if (purchaseRate > 80) {
    analytics.insights.push({
      type: "success",
      message: `Hohe Kaufrate von ${purchaseRate}%! Du bist sehr aktiv beim Umsetzen deiner Pläne.`,
    })
  } else if (purchaseRate < 30) {
    analytics.insights.push({
      type: "warning",
      message: `Niedrige Kaufrate von ${purchaseRate}%. Vielleicht solltest du deine Prioritäten überdenken.`,
    })
  }

  if (totalValue > 1000) {
    analytics.insights.push({
      type: "info",
      message: `Hoher Gesamtwert von €${totalValue}. Achte auf dein Budget!`,
    })
  }

  // Find most expensive category
  const categories = analytics.overview.categories
  const mostExpensiveCategory = Object.keys(categories).reduce((a, b) =>
    categories[a].total > categories[b].total ? a : b,
  )

  if (mostExpensiveCategory) {
    analytics.insights.push({
      type: "info",
      message: `${mostExpensiveCategory} ist deine teuerste Kategorie mit €${categories[mostExpensiveCategory].total.toFixed(2)}.`,
    })
  }

  return analytics
}

export default router
