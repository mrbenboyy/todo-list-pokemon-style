const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

let mainWindow;
let db;
let client;

// MongoDB connection
const mongoUrl = 'mongodb://localhost:27017/';
const dbName = 'pokemon_tasks';

async function connectToMongoDB() {
  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#F8F8D0',
    icon: path.join(__dirname, 'assets', 'pokeball.png')
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  await connectToMongoDB();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (client) {
    client.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Categories
ipcMain.handle('get-categories', async () => {
  try {
    const categories = await db.collection('categories').find({}).toArray();
    // Convert ObjectIds to strings
    const categoriesWithStringIds = categories.map(cat => ({
      ...cat,
      _id: cat._id.toString()
    }));
    return { success: true, data: categoriesWithStringIds };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-category', async (event, category) => {
  try {
    const result = await db.collection('categories').insertOne({
      name: category.name,
      createdAt: new Date()
    });
    return { success: true, data: { _id: result.insertedId.toString(), ...category } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-category', async (event, id, updates) => {
  try {
    await db.collection('categories').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-category', async (event, id) => {
  try {
    // Delete category and all associated tasks
    await db.collection('tasks').deleteMany({ categoryId: id });
    await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers for Tasks
ipcMain.handle('get-tasks', async (event, categoryId) => {
  try {
    const tasks = await db.collection('tasks')
      .find({ categoryId: categoryId })
      .toArray();
    // Convert ObjectIds to strings
    const tasksWithStringIds = tasks.map(task => ({
      ...task,
      _id: task._id.toString()
    }));
    return { success: true, data: tasksWithStringIds };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-task', async (event, task) => {
  try {
    const result = await db.collection('tasks').insertOne({
      categoryId: task.categoryId,
      title: task.title,
      completed: false,
      createdAt: new Date()
    });
    return { success: true, data: { _id: result.insertedId.toString(), ...task } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-task', async (event, id, updates) => {
  try {
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-task', async (event, id) => {
  try {
    await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('toggle-task-complete', async (event, id, completed) => {
  try {
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: completed } }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
