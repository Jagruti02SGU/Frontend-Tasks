function addTask(taskText, completed = false, dueDate = '') {
  const taskItem = document.createElement('li');
  taskItem.classList.add('task');
  taskItem.setAttribute('draggable', true);

  taskItem.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
    <span class="task-text" contenteditable="false">${taskText}</span>
    ${dueDate ? `<small class="due-date">Due: ${dueDate}</small>` : ''}
    <button class="edit-btn">
      <img src="img/edit.png" alt="edit" class="edit-icon" />
    </button>
    <button class="delete-btn">
      <img src="img/bin.png" alt="Delete" class="delete-icon" />
    </button>
  `;

  if (completed) {
    taskItem.classList.add('completed');
  }

  document.getElementById('task-list').appendChild(taskItem);
  addDragAndDropListeners(taskItem);
  saveTasks();
}


// Add Task Button
document.getElementById('add-task').addEventListener('click', () => {
  const taskInput = document.getElementById('new-task');
  const dueDateInput = document.getElementById('due-date');
  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (taskText !== '') {
    addTask(taskText, false, dueDate);
    taskInput.value = '';
    dueDateInput.value = '';
  }
});


// Handle Edit & Delete Buttons
document.getElementById('task-list').addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');

  // Delete Task
  if (deleteBtn) {
    deleteBtn.closest('li').remove();
    saveTasks();
  }

  // Edit Task
  if (editBtn) {
    const taskItem = editBtn.closest('li');
    const taskText = taskItem.querySelector('.task-text');
    const editIcon = editBtn.querySelector('img');

    const isEditing = taskText.getAttribute('contenteditable') === 'true';

    if (!isEditing) {
      taskText.setAttribute('contenteditable', 'true');
      taskText.focus();
      editIcon.src = 'img/save.png';
      editIcon.alt = 'Save';
    } else {
      taskText.setAttribute('contenteditable', 'false');
      editIcon.src = 'img/edit.png';
      editIcon.alt = 'Edit';
      saveTasks();
    }
  }
});


// Task Completion Toggle
document.getElementById('task-list').addEventListener('change', (e) => {
  if (e.target.classList.contains('task-checkbox')) {
    const task = e.target.closest('li');
    const isCompleted = e.target.checked;
    task.classList.toggle('completed', isCompleted);
    saveTasks();

    if (isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
});


// Settings Button = Toggle Theme + Icon
document.getElementById('settings-btn').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const icon = document.querySelector('#settings-btn img');
  const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);

  icon.src = theme === 'dark' ? 'img/moon.png' : 'img/sun.png'; // make sure these images exist
  icon.alt = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
});


// Load Theme on Page Load
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  const icon = document.querySelector('#settings-btn img');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (icon) {
      icon.src = 'img/moon.png';
      icon.alt = 'Dark Mode';
    }
  } else {
    if (icon) {
      icon.src = 'img/sun.png';
      icon.alt = 'Light Mode';
    }
  }
  // Set today's date as minimum allowed for due date input
const dueDateInput = document.getElementById('due-date');
const today = new Date().toISOString().split('T')[0];
dueDateInput.setAttribute('min', today);


  loadTasks();
});


// Save Tasks to Local Storage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll('#task-list li').forEach(task => {
    tasks.push({
      text: task.querySelector('.task-text').innerText,
      completed: task.querySelector('.task-checkbox').checked,
      dueDate: task.querySelector('.due-date')?.innerText.replace('Due: ', '') || ''
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}


// Load Tasks from Local Storage
function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  document.getElementById('task-list').innerHTML = '';
  savedTasks.forEach(task => {
    addTask(task.text, task.completed, task.dueDate);
  });
}


// Filter Tasks
document.getElementById('filter-all').addEventListener('click', () => {
  filterTasks('all');
});
document.getElementById('filter-completed').addEventListener('click', () => {
  filterTasks('completed');
});
document.getElementById('filter-pending').addEventListener('click', () => {
  filterTasks('pending');
});

function filterTasks(type) {
  const tasks = document.querySelectorAll('#task-list li');
  tasks.forEach(task => {
    const completed = task.classList.contains('completed');
    if (type === 'all') {
      task.style.display = 'flex';
    } else if (type === 'completed' && completed) {
      task.style.display = 'flex';
    } else if (type === 'pending' && !completed) {
      task.style.display = 'flex';
    } else {
      task.style.display = 'none';
    }
  });
}


// Drag & Drop Support
let draggedItem = null;

function addDragAndDropListeners(item) {
  item.addEventListener('dragstart', () => {
    draggedItem = item;
    setTimeout(() => item.style.display = 'none', 0);
  });

  item.addEventListener('dragend', () => {
    setTimeout(() => {
      item.style.display = 'flex';
      draggedItem = null;
      saveTasks();
    }, 0);
  });

  item.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  item.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (item !== draggedItem) {
      item.style.borderTop = '2px solid #4caf50';
    }
  });

  item.addEventListener('dragleave', () => {
    item.style.borderTop = 'none';
  });

  item.addEventListener('drop', (e) => {
    e.preventDefault();
    if (item !== draggedItem) {
      item.style.borderTop = 'none';
      const parent = document.getElementById('task-list');
      parent.insertBefore(draggedItem, item);
    }
  });
}
