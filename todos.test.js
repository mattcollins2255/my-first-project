import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  filterTodos,
  progress,
  starterTodos,
  STARTER_TODOS,
  exportTodos,
  exportFilename,
} from "./todos.js";

test("addTodo adds a trimmed, not-done item", () => {
  const todos = addTodo([], "  Learn git  ");
  assert.equal(todos.length, 1);
  assert.equal(todos[0].text, "Learn git");
  assert.equal(todos[0].done, false);
});

test("addTodo ignores empty or whitespace-only text", () => {
  const start = [];
  assert.equal(addTodo(start, ""), start);
  assert.equal(addTodo(start, "   "), start);
  assert.equal(addTodo(start, undefined), start);
});

test("addTodo does not modify the original array", () => {
  const start = [];
  addTodo(start, "Something");
  assert.equal(start.length, 0);
});

test("each todo gets a unique id", () => {
  let todos = addTodo([], "a");
  todos = addTodo(todos, "b");
  assert.notEqual(todos[0].id, todos[1].id);
});

test("toggleTodo flips only the matching item", () => {
  let todos = addTodo(addTodo([], "a"), "b");
  todos = toggleTodo(todos, todos[0].id);
  assert.equal(todos[0].done, true);
  assert.equal(todos[1].done, false);
  todos = toggleTodo(todos, todos[0].id);
  assert.equal(todos[0].done, false);
});

test("deleteTodo removes only the matching item", () => {
  const todos = addTodo(addTodo([], "a"), "b");
  const result = deleteTodo(todos, todos[0].id);
  assert.deepEqual(result.map((t) => t.text), ["b"]);
});

test("clearCompleted removes finished items", () => {
  let todos = addTodo(addTodo([], "a"), "b");
  todos = toggleTodo(todos, todos[1].id);
  assert.deepEqual(clearCompleted(todos).map((t) => t.text), ["a"]);
});

test("filterTodos supports all, active, and done", () => {
  let todos = addTodo(addTodo([], "a"), "b");
  todos = toggleTodo(todos, todos[0].id);
  assert.equal(filterTodos(todos, "all").length, 2);
  assert.deepEqual(filterTodos(todos, "active").map((t) => t.text), ["b"]);
  assert.deepEqual(filterTodos(todos, "done").map((t) => t.text), ["a"]);
});

test("progress counts done items and handles an empty list", () => {
  assert.deepEqual(progress([]), { done: 0, total: 0, percent: 0 });
  let todos = addTodo(addTodo(addTodo([], "a"), "b"), "c");
  todos = toggleTodo(todos, todos[0].id);
  assert.deepEqual(progress(todos), { done: 1, total: 3, percent: 33 });
});

test("starterTodos returns the learning checklist, all not done", () => {
  const todos = starterTodos();
  assert.equal(todos.length, STARTER_TODOS.length);
  assert.ok(todos.every((t) => t.done === false));
});

test("exportTodos produces readable JSON with text, done, and progress", () => {
  let todos = addTodo(addTodo([], "a"), "b");
  todos = toggleTodo(todos, todos[0].id);
  const date = new Date("2026-10-11T12:00:00Z");
  const data = JSON.parse(exportTodos(todos, date));
  assert.equal(data.exportedAt, "2026-10-11T12:00:00.000Z");
  assert.deepEqual(data.progress, { done: 1, total: 2, percent: 50 });
  assert.deepEqual(data.todos, [
    { text: "a", done: true },
    { text: "b", done: false },
  ]);
});

test("exportFilename includes the date", () => {
  assert.equal(exportFilename(new Date("2026-10-11T12:00:00Z")), "todo-list-2026-10-11.json");
});
