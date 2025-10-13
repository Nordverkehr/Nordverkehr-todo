# Node.js Todo Dashboard mit Discord Bot Integration

Ein modernes Todo-Management-System mit Admin Dashboard, MongoDB Cloud-Synchronisation und Discord Bot Integration.

## Features

### 🎨 Frontend
- **Black Theme Design** mit roten Akzenten
- **Glasmorphismus** Effekte mit schwarzem Design
- **Responsive Design** für alle Geräte
- **Moderne UI** mit Tailwind CSS v4
- **Lucide Icons** für moderne Iconographie

### 🔧 Backend
- **Node.js** mit Express.js
- **MongoDB Atlas** Integration
- **RESTful API** mit vollständigen CRUD-Operationen
- **Erweiterte Filterung** und Sortierung
- **Bulk-Operationen** für mehrere Todos
- **Analytics Dashboard** mit Insights

### 🤖 Discord Bot
- **Slash Commands** (`/liste`) registriert zu spezifischer Guild
- **Subcommands**: add, show, stats, toggle, delete
- **Rich Embeds** für schöne Nachrichten
- **Automatische Startup-DM** an konfigurierten User
- **Korrekte Startup-Sequenz**: MongoDB → Server → Bot → Commands → DM

### 📊 Analytics
- **Erweiterte Statistiken** nach Kategorien
- **Preisbereich-Analyse**
- **Kaufrate-Tracking**
- **Monatliche Trends**
- **Automatische Insights**

## Installation

1. **Repository klonen**
   \`\`\`bash
   git clone <repository-url>
   cd nodejs-todo-dashboard
   \`\`\`

2. **Dependencies installieren**
   \`\`\`bash
   npm install
   \`\`\`

3. **Umgebungsvariablen konfigurieren**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Fülle die `.env` Datei aus:
   \`\`\`env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todolist
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   PORT=3000
   \`\`\`

4. **Discord Bot Setup**
   - Erstelle eine neue Anwendung auf https://discord.com/developers/applications
   - Erstelle einen Bot und kopiere den Token
   - Lade den Bot auf deinen Server ein mit den nötigen Permissions
   - Commands werden automatisch zur Guild `1114504004899192843` registriert

5. **MongoDB Atlas Setup**
   - Erstelle einen kostenlosen Cluster auf https://cloud.mongodb.com
   - Erstelle einen Datenbankbenutzer
   - Kopiere die Connection String

## Verwendung

### Komplette Anwendung starten (EMPFOHLEN)
\`\`\`bash
# Development mit automatischem Restart
npm run dev

# Production
npm start
\`\`\`

**Startup-Sequenz:**
1. 📊 MongoDB Verbindung
2. 🌐 Express Server Start
3. 🤖 Discord Bot Initialisierung
4. 📝 Commands zu Guild registrieren
5. ✅ Bot Name ausgeben
6. 💬 Startup-DM an User ID `1362049719307862056`

### Einzelne Services starten
\`\`\`bash
# Nur Express Server
npm run server

# Nur Discord Bot
npm run bot

# Commands manuell registrieren
npm run register-commands
\`\`\`

### Discord Commands

- `/liste add <item> <category> <preis> [preview] [shop]` - Neues Todo hinzufügen
- `/liste show [filter] [category]` - Todos anzeigen
- `/liste stats` - Statistiken anzeigen
- `/liste toggle <item>` - Todo Status ändern
- `/liste delete <item>` - Todo löschen

### Web Interface

Öffne `http://localhost:3000` für das Admin Dashboard.

**Features:**
- ✅ Todos hinzufügen, bearbeiten, löschen
- 🔍 Erweiterte Suche und Filter
- 📊 Statistiken und Analytics
- 🖤 Black Theme mit roten Akzenten
- 📱 Responsive Design
- ⚡ Auto-Refresh nach Aktionen

## API Endpoints

- `GET /api/todos` - Alle Todos mit Filterung
- `POST /api/todos` - Neues Todo erstellen
- `PUT /api/todos/:id` - Todo aktualisieren
- `DELETE /api/todos/:id` - Todo löschen
- `PATCH /api/todos/:id/toggle` - Todo Status ändern
- `POST /api/todos/bulk` - Bulk-Operationen
- `GET /api/todos/analytics` - Analytics Daten
- `GET /api/status` - System Status

## Technologie Stack

- **Frontend**: Vanilla JavaScript, Tailwind CSS v4, HTML5
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Discord**: Discord.js v14
- **Styling**: Tailwind CSS v4, Black Theme Design
- **Icons**: Lucide Icons (via SVG)

## Projektstruktur

\`\`\`
├── config/
│   └── database.js          # MongoDB Konfiguration
├── models/
│   ├── Todo.js             # Todo Model
│   └── User.js             # User Model
├── routes/
│   └── todos.js            # API Routes
├── services/
│   └── TodoService.js      # Business Logic
├── public/
│   ├── index.html          # Frontend (Black Theme)
│   └── js/
│       ├── app.js          # Haupt-App
│       └── advanced-features.js # Erweiterte Features
├── scripts/
│   └── register-commands.js # Discord Commands
├── utils/
│   └── discord-helpers.js   # Discord Utilities
├── startup.js             # Haupt-Startup-Datei
├── discord-bot.js          # Discord Bot
├── server.js              # Express Server
└── package.json
\`\`\`

## Konfiguration

### Discord Guild Setup
- Commands werden automatisch zur Guild `1114504004899192843` registriert
- Startup-DM wird an User ID `1362049719307862056` gesendet
- Diese IDs können in `startup.js` angepasst werden

### Theme Anpassungen
- Black Theme mit roten Akzenten ist standardmäßig aktiviert
- Farben können in `public/index.html` im Tailwind Config angepasst werden
- Custom CSS für Glasmorphismus-Effekte verfügbar

## Lizenz

MIT License
