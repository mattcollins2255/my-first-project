// Pure to-do logic: no DOM, no storage. Every function returns a new array
// instead of changing the old one, which makes the code easy to test.

export const STARTER_TODOS = [
  "Install an AI coding agent (e.g. Claude Code)",
  "Ask the agent to explain an unfamiliar project",
  "Have the agent build a small feature, then read every line it wrote",
  "Ask the agent to write tests and run them",
  "Learn basic git: commit, diff, and undo changes",
  "Practice writing clear, specific prompts",
  "Review the agent's code before accepting it",
  "Deploy a project to the web",
];

let nextId = 1;
function makeId() {
  return `${Date.now().toString(36)}-${nextId++}`;
}

export function createTodo(text) {
  return { id: makeId(), text, done: false };
}

export function addTodo(todos, text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return todos;
  return [...todos, createTodo(trimmed)];
}

export function toggleTodo(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function deleteTodo(todos, id) {
  return todos.filter((t) => t.id !== id);
}

export function clearCompleted(todos) {
  return todos.filter((t) => !t.done);
}

export function filterTodos(todos, filter) {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "done") return todos.filter((t) => t.done);
  return todos;
}

export function progress(todos) {
  const done = todos.filter((t) => t.done).length;
  const total = todos.length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function starterTodos() {
  return STARTER_TODOS.map(createTodo);
}

export function exportTodos(todos, date = new Date()) {
  const data = {
    exportedAt: date.toISOString(),
    progress: progress(todos),
    todos: todos.map(({ text, done }) => ({ text, done })),
  };
  return JSON.stringify(data, null, 2);
}

export function exportFilename(date = new Date()) {
  return `todo-list-${date.toISOString().slice(0, 10)}.json`;
}

// Reads a file made by exportTodos and returns a fresh list of todos.
// Throws an Error with a friendly message if the file isn't a valid export.
export function importTodos(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const items = Array.isArray(data) ? data : data?.todos;
  if (!Array.isArray(items)) {
    throw new Error("That file doesn't look like an exported to-do list.");
  }
  const todos = items
    .filter((item) => typeof item?.text === "string" && item.text.trim())
    .map((item) => ({ ...createTodo(item.text.trim()), done: item.done === true }));
  if (items.length > 0 && todos.length === 0) {
    throw new Error("None of the items in that file have any text.");
  }
  return todos;
}
