import { toDoList } from "./todo.js";

const todoInput = document.getElementById("todoInput");
const insertButton = document.getElementById("insertButton");
const todo = toDoList(document.getElementById("todoList"));


todo.load().then(() => {
    todoInput.value = "";
});

// Aggiorna la lista ogni 30 secondi
setInterval(() => {
    todo.load().then(() => {
        todoInput.value = "";
    }).catch(error => {
        console.error(error);
    });
}, 30000);


insertButton.onclick = () => {
    const task = {
        name: todoInput.value,
        completed: false
    };

    todo.send({ todo: task })
        .then(() => todo.load())
        .then(() => {
            todoInput.value = "";
        })
        .catch(error => {
            console.error(error);
        });
};
