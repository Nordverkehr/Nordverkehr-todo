class AdvancedFeatures {
  constructor(app) {
    this.app = app
    this.selectedTodos = new Set()
    this.init()
  }

  init() {
    this.setupAdvancedFilters()
    this.setupBulkOperations()
    this.setupAnalytics()
    this.setupSearch()
  }

  setupAdvancedFilters() {
    // Add advanced filter controls to the existing filter section
    const filtersContainer = document.querySelector(".flex.flex-wrap.gap-4")

    const advancedFiltersHTML = `
      <div class="w-full mt-4 p-4 glass-morphism dark:glass-morphism-dark rounded-xl">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Erweiterte Filter</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Suche</label>
            <input type="text" id="search-input" placeholder="Item suchen..." 
              class="w-full px-3 py-2 text-sm rounded-lg glass-morphism dark:glass-morphism-dark border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Min. Preis (€)</label>
            <input type="number" id="price-min" placeholder="0" step="0.01" min="0"
              class="w-full px-3 py-2 text-sm rounded-lg glass-morphism dark:glass-morphism-dark border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max. Preis (€)</label>
            <input type="number" id="price-max" placeholder="1000" step="0.01" min="0"
              class="w-full px-3 py-2 text-sm rounded-lg glass-morphism dark:glass-morphism-dark border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sortierung</label>
            <select id="sort-by" class="w-full px-3 py-2 text-sm rounded-lg glass-morphism dark:glass-morphism-dark border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
              <option value="createdAt">Erstellungsdatum</option>
              <option value="price">Preis</option>
              <option value="item">Name</option>
              <option value="category">Kategorie</option>
            </select>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input type="checkbox" id="sort-desc" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              <span class="ml-2 text-xs text-gray-600 dark:text-gray-400">Absteigend</span>
            </label>
          </div>
          <button id="reset-filters" class="px-3 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Filter zurücksetzen
          </button>
        </div>
      </div>
    `

    filtersContainer.insertAdjacentHTML("afterend", advancedFiltersHTML)

    // Setup event listeners for advanced filters
    document.getElementById("search-input").addEventListener(
      "input",
      this.debounce(() => this.applyFilters(), 300),
    )
    document.getElementById("price-min").addEventListener(
      "input",
      this.debounce(() => this.applyFilters(), 300),
    )
    document.getElementById("price-max").addEventListener(
      "input",
      this.debounce(() => this.applyFilters(), 300),
    )
    document.getElementById("sort-by").addEventListener("change", () => this.applyFilters())
    document.getElementById("sort-desc").addEventListener("change", () => this.applyFilters())
    document.getElementById("reset-filters").addEventListener("click", () => this.resetFilters())
  }

  setupBulkOperations() {
    // Add bulk operations bar
    const todoListContainer = document.querySelector(
      ".glass-morphism.dark\\:glass-morphism-dark.rounded-2xl.soft-shadow",
    )

    const bulkOperationsHTML = `
      <div id="bulk-operations" class="hidden p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-white/20 dark:border-gray-700/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span id="selected-count" class="text-sm font-medium text-blue-700 dark:text-blue-300">0 ausgewählt</span>
            <button id="select-all" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">Alle auswählen</button>
            <button id="deselect-all" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">Auswahl aufheben</button>
          </div>
          <div class="flex items-center space-x-2">
            <button id="bulk-toggle" class="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Status ändern
            </button>
            <button id="bulk-delete" class="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Löschen
            </button>
          </div>
        </div>
      </div>
    `

    const todoListHeader = todoListContainer.querySelector(".p-6.border-b")
    todoListHeader.insertAdjacentHTML("afterend", bulkOperationsHTML)

    // Setup bulk operation event listeners
    document.getElementById("select-all").addEventListener("click", () => this.selectAllTodos())
    document.getElementById("deselect-all").addEventListener("click", () => this.deselectAllTodos())
    document.getElementById("bulk-toggle").addEventListener("click", () => this.bulkToggle())
    document.getElementById("bulk-delete").addEventListener("click", () => this.bulkDelete())
  }

  setupAnalytics() {
    // Add analytics button to header
    const headerControls = document.querySelector(".flex.items-center.space-x-4")

    const analyticsButtonHTML = `
      <button id="analytics-toggle" class="px-4 py-2 rounded-lg glass-morphism dark:glass-morphism-dark hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300">
        Analytics
      </button>
    `

    headerControls.insertAdjacentHTML("beforeend", analyticsButtonHTML)

    // Add analytics panel
    const analyticsPanel = `
      <div id="analytics-panel" class="mb-8 hidden animate-fade-in">
        <div class="glass-morphism dark:glass-morphism-dark rounded-2xl p-6 soft-shadow dark:soft-shadow-dark">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
            <select id="analytics-timeframe" class="px-3 py-2 rounded-lg glass-morphism dark:glass-morphism-dark border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm">
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d" selected>Letzte 30 Tage</option>
              <option value="90d">Letzte 90 Tage</option>
              <option value="1y">Letztes Jahr</option>
            </select>
          </div>
          <div id="analytics-content">
            <div class="text-center py-8">
              <div class="animate-pulse-soft">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400">Lade Analytics...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    const statsPanel = document.getElementById("stats-panel")
    statsPanel.insertAdjacentHTML("afterend", analyticsPanel)

    document.getElementById("analytics-toggle").addEventListener("click", () => this.toggleAnalytics())
    document.getElementById("analytics-timeframe").addEventListener("change", () => this.loadAnalytics())
  }

  setupSearch() {
    // Real-time search is already handled in setupAdvancedFilters
  }

  applyFilters() {
    const filters = {
      category: document.getElementById("category-filter").value,
      purchased: document.getElementById("status-filter").value,
      search: document.getElementById("search-input").value,
      priceMin: document.getElementById("price-min").value,
      priceMax: document.getElementById("price-max").value,
      sortBy: document.getElementById("sort-by").value,
      sortOrder: document.getElementById("sort-desc").checked ? "desc" : "asc",
    }

    this.app.currentFilters = filters
    this.app.loadTodos()
  }

  resetFilters() {
    document.getElementById("category-filter").value = "all"
    document.getElementById("status-filter").value = "all"
    document.getElementById("search-input").value = ""
    document.getElementById("price-min").value = ""
    document.getElementById("price-max").value = ""
    document.getElementById("sort-by").value = "createdAt"
    document.getElementById("sort-desc").checked = true

    this.applyFilters()
  }

  selectAllTodos() {
    this.app.todos.forEach((todo) => this.selectedTodos.add(todo._id))
    this.updateBulkOperationsUI()
    this.updateTodoCheckboxes()
  }

  deselectAllTodos() {
    this.selectedTodos.clear()
    this.updateBulkOperationsUI()
    this.updateTodoCheckboxes()
  }

  toggleTodoSelection(todoId) {
    if (this.selectedTodos.has(todoId)) {
      this.selectedTodos.delete(todoId)
    } else {
      this.selectedTodos.add(todoId)
    }
    this.updateBulkOperationsUI()
  }

  updateBulkOperationsUI() {
    const bulkOperations = document.getElementById("bulk-operations")
    const selectedCount = document.getElementById("selected-count")

    if (this.selectedTodos.size > 0) {
      bulkOperations.classList.remove("hidden")
      selectedCount.textContent = `${this.selectedTodos.size} ausgewählt`
    } else {
      bulkOperations.classList.add("hidden")
    }
  }

  updateTodoCheckboxes() {
    // This will be called from the main app when rendering todos
  }

  async bulkToggle() {
    if (this.selectedTodos.size === 0) return

    try {
      const response = await fetch("/api/todos/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle",
          ids: Array.from(this.selectedTodos),
        }),
      })

      if (response.ok) {
        this.selectedTodos.clear()
        this.updateBulkOperationsUI()
        this.app.loadTodos()
        this.app.showNotification("Status für ausgewählte Todos geändert", "success")
      } else {
        this.app.showNotification("Fehler beim Ändern der Status", "error")
      }
    } catch (error) {
      console.error("Error in bulk toggle:", error)
      this.app.showNotification("Verbindungsfehler", "error")
    }
  }

  async bulkDelete() {
    if (this.selectedTodos.size === 0) return

    if (!confirm(`${this.selectedTodos.size} Todos wirklich löschen?`)) return

    try {
      const response = await fetch("/api/todos/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          ids: Array.from(this.selectedTodos),
        }),
      })

      if (response.ok) {
        this.selectedTodos.clear()
        this.updateBulkOperationsUI()
        this.app.loadTodos()
        this.app.showNotification("Ausgewählte Todos gelöscht", "success")
      } else {
        this.app.showNotification("Fehler beim Löschen", "error")
      }
    } catch (error) {
      console.error("Error in bulk delete:", error)
      this.app.showNotification("Verbindungsfehler", "error")
    }
  }

  toggleAnalytics() {
    const analyticsPanel = document.getElementById("analytics-panel")
    analyticsPanel.classList.toggle("hidden")

    if (!analyticsPanel.classList.contains("hidden")) {
      this.loadAnalytics()
    }
  }

  async loadAnalytics() {
    const timeframe = document.getElementById("analytics-timeframe").value
    const analyticsContent = document.getElementById("analytics-content")

    try {
      const response = await fetch(`/api/todos/analytics?timeframe=${timeframe}`)
      const analytics = await response.json()

      if (response.ok) {
        this.renderAnalytics(analytics)
      } else {
        analyticsContent.innerHTML = `
          <div class="text-center py-8">
            <p class="text-red-600 dark:text-red-400">Fehler beim Laden der Analytics</p>
          </div>
        `
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
      analyticsContent.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-600 dark:text-red-400">Verbindungsfehler</p>
        </div>
      `
    }
  }

  renderAnalytics(analytics) {
    const analyticsContent = document.getElementById("analytics-content")

    const insightsHTML = analytics.insights
      .map(
        (insight) => `
      <div class="p-3 rounded-lg ${
        insight.type === "success"
          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
          : insight.type === "warning"
            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
      }">
        <p class="text-sm">${insight.message}</p>
      </div>
    `,
      )
      .join("")

    const priceRangesHTML = Object.entries(analytics.overview.priceRanges)
      .map(
        ([range, count]) => `
      <div class="flex justify-between items-center py-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">€${range}</span>
        <span class="text-sm font-medium text-gray-900 dark:text-white">${count}</span>
      </div>
    `,
      )
      .join("")

    analyticsContent.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Overview Stats -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Übersicht</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 glass-morphism dark:glass-morphism-dark rounded-xl">
              <p class="text-sm text-gray-600 dark:text-gray-400">Durchschnittspreis</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">€${analytics.overview.avgPrice.toFixed(2)}</p>
            </div>
            <div class="p-4 glass-morphism dark:glass-morphism-dark rounded-xl">
              <p class="text-sm text-gray-600 dark:text-gray-400">Kaufrate</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">${analytics.overview.purchaseRate}%</p>
            </div>
          </div>
          
          <div class="p-4 glass-morphism dark:glass-morphism-dark rounded-xl">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preisbereiche</h4>
            <div class="space-y-1">
              ${priceRangesHTML}
            </div>
          </div>
        </div>
        
        <!-- Insights -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Insights</h3>
          <div class="space-y-3">
            ${insightsHTML}
          </div>
          
          <div class="p-4 glass-morphism dark:glass-morphism-dark rounded-xl">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Kategorie Performance</h4>
            <div class="space-y-2">
              ${Object.entries(analytics.overview.categories)
                .map(
                  ([category, data]) => `
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-gray-400">${category}</span>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">€${data.avgPrice.toFixed(2)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${data.count} Items</div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `
  }

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

// Export for use in main app
window.AdvancedFeatures = AdvancedFeatures
