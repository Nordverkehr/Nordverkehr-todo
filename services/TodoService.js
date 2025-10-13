import Todo from "../models/Todo.js"

class TodoService {
  async getStats() {
    try {
      const todos = await Todo.find()
      return this.calculateStats(todos)
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`)
    }
  }

  async getAllTodos(filters = {}) {
    try {
      const { category, purchased, sortBy = "createdAt", sortOrder = "desc" } = filters
      const query = {}

      if (category && category !== "all") {
        query.category = category
      }

      if (purchased !== undefined) {
        query.purchased = purchased === "true" || purchased === true
      }

      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

      const todos = await Todo.find(query).sort(sortOptions)

      return {
        todos,
        stats: this.calculateStats(todos),
      }
    } catch (error) {
      throw new Error(`Failed to fetch todos: ${error.message}`)
    }
  }

  async createTodo(todoData) {
    try {
      const { item, category, price, previewLink, shopLink } = todoData

      if (!item || !category || price === undefined || price === null) {
        throw new Error("Item, category, and price are required")
      }

      const todo = new Todo({
        item: item.trim(),
        category,
        price: Number.parseFloat(price),
        previewLink: previewLink?.trim() || "",
        shopLink: shopLink?.trim() || "",
      })

      await todo.save()
      return todo
    } catch (error) {
      throw new Error(`Failed to create todo: ${error.message}`)
    }
  }

  async updateTodo(id, updateData) {
    try {
      const todo = await Todo.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true },
      )

      if (!todo) {
        throw new Error("Todo not found")
      }

      return todo
    } catch (error) {
      throw new Error(`Failed to update todo: ${error.message}`)
    }
  }

  async deleteTodo(id) {
    try {
      const todo = await Todo.findByIdAndDelete(id)

      if (!todo) {
        throw new Error("Todo not found")
      }

      return { message: "Todo deleted successfully", deletedTodo: todo }
    } catch (error) {
      throw new Error(`Failed to delete todo: ${error.message}`)
    }
  }

  async togglePurchased(id) {
    try {
      const todo = await Todo.findById(id)

      if (!todo) {
        throw new Error("Todo not found")
      }

      todo.purchased = !todo.purchased
      todo.updatedAt = Date.now()
      await todo.save()

      return todo
    } catch (error) {
      throw new Error(`Failed to toggle todo status: ${error.message}`)
    }
  }

  calculateStats(todos) {
    const total = todos.reduce((sum, todo) => sum + todo.price, 0)
    const purchased = todos.filter((todo) => todo.purchased)
    const unpurchased = todos.filter((todo) => !todo.purchased)

    return {
      total: Number.parseFloat(total.toFixed(2)),
      purchased: Number.parseFloat(purchased.reduce((sum, todo) => sum + todo.price, 0).toFixed(2)),
      unpurchased: Number.parseFloat(unpurchased.reduce((sum, todo) => sum + todo.price, 0).toFixed(2)),
      count: todos.length,
      purchasedCount: purchased.length,
      unpurchasedCount: unpurchased.length,
      categories: this.getCategoryStats(todos),
    }
  }

  getCategoryStats(todos) {
    const categories = {}
    todos.forEach((todo) => {
      if (!categories[todo.category]) {
        categories[todo.category] = {
          count: 0,
          total: 0,
          purchased: 0,
          unpurchased: 0,
        }
      }
      categories[todo.category].count++
      categories[todo.category].total += todo.price
      if (todo.purchased) {
        categories[todo.category].purchased += todo.price
      } else {
        categories[todo.category].unpurchased += todo.price
      }
    })

    return categories
  }

  async getStatsByDateRange(startDate, endDate) {
    try {
      const todos = await Todo.find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })

      return this.calculateStats(todos)
    } catch (error) {
      throw new Error(`Failed to get stats by date range: ${error.message}`)
    }
  }
}

export default new TodoService()
