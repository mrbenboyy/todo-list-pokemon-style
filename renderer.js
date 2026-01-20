// State management
let currentView = 'categories';
let currentCategoryId = null;
let currentEditId = null;
let confirmCallback = null;

// DOM Elements
const categoriesView = document.getElementById('categoriesView');
const tasksView = document.getElementById('tasksView');
const categoriesGrid = document.getElementById('categoriesGrid');
const tasksList = document.getElementById('tasksList');
const categoryTitle = document.getElementById('categoryTitle');

// Buttons
const addCategoryBtn = document.getElementById('addCategoryBtn');
const addTaskBtn = document.getElementById('addTaskBtn');
const backBtn = document.getElementById('backBtn');

// Modals
const categoryModal = document.getElementById('categoryModal');
const taskModal = document.getElementById('taskModal');
const confirmModal = document.getElementById('confirmModal');

// Category Modal Elements
const categoryModalTitle = document.getElementById('categoryModalTitle');
const categoryNameInput = document.getElementById('categoryName');
const saveCategoryBtn = document.getElementById('saveCategoryBtn');
const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');

// Task Modal Elements
const taskModalTitle = document.getElementById('taskModalTitle');
const taskTitleInput = document.getElementById('taskTitle');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');

// Confirm Modal Elements
const confirmMessage = document.getElementById('confirmMessage');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');

// Initialize app
init();

async function init() {
  setupEventListeners();
  await loadCategories();
}

function setupEventListeners() {
  // Navigation
  addCategoryBtn.addEventListener('click', () => openCategoryModal());
  addTaskBtn.addEventListener('click', () => openTaskModal());
  backBtn.addEventListener('click', showCategoriesView);
  
  // Category Modal
  saveCategoryBtn.addEventListener('click', saveCategory);
  cancelCategoryBtn.addEventListener('click', closeCategoryModal);
  
  // Task Modal
  saveTaskBtn.addEventListener('click', saveTask);
  cancelTaskBtn.addEventListener('click', closeTaskModal);
  
  // Confirm Modal
  confirmYesBtn.addEventListener('click', handleConfirmYes);
  confirmNoBtn.addEventListener('click', closeConfirmModal);
  
  // Enter key support
  categoryNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      saveCategory();
    }
  });
  taskTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      saveTask();
    }
  });
  
  // Global Enter key for confirm dialog
  document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !confirmModal.classList.contains('hidden')) {
      e.preventDefault();
      handleConfirmYes();
    }
  });
  
  // Close modals on background click
  categoryModal.addEventListener('click', (e) => {
    if (e.target === categoryModal) closeCategoryModal();
  });
  taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) closeTaskModal();
  });
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeConfirmModal();
  });
}

// Categories Functions
async function loadCategories() {
  const result = await window.electronAPI.getCategories();
  
  if (result.success) {
    renderCategories(result.data);
  } else {
    console.error('Error loading categories:', result.error);
  }
}

function renderCategories(categories) {
  categoriesGrid.innerHTML = '';
  
  if (categories.length === 0) {
    categoriesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">●</div>
        <p>NO CATEGORIES YET!<br>PRESS THE BUTTON TO START YOUR JOURNEY!</p>
      </div>
    `;
    return;
  }
  
  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-card-header">
        <div class="category-icon">★</div>
        <div class="category-actions">
          <button class="icon-btn edit-btn" data-id="${category._id}">✎</button>
          <button class="icon-btn delete-btn" data-id="${category._id}">✕</button>
        </div>
      </div>
      <h3 class="category-name">${escapeHtml(category.name)}</h3>
    `;
    
    // Store the category ID and name on the card
    const catId = category._id;
    const catName = category.name;
    
    // Click on card to view tasks
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('icon-btn')) {
        showTasksView(catId, catName);
      }
    });
    
    // Edit button
    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCategoryModal({ _id: catId, name: catName });
    });
    
    // Delete button
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmDialog(
        'DELETE THIS CATEGORY AND ALL ITS TASKS?',
        () => deleteCategory(catId)
      );
    });
    
    categoriesGrid.appendChild(card);
  });
}

function openCategoryModal(category = null) {
  currentEditId = category ? category._id : null;
  categoryModalTitle.textContent = category ? 'EDIT CATEGORY' : 'NEW CATEGORY';
  categoryNameInput.value = category ? category.name : '';
  categoryModal.classList.remove('hidden');
  categoryNameInput.focus();
}

function closeCategoryModal() {
  categoryModal.classList.add('hidden');
  currentEditId = null;
  categoryNameInput.value = '';
}

async function saveCategory() {
  const name = categoryNameInput.value.trim();
  
  if (!name) {
    alert('Please enter a category name!');
    return;
  }
  
  if (currentEditId) {
    // Confirm edit
    showConfirmDialog(
      'SAVE CHANGES TO THIS CATEGORY?',
      async () => {
        console.log('Updating category:', currentEditId, 'with name:', name);
        const result = await window.electronAPI.updateCategory(currentEditId, { name });
        if (result.success) {
          console.log('Category updated successfully');
          closeCategoryModal();
          await loadCategories();
        } else {
          console.error('Error updating category:', result.error);
          alert('Error updating category: ' + result.error);
        }
      }
    );
  } else {
    // Confirm create new
    showConfirmDialog(
      'CREATE THIS NEW CATEGORY?',
      async () => {
        const result = await window.electronAPI.createCategory({ name });
        if (result.success) {
          closeCategoryModal();
          await loadCategories();
        } else {
          console.error('Error creating category:', result.error);
          alert('Error creating category: ' + result.error);
        }
      }
    );
  }
}

async function deleteCategory(id) {
  console.log('Deleting category with ID:', id);
  const result = await window.electronAPI.deleteCategory(id);
  if (result.success) {
    console.log('Category deleted successfully');
    await loadCategories();
  } else {
    console.error('Error deleting category:', result.error);
    alert('Error deleting category: ' + result.error);
  }
}

// Tasks Functions
async function showTasksView(categoryId, categoryName) {
  currentCategoryId = categoryId;
  currentView = 'tasks';
  categoryTitle.textContent = categoryName.toUpperCase();
  categoriesView.classList.add('hidden');
  tasksView.classList.remove('hidden');
  await loadTasks();
}

function showCategoriesView() {
  currentView = 'categories';
  currentCategoryId = null;
  tasksView.classList.add('hidden');
  categoriesView.classList.remove('hidden');
}

async function loadTasks() {
  const result = await window.electronAPI.getTasks(currentCategoryId);
  
  if (result.success) {
    renderTasks(result.data);
  } else {
    console.error('Error loading tasks:', result.error);
  }
}

function renderTasks(tasks) {
  tasksList.innerHTML = '';
  
  if (tasks.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚡</div>
        <p>NO TASKS YET!<br>ADD YOUR FIRST TASK TO GET STARTED!</p>
      </div>
    `;
    return;
  }
  
  // Sort tasks: incomplete first, then completed
  tasks.sort((a, b) => a.completed - b.completed);
  
  tasks.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    item.innerHTML = `
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task._id}"></div>
      <div class="task-content">
        <h4 class="task-title">${escapeHtml(task.title)}</h4>
      </div>
      <div class="task-actions">
        <button class="icon-btn edit-btn" data-id="${task._id}">✎</button>
        <button class="icon-btn delete-btn" data-id="${task._id}">✕</button>
      </div>
    `;
    
    // Store task data for closures
    const taskId = task._id;
    const taskTitle = task.title;
    const taskCompleted = task.completed;
    
    // Checkbox toggle
    const checkbox = item.querySelector('.task-checkbox');
    checkbox.addEventListener('click', () => {
      showConfirmDialog(
        taskCompleted ? 'MARK THIS TASK AS INCOMPLETE?' : 'MARK THIS TASK AS COMPLETE?',
        () => toggleTaskComplete(taskId, !taskCompleted)
      );
    });
    
    // Edit button
    const editBtn = item.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
      openTaskModal({ _id: taskId, title: taskTitle });
    });
    
    // Delete button
    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      showConfirmDialog(
        'DELETE THIS TASK?',
        () => deleteTask(taskId)
      );
    });
    
    tasksList.appendChild(item);
  });
}

function openTaskModal(task = null) {
  currentEditId = task ? task._id : null;
  taskModalTitle.textContent = task ? 'EDIT TASK' : 'NEW TASK';
  taskTitleInput.value = task ? task.title : '';
  taskModal.classList.remove('hidden');
  taskTitleInput.focus();
}

function closeTaskModal() {
  taskModal.classList.add('hidden');
  currentEditId = null;
  taskTitleInput.value = '';
}

async function saveTask() {
  const title = taskTitleInput.value.trim();
  
  if (!title) {
    alert('Please enter a task title!');
    return;
  }
  
  if (currentEditId) {
    // Confirm edit
    showConfirmDialog(
      'SAVE CHANGES TO THIS TASK?',
      async () => {
        console.log('Updating task:', currentEditId, 'with title:', title);
        const result = await window.electronAPI.updateTask(currentEditId, { title });
        if (result.success) {
          console.log('Task updated successfully');
          closeTaskModal();
          await loadTasks();
        } else {
          console.error('Error updating task:', result.error);
          alert('Error updating task: ' + result.error);
        }
      }
    );
  } else {
    // Confirm create new
    showConfirmDialog(
      'CREATE THIS NEW TASK?',
      async () => {
        const result = await window.electronAPI.createTask({
          categoryId: currentCategoryId,
          title
        });
        if (result.success) {
          closeTaskModal();
          await loadTasks();
        } else {
          console.error('Error creating task:', result.error);
          alert('Error creating task: ' + result.error);
        }
      }
    );
  }
}

async function toggleTaskComplete(id, completed) {
  console.log('Toggling task:', id, 'to completed:', completed);
  const result = await window.electronAPI.toggleTaskComplete(id, completed);
  if (result.success) {
    console.log('Task toggled successfully');
    await loadTasks();
  } else {
    console.error('Error toggling task:', result.error);
    alert('Error toggling task: ' + result.error);
  }
}

async function deleteTask(id) {
  console.log('Deleting task with ID:', id);
  const result = await window.electronAPI.deleteTask(id);
  if (result.success) {
    console.log('Task deleted successfully');
    await loadTasks();
  } else {
    console.error('Error deleting task:', result.error);
    alert('Error deleting task: ' + result.error);
  }
}

// Confirmation Dialog
function showConfirmDialog(message, callback) {
  confirmMessage.textContent = message;
  confirmCallback = callback;
  confirmModal.classList.remove('hidden');
  // Focus on YES button so Enter key works immediately
  setTimeout(() => confirmYesBtn.focus(), 0);
}

function closeConfirmModal() {
  confirmModal.classList.add('hidden');
  confirmCallback = null;
}

function handleConfirmYes() {
  if (confirmCallback) {
    confirmCallback();
  }
  closeConfirmModal();
}

// Helper Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
