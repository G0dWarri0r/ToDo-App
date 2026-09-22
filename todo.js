// VARIABLES
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoButton = document.querySelector("#todo-button");
const todoList = document.querySelector("#todo-list");
const inputError = document.querySelector("#error-msg");
const todoTask = document.querySelector("#todo-task");
const todoStatus = document.querySelector("#todo-completion");

// LIST OF TODOS
let todos = JSON.parse(localStorage.getItem("todos")) || [];
todoStatus.textContent = `Completed:${completeTodos()}`
todoTask.textContent = `Tasks:${todos.length}`;

let oldIds = [];

// EVENT HANDLING
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const isEditing = todos.find((todo) => {
        if (todo.editing === true) {
            return todo;
        }
    });
    const noObject = typeof isEditing
    if (noObject === "undefined") {
        addNewTodo(todos);
    }
    if (noObject !== "undefined") {
        todos = editTodoLogic(todos, isEditing.id);
        todoList.innerHTML = "";
        renderTodo();
    }
    todoTask.textContent = `Tasks:${todos.length}`;
});

todoList.addEventListener("click", (e) => {
    // FOR MODIFICATION
    todos = modifyTodo(e, todos, oldIds);
    // STATUS CHANGE
    todos = completeStatus(e, todos);
    todoStatus.textContent = `Completed:${completeTodos()}`
    todoTask.textContent = `Tasks:${todos.length}`;
});

// FUNCTIONS

function completeTodos() {
    let completeTodos = 0;
    todos.forEach((todo) => {
        if (todo.complete === true) {
            completeTodos += 1;
        }
    });
    return completeTodos;
}

function newIds() {
    const idCount = (Math.floor(Math.random() * 100) + 1);
    return idCount;
}

function addNewTodo(todos) {
    const todoValue = todoInput.value;
    if (todoValue.trim() === "") {
        inputError.textContent = "Task required!"
        inputError.classList.remove('hidden');
    }
    else {
        let execute = todos.find((todo) => {
            if (todo.task === todoValue) {
                return todo;
            }
        });
        if (typeof execute === "undefined") {
            inputError.classList.add('hidden');
            const newId = newIds();
            const newTodo = { id: newId, task: todoValue, complete: false, editing: false }
            todos.push(newTodo);
            addTodo(newTodo.task, newTodo.id, newTodo.complete);
            localStorage.setItem("todos", JSON.stringify(todos));
        }
        else inputError.textContent = "Task already exists!", inputError.classList.remove('hidden');
    }

}

function renderTodo() {
    todos.forEach(function (todo) {
        addTodo(todo.task, todo.id, todo.complete, todo);
    });
}

function addTodo(todoValue, todoId, todoStatus) {
    const li = document.createElement("li");
    li.className = "flex gap-2 justify-between p-2 border border-slate-300 rounded-md m-1 hover:border-slate-500 transition-all duration-200";
    li.innerHTML =
        `<input data-id=${todoId} ${todoStatus === true ? "checked" : ""} type="checkbox">
        <p ${todoStatus === true ? 'style="text-decoration: line-through; color: red;"' : ''} class="flex-1">${todoValue}</p>
        <div class="flex gap-2">
            <button data-id=${todoId} data-action="edit" class="bg-amber-300 px-2 rounded-sm" type="submit">Edit</button>
            <button data-id=${todoId} data-action="delete" class="bg-red-400 hover:bg-red-500 px-2 rounded-sm transition-all duration-200" type="submit">Delete</button>
        </div>`;
    todoList.append(li);
}

function editTodoUi(todos, id, button, oldIds) {
    let currentTodo = todos.find((todo) => {
        if (todo.id === Number(id)) {
            todo.editing = !todo.editing;
            return todo;
        }
    });
    todoInput.value = currentTodo.task;
    todos = todos.forEach((todo) => {
        if (todo.editing === true && todo.id !== currentTodo.id) {
            todo.editing = false;
        }
    });
    // CHANGING BUTTONS
    if (currentTodo.editing === false) {
        todoInput.value = "";
        todoButton.textContent = "Add";
        button.textContent = "Edit";
        button.classList.remove("bg-red-300");
        button.classList.add("bg-amber-300");
    }
    else if (currentTodo.editing === true) {
        todoButton.textContent = "Edit";
        button.textContent = "Cancle";
        button.classList.add("bg-red-300");
    }
    else if (typeof currentTodo === "undefined") {
        return;
    }
    if (oldIds.length > 2) {
        oldIds.shift();
    }
    if (oldIds.length >= 2 && oldIds[0] !== oldIds[1]) {
        const btn = document.querySelector(`button[data-id="${oldIds[0]}"]`)
        btn.textContent = "Edit";
        btn.classList.remove("bg-red-300");
        btn.classList.add('bg-amber-300');
    }
}

function editTodoLogic(todos, id) {
    let currentTodo = todos.find((todo) => {
        if (todo.id === Number(id)) {
            return todo;
        }
    });
    currentTodo.task = todoInput.value;
    todos = todos.map((todo) => {
        if (todo.id === currentTodo.id) {
            return {
                ...todo,
                task: currentTodo.task,
                editing: false
            }
        }
        return todo;
    });
    todoButton.textContent = "Add";
    todoInput.value = "";
    localStorage.setItem("todos", JSON.stringify(todos));
    return todos;
}

function deleteTodo(e, todos, id, oldIds) {
    e.target.closest('li').remove();
    todoButton.textContent = "Add";
    if (oldIds[0] === oldIds[1]) {
        oldIds.pop();
    }
    oldIds.pop();
    todoInput.value = "";
    todos = todos.filter((todo) => {
        if (todo.id !== Number(id)) {
            return todo;
        }
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    return todos;
}

function modifyTodo(e, todos, oldIds) {
    inputError.classList.add('hidden');
    let button = e.target.closest("button");
    let action = button?.dataset?.action;
    let id = button?.dataset?.id;
    if (action === "edit") {
        oldIds.push(id);
        editTodoUi(todos, id, button, oldIds);
    }
    if (action === "delete") {
        todos = deleteTodo(e, todos, id, oldIds);
    }
    localStorage.setItem("todos", JSON.stringify(todos));
    return todos;
}

function completeStatus(e, todos) {

    let checkbox = e.target.closest('input[type="checkbox"]');
    let id = checkbox?.dataset?.id;
    if (checkbox) {
        todos = todos.map((todo) => {
            e.target.closest('li').remove();
            if (todo.id === Number(id)) {
                addTodo(todo.task, todo.id, !todo.complete);
                return {
                    ...todo,
                    complete: !todo.complete
                }
            }
            return todo;
        });
    }
    localStorage.setItem("todos", JSON.stringify(todos));
    return todos;
}

// CALLING FUNCTIONS
renderTodo();