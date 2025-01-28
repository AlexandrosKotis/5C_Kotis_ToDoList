export function toDoList(parentElement) {
   let todos = [];

   return {
      render: function () {
         let html = "";
         html += todos.map((e) => {
             if (!e.completed) {
                 return `<li class="list-group-item d-flex justify-content-between align-items-center">
                             <span>`+e.name+`</span>
                             <div>
                                 <button type="button" class="complete btn btn-success">Complete</button>
                                 <button type="button" class="delete btn btn-danger">Delete</button>
                             </div>
                         </li>`;
             } else {
                 return `<li class="list-group-item">
                             <span>`+e.name+`</span>
                             <div>
                                 <button type="button" class="complete btn btn-light"> Complete</button>
                                 <button type="button" class="delete btn btn-danger btn-sm">Delete</button>
                             </div>
                         </li>`;
             }
         }).join("");

         parentElement.innerHTML = `<ul class="list-group">`+html+`</ul>`;

         document.querySelectorAll(".complete").forEach((button, index) => {
             button.onclick = () => {
                 this.complete(todos[index]).then(() => this.load()).catch(console.error);
             };
         });

         document.querySelectorAll(".delete").forEach((button, index) => {
             button.onclick = () => {
                 this.delete(todos[index].id).then(() => this.load()).catch(console.error);
             };
         });
     },

       send: function (todo) {
           return fetch("/todo/add", {
               method: 'POST',
               headers: {
                   "Content-Type": "application/json"
               },
               body: JSON.stringify(todo)
           })
           .then(response => response.json())
           .catch(error => { throw error; });
       },

       load: function () {
           return fetch("/todo")
               .then(response => response.json())
               .then(json => {
                   todos = json.todos;
                   this.render();
                   return json;
               })
               .catch(error => { throw error; });
       },

       complete: function (todo) {
           return fetch("/todo/complete", {
               method: 'PUT',
               headers: {
                   "Content-Type": "application/json"
               },
               body: JSON.stringify(todo)
           })
           .then(response => response.json())
           .catch(error => { throw error; });
       },

       delete: function (id) {
           return fetch("/todo/"+ id, {
               method: 'DELETE',
               headers: {
                   "Content-Type": "application/json"
               }
           })
           .then(response => response.json())
           .catch(error => { throw error; });
       }
   };
}
