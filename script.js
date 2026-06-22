// ==========================================
// 1. STATE MANAGEMENT & INITIALIZATION
// ==========================================
let todos = JSON.parse(localStorage.getItem('portfolio_todos')) || [];
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');

// ==========================================
// 2. CORE CRUD FUNCTIONS
// ==========================================

// CREATE
function addTodo(text) {
    const newTodo = {
        id: Date.now().toString(),
        text: text,
        completed: false
    };
    todos.push(newTodo);
    saveAndRender();
}

// READ / RENDER WITH FILTERING & DELEGATED EVENT LISTENERS
function renderTodos() {
    todoList.innerHTML = ''; // Clear previous elements

    // Filter logic (All, Active, Completed)
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all'
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li class="empty-state">No tasks found in this category!</li>`;
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);

        li.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} class="todo-checkbox" aria-label="Mark task as complete">
                <span class="todo-text" title="Click Edit button to modify">${todo.text}</span>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" aria-label="Edit task">Edit</button>
                <button class="delete-btn" aria-label="Delete task">Delete</button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

// UPDATE (Toggle Status & Inline Edit text)
function toggleTodo(id) {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveAndRender();
}

function editTodo(id, spanElement) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Turn span into an editable input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = todo.text;

    const parent = spanElement.parentElement;
    parent.replaceChild(input, spanElement);
    input.focus();

    // Save on Enter key or Blur (clicking away)
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText) {
            todo.text = newText;
            saveAndRender();
        } else {
            renderTodos(); // Revert back if empty
        }
    };

    input.addEventListener('keydown', (e) => { e.key === 'Enter' && saveEdit(); });
    input.addEventListener('blur', saveEdit);
}

// DELETE
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRender();
}

// LOCALSTORAGE PERSISTENCE
function saveAndRender() {
    localStorage.setItem('portfolio_todos', JSON.stringify(todos));
    renderTodos();
}

// ==========================================
// 3. EVENT HANDLING & DELEGATION
// ==========================================

// Form Submission Event
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    if (taskText) {
        addTodo(taskText);
        todoInput.value = '';
    }
});

// Event Delegation for Dinamically Created List Items Actions
todoList.addEventListener('click', (e) => {
    const todoItem = e.target.closest('.todo-item');
    if (!todoItem) return;
    const id = todoItem.getAttribute('data-id');

    if (e.target.classList.contains('todo-checkbox')) {
        toggleTodo(id);
    } else if (e.target.classList.contains('delete-btn')) {
        deleteTodo(id);
    } else if (e.target.classList.contains('edit-btn')) {
        const spanText = todoItem.querySelector('.todo-text');
        if (spanText) editTodo(id, spanText);
    }
});

// Filtering Control Setup
filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderTodos();
    });
});

// Initial Load execution
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
});