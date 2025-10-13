class TodoApp {
  constructor() {
    this.todos = []
    this.currentFilters = {
      category: "all",
      purchased: "all",
      search: "",
      price: "all",
      sort: "newest",
    }
    this.connectionStatus = "connected"
    this.latency = 0
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadTodos()
    this.startStatusMonitoring()

    setInterval(() => {
      this.loadTodos(true) // Silent refresh
    }, 30000)
  }

  setupEventListeners() {
    // Modal controls
    document.getElementById("add-item-btn").addEventListener("click", () => {
      this.openModal()
    })

    document.getElementById("close-modal").addEventListener("click", () => {
      this.closeModal()
    })

    document.getElementById("cancel-modal").addEventListener("click", () => {
      this.closeModal()
    })

    // Form submission
    document.getElementById("add-todo-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTodo()
    })

    // Search and filters
    document.getElementById("search-input").addEventListener("input", (e) => {
      this.currentFilters.search = e.target.value
      this.applyFilters()
    })

    document.getElementById("price-filter").addEventListener("change", (e) => {
      this.currentFilters.price = e.target.value
      this.applyFilters()
    })

    document.getElementById("sort-filter").addEventListener("change", (e) => {
      this.currentFilters.sort = e.target.value
      this.applyFilters()
    })

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleFilterClick(e.target)
      })
    })

    document.getElementById("clear-filters").addEventListener("click", () => {
      this.clearFilters()
    })

    // Close modal on outside click
    document.getElementById("add-modal").addEventListener("click", (e) => {
      if (e.target.id === "add-modal") {
        this.closeModal()
      }
    })
  }

  openModal() {
    document.getElementById("add-modal").classList.remove("hidden")
    document.getElementById("item-input").focus()
  }

  closeModal() {
    document.getElementById("add-modal").classList.add("hidden")
    document.getElementById("add-todo-form").reset()
  }

  handleFilterClick(button) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active")
      btn.classList.remove("bg-red-600/30", "text-red-300", "border-red-600/50")
      btn.classList.add("bg-gray-800/50", "text-gray-400", "border-gray-700")
    })

    // Add active class to clicked button
    button.classList.add("active")
    button.classList.remove("bg-gray-800/50", "text-gray-400", "border-gray-700")
    button.classList.add("bg-red-600/30", "text-red-300", "border-red-600/50")

    // Set filter based on button ID
    const filterId = button.id
    if (filterId === "filter-all") {
      this.currentFilters.purchased = "all"
      this.currentFilters.category = "all"
    } else if (filterId === "filter-purchased") {
      this.currentFilters.purchased = "true"
      this.currentFilters.category = "all"
    } else if (filterId === "filter-unpurchased") {
      this.currentFilters.purchased = "false"
      this.currentFilters.category = "all"
    } else if (filterId === "filter-mlo") {
      this.currentFilters.category = "MLO"
      this.currentFilters.purchased = "all"
    } else if (filterId === "filter-script") {
      this.currentFilters.category = "Script"
      this.currentFilters.purchased = "all"
    }

    this.applyFilters()
  }

  clearFilters() {
    this.currentFilters = {
      category: "all",
      purchased: "all",
      search: "",
      price: "all",
      sort: "newest",
    }

    // Reset UI
    document.getElementById("search-input").value = ""
    document.getElementById("price-filter").value = "all"
    document.getElementById("sort-filter").value = "newest"

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active", "bg-red-600/30", "text-red-300", "border-red-600/50")
      btn.classList.add("bg-gray-800/50", "text-gray-400", "border-gray-700")
    })
    const allBtn = document.getElementById("filter-all")
    allBtn.classList.add("active", "bg-red-600/30", "text-red-300", "border-red-600/50")
    allBtn.classList.remove("bg-gray-800/50", "text-gray-400", "border-gray-700")

    this.applyFilters()
  }

  async loadTodos(silent = false) {
    const startTime = Date.now()

    try {
      if (!silent) {
        this.showLoading()
      }

      const params = new URLSearchParams()
      Object.entries(this.currentFilters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/todos?${params}`)
      const data = await response.json()

      this.latency = Date.now() - startTime
      this.updateStatusIndicator("connected")

      if (response.ok) {
        this.todos = data.todos
        this.updateStats(data.stats)
        this.renderTodos()
      } else {
        this.showNotification("Fehler beim Laden der Todos", "error")
        this.updateStatusIndicator("error")
      }
    } catch (error) {
      console.error("Error loading todos:", error)
      this.latency = Date.now() - startTime
      this.updateStatusIndicator("error")
      if (!silent) {
        this.showNotification("Verbindungsfehler", "error")
      }
    } finally {
      if (!silent) {
        this.hideLoading()
      }
    }
  }

  applyFilters() {
    this.loadTodos()
  }

  async addTodo() {
    const formData = {
      item: document.getElementById("item-input").value.trim(),
      category: document.getElementById("category-input").value,
      price: Number.parseFloat(document.getElementById("price-input").value),
      previewLink: document.getElementById("preview-input").value.trim(),
      shopLink: document.getElementById("shop-input").value.trim(),
    }

    if (!formData.item || !formData.category || isNaN(formData.price)) {
      this.showNotification("Bitte alle Pflichtfelder ausfüllen", "error")
      return
    }

    try {
      this.showLoading()

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        this.closeModal()
        await this.loadTodos(false)
        this.showNotification("Todo erfolgreich hinzugefügt", "success")
      } else {
        const error = await response.json()
        this.showNotification(error.error || "Fehler beim Hinzufügen", "error")
      }
    } catch (error) {
      console.error("Error adding todo:", error)
      this.showNotification("Verbindungsfehler", "error")
    } finally {
      this.hideLoading()
    }
  }

  async toggleTodo(id) {
    try {
      this.showLoading()
      const response = await fetch(`/api/todos/${id}/toggle`, {
        method: "PATCH",
      })

      if (response.ok) {
        await this.loadTodos(false)
        this.showNotification("Status aktualisiert", "success")
      } else {
        this.showNotification("Fehler beim Aktualisieren", "error")
      }
    } catch (error) {
      console.error("Error toggling todo:", error)
      this.showNotification("Verbindungsfehler", "error")
    } finally {
      this.hideLoading()
    }
  }

  async deleteTodo(id) {
    if (!confirm("Todo wirklich löschen?")) return

    try {
      this.showLoading()

      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await this.loadTodos(false)
        this.showNotification("Todo gelöscht", "success")
      } else {
        this.showNotification("Fehler beim Löschen", "error")
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
      this.showNotification("Verbindungsfehler", "error")
    } finally {
      this.hideLoading()
    }
  }

  renderTodos() {
    const container = document.getElementById("todo-container")
    const emptyState = document.getElementById("empty-state")

    if (this.todos.length === 0) {
      emptyState.classList.remove("hidden")
      // Clear any existing todos
      const existingTodos = container.querySelectorAll(".todo-item")
      existingTodos.forEach((todo) => todo.remove())
      return
    }

    emptyState.classList.add("hidden")

    // Clear existing todos
    const existingTodos = container.querySelectorAll(".todo-item")
    existingTodos.forEach((todo) => todo.remove())

    // Render new todos
    this.todos.forEach((todo, index) => {
      const todoElement = this.createTodoElement(todo, index)
      container.appendChild(todoElement)
    })
  }

  createTodoElement(todo, index) {
    const div = document.createElement("div")
    div.className = "todo-item glass-card rounded-2xl p-6 animate-fade-in"
    div.style.animationDelay = `${index * 0.1}s`

    div.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-4 flex-1">
          <button onclick="app.toggleTodo('${todo._id}')" 
              class="mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                todo.purchased ? "bg-red-500 border-red-500 text-white" : "border-gray-600 hover:border-red-500"
              }">
            ${
              todo.purchased
                ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                   </svg>`
                : ""
            }
          </button>
          
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-xl font-bold text-white ${todo.purchased ? "line-through opacity-60" : ""}">${todo.item}</h3>
              <span class="px-3 py-1 text-sm font-medium rounded-full ${this.getCategoryColor(todo.category)}">${todo.category}</span>
            </div>
            
            <div class="flex items-center space-x-4 mb-3">
              <span class="text-2xl font-bold ${todo.purchased ? "text-red-400" : "text-white"}">€${todo.price.toFixed(2)}</span>
              ${todo.purchased ? '<span class="text-red-400 text-sm font-medium">✓ Gekauft</span>' : '<span class="text-gray-500 text-sm font-medium">⏳ Offen</span>'}
            </div>
            
            ${
              todo.previewLink || todo.shopLink
                ? `<div class="flex space-x-3">
                    ${
                      todo.previewLink
                        ? `<a href="${todo.previewLink}" target="_blank" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-300 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Preview
                           </a>`
                        : ""
                    }
                    ${
                      todo.shopLink
                        ? `<a href="${todo.shopLink}" target="_blank" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all border border-gray-600">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                            Shop
                           </a>`
                        : ""
                    }
                   </div>`
                : ""
            }
          </div>
        </div>
        
        <button onclick="app.deleteTodo('${todo._id}')" 
            class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/30">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    `

    return div
  }

  getCategoryColor(category) {
    const colors = {
      MLO: "bg-red-500/20 text-red-300 border border-red-500/30",
      Script: "bg-gray-600/20 text-gray-300 border border-gray-600/30",
      Other: "bg-gray-700/20 text-gray-400 border border-gray-700/30",
    }
    return colors[category] || colors["Other"]
  }

  updateStats(stats) {
    document.getElementById("total-price").textContent = `${stats.total.toFixed(2)} €`
    document.getElementById("purchased-price").textContent = `${stats.purchased.toFixed(2)} €`
    document.getElementById("unpurchased-price").textContent = `${stats.unpurchased.toFixed(2)} €`
    document.getElementById("total-count").textContent = stats.count
    document.getElementById("purchased-count").textContent = stats.purchasedCount || 0
    document.getElementById("unpurchased-count").textContent = stats.unpurchasedCount || 0
  }

  startStatusMonitoring() {
    this.updateStatusIndicator("connected")

    // Update status every 5 seconds
    setInterval(() => {
      this.updateStatusIndicator(this.connectionStatus)
    }, 5000)
  }

  updateStatusIndicator(status) {
    const statusDot = document.getElementById("connection-status")
    const statusText = document.getElementById("status-text")
    const latencyText = document.getElementById("latency-text")

    this.connectionStatus = status

    switch (status) {
      case "connected":
        statusDot.className = "w-3 h-3 rounded-full bg-red-500 animate-pulse-soft"
        statusText.textContent = "Verbunden"
        break
      case "error":
        statusDot.className = "w-3 h-3 rounded-full bg-red-700 animate-bounce-soft"
        statusText.textContent = "Fehler"
        break
      case "loading":
        statusDot.className = "w-3 h-3 rounded-full bg-gray-500 animate-pulse"
        statusText.textContent = "Lädt..."
        break
    }

    latencyText.textContent = this.latency > 0 ? `${this.latency}ms` : "--ms"
  }

  showLoading() {
    document.getElementById("loading-overlay").classList.remove("hidden")
    this.updateStatusIndicator("loading")
  }

  hideLoading() {
    document.getElementById("loading-overlay").classList.add("hidden")
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl glass-card animate-slide-up ${
      type === "success"
        ? "border-l-4 border-red-400"
        : type === "error"
          ? "border-l-4 border-red-600"
          : "border-l-4 border-gray-500"
    }`

    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-6 h-6 rounded-full flex items-center justify-center ${
          type === "success" ? "bg-red-500" : type === "error" ? "bg-red-600" : "bg-gray-600"
        }">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${
              type === "success"
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
                : type === "error"
                  ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
                  : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            }
          </svg>
        </div>
        <span class="text-white font-medium">${message}</span>
      </div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 4000)
  }
}

// Initialize app
const app = new TodoApp()
