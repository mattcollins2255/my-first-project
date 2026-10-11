// Browser glue: connects the pure logic in todos.js to the page and localStorage.
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  filterTodos,
  progress,
  starterTodos,
  exportTodos,
  exportFilename,
  importTodos,
} from "./todos.js";

const STORAGE_KEY = "agentic-ai-todos";

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {
    // Storage unavailable or corrupted: fall back to the starter list.
  }
  return starterTodos();
}

function save(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore: the app still works, it just won't remember changes.
  }
}

let todos = load();
let filter = "all";

const form = document.querySelector("#new-todo-form");
const input = document.querySelector("#new-todo");
const list = document.querySelector("#todo-list");
const summary = document.querySelector("#summary");
const bar = document.querySelector("#progress-bar");
const filterButtons = document.querySelectorAll("[data-filter]");
const clearButton = document.querySelector("#clear-completed");
const resetButton = document.querySelector("#reset");
const exportButton = document.querySelector("#export");
const importButton = document.querySelector("#import");
const importFile = document.querySelector("#import-file");

function update(newTodos) {
  todos = newTodos;
  save(todos);
  render();
}

function render() {
  list.replaceChildren(
    ...filterTodos(todos, filter).map((todo) => {
      const li = document.createElement("li");
      li.className = todo.done ? "done" : "";

      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.done;
      checkbox.addEventListener("change", () => update(toggleTodo(todos, todo.id)));
      const text = document.createElement("span");
      text.textContent = todo.text; // textContent (not innerHTML) keeps user input safe
      label.append(checkbox, text);

      const del = document.createElement("button");
      del.className = "delete";
      del.textContent = "×";
      del.setAttribute("aria-label", `Delete "${todo.text}"`);
      del.addEventListener("click", () => update(deleteTodo(todos, todo.id)));

      li.append(label, del);
      return li;
    })
  );

  const { done, total, percent } = progress(todos);
  summary.textContent = `${done} of ${total} done (${percent}%)`;
  bar.style.width = `${percent}%`;

  filterButtons.forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter))
  );
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  update(addTodo(todos, input.value));
  input.value = "";
  input.focus();
});

filterButtons.forEach((b) =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    render();
  })
);

clearButton.addEventListener("click", () => update(clearCompleted(todos)));

resetButton.addEventListener("click", () => {
  if (confirm("Replace your list with the starter checklist?")) update(starterTodos());
});

// Download the list as a JSON file by pointing a temporary link at an in-memory file.
exportButton.addEventListener("click", () => {
  const blob = new Blob([exportTodos(todos)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFilename();
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); // free the memory once the download starts
});

// The real file picker is a hidden <input type="file">; the visible button just opens it.
importButton.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", async () => {
  const file = importFile.files[0];
  importFile.value = ""; // reset so choosing the same file again still triggers "change"
  if (!file) return;
  try {
    const imported = importTodos(await file.text());
    const message =
      `Replace your current list (${todos.length} items) ` +
      `with the ${imported.length} items from "${file.name}"?`;
    if (confirm(message)) update(imported);
  } catch (error) {
    alert(`Couldn't import "${file.name}". ${error.message}`);
  }
});

render();
