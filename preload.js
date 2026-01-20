const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Category operations
  getCategories: () => ipcRenderer.invoke('get-categories'),
  createCategory: (category) => ipcRenderer.invoke('create-category', category),
  updateCategory: (id, updates) => ipcRenderer.invoke('update-category', id, updates),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),
  
  // Task operations
  getTasks: (categoryId) => ipcRenderer.invoke('get-tasks', categoryId),
  createTask: (task) => ipcRenderer.invoke('create-task', task),
  updateTask: (id, updates) => ipcRenderer.invoke('update-task', id, updates),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  toggleTaskComplete: (id, completed) => ipcRenderer.invoke('toggle-task-complete', id, completed)
});
