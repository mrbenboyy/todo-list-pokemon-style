# Pokemon Task Manager

A retro Pokemon-inspired desktop task management application built with Electron.js and MongoDB.

## Features

- ✨ Nostalgic 90s Pokemon game aesthetic with pixelated graphics
- 📋 Two-level hierarchy: Categories/Goals and Tasks
- 💾 Persistent storage using MongoDB
- ✅ Task completion tracking
- ⚠️ Confirmation dialogs for all critical actions (edit, delete, complete)
- 🎨 Pixel-perfect retro UI with custom scrollbars
- 🎮 Press Start 2P retro font

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** (running locally on port 27017) - [Download here](https://www.mongodb.com/try/download/community)

### MongoDB Setup

1. Install MongoDB Community Edition
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically after installation, or run:
     ```
     net start MongoDB
     ```
   - **macOS/Linux**: 
     ```
     mongod
     ```
3. MongoDB should be running on `mongodb://localhost:27017/`

## Installation

1. Navigate to the project directory:
   ```
   cd "c:\Users\mrben\Desktop\electron.js\todo list"
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

Start the application with:
```
npm start
```

## Usage

### Categories/Goals View

- **Add Category**: Click the "+ NEW CATEGORY" button
- **View Tasks**: Click on any category card to view its tasks
- **Edit Category**: Click the pencil (✎) icon on a category card
- **Delete Category**: Click the X (✕) icon on a category card
  - ⚠️ This will delete all tasks in the category!

### Tasks View

- **Add Task**: Click the "+ NEW TASK" button
- **Mark Complete**: Click the checkbox next to a task
- **Edit Task**: Click the pencil (✎) icon on a task
- **Delete Task**: Click the X (✕) icon on a task
- **Back to Categories**: Click the "← BACK" button

### Confirmation Dialogs

All destructive and state-changing actions require confirmation:
- Editing categories or tasks
- Deleting categories or tasks
- Marking tasks as complete/incomplete

## Project Structure

```
todo list/
├── assets/              # Pixel art images (Pikachu, Pokeball, Badge)
│   ├── pikachu.png
│   ├── pokeball.png
│   └── badge.png
├── main.js              # Electron main process & MongoDB integration
├── preload.js           # Context bridge for secure IPC
├── index.html           # Main HTML structure
├── styles.css           # Retro Pokemon-style CSS
├── renderer.js          # Frontend logic
└── package.json         # Dependencies and scripts
```

## Database

The app creates a MongoDB database called `pokemon_tasks` with two collections:
- `categories` - Stores categories/goals
- `tasks` - Stores individual tasks linked to categories

## Technologies

- **Electron** - Desktop application framework
- **MongoDB** - NoSQL database for persistent storage
- **Press Start 2P** - Retro pixel font from Google Fonts
- **SVG** - Pixel art graphics

## Styling

The app features:
- Thick black borders (4-6px)
- Retro color scheme (yellows, reds, blues)
- Pixelated graphics with crisp-edges rendering
- Custom styled scrollbars
- Box shadows for depth
- Button press animations

## Troubleshooting

**App won't start:**
- Make sure MongoDB is running on port 27017
- Check that all dependencies are installed (`npm install`)

**No data persisting:**
- Verify MongoDB service is running
- Check MongoDB connection in console logs

**Images not showing:**
- Ensure assets folder contains all three SVG files

## Development

To enable DevTools, uncomment this line in `main.js`:
```javascript
mainWindow.webContents.openDevTools();
```

## License

MIT
