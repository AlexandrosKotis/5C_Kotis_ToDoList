const express = require("express");
const http = require("http");
const server = http.createServer(app);
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');
const conf = JSON.parse(fs.readFileSync('config.json'));
conf.ssl.ca = fs.readFileSync(__dirname + '/ca.pem');
const connection = mysql.createConnection(conf);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/", express.static(path.join(__dirname, "public")));


function executeQuery (sql)  {
   return new Promise((resolve, reject) => {      
         connection.query(sql, function (err, result) {
            if (err) {
               console.error(err);
               reject();     
            }   
            console.log('done');
            resolve(result);         
      });
   })
}


async function createTable  ()  {
   return await executeQuery(`
   CREATE TABLE IF NOT EXISTS todo
      ( id INT PRIMARY KEY AUTO_INCREMENT, 
         name VARCHAR(255) NOT NULL, 
         completed BOOLEAN ) 
      `);      
}

async function insert  (todo)  {
   const template = `
   INSERT INTO todo (name, completed) VALUES ('$NAME', '$COMPLETED')
      `;
   let sql = template.replace("$NAME", todo.name);
   sql = sql.replace("$COMPLETED", todo.completed);
   return await executeQuery(sql); 
}

async function update (todo){
   const template = `UPDATE todo SET completed = $COMPLETED WHERE id = $ID;`;
   let sql = template.replace("$ID", todo.id);
   sql = sql.replace("$COMPLETED", todo.completed ? 1 : 0);
   return await executeQuery(sql);
}

async function deleteQuery(todo){
   const template = `DELETE FROM todo WHERE id = $ID`;
   let sql = template.replace("$ID", todo.id);
   return await executeQuery(sql);
}

async function select  ()  {
   const sql = `
   SELECT id, name, completed FROM todo 
      `;
   return await executeQuery(sql); 
}

app.post("/todo/add", async (req, res) => {

   const todo = req.body.todo;
   await insert(todo);

   res.json({result: "Ok"});

});

app.get("/todo", async(req, res) => {
   const todos = await select();
   res.json({todos: todos});

});

app.put("/todo/complete", async (req, res) => {

   const todo = req.body;

   try {

      await(await select()).map((element) => {

         if (element.id === todo.id) {

            element.completed = true;

         }

         return element;

      })

   } catch (e) {

      console.log(e);

   }

   res.json({result: "Ok"});

});

app.delete("/todo/:id", async (req, res) => {
   const todos = await select();
   const todoDelete = todos.filter((element) => element.id !== req.params.id);
   await deleteQuery(todoDelete[0]);

   res.json({result: "Ok"});  

})

createTable();

server.listen(80, () => {
  console.log("- server running");
});