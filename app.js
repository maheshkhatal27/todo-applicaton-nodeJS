const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1- GET
//Returns list of all todos whose status is todo
///todos/?status=TO%20DO
app.get("/todos/", async (request, response) => {
  //if not searh_q will get default value
  //now look for request.qyery,not params

  const { search_q = "", status, priority } = request.query;

  const getAllTodoQuery = `
  SELECT * FROM todo WHERE status 
  like '%${status}%';`;

  const getHighPriorityQuery = `
 SELECT * FROM todo WHERE priority 
 like '%${priority}%';`;

  const getHighPrioAndInProgressQuery = `
SELECT * FROM todo WHERE status 
like '%${status}%' and priority 
 like '%${priority}%';`;

  //console.log(request.query);

  const getPlayTypeRecordsQuery = `
 SELECT * from todo WHERE todo like 
 '%${search_q}%';`;

  if (status === "TO DO") {
    const allToDoList = await db.all(getAllTodoQuery);
    response.send(allToDoList);
  } else if (status === "IN PROGRESS" && priority === "HIGH") {
    const listOfHighPrioritytodos = await db.all(getHighPrioAndInProgressQuery);
    response.send(listOfHighPrioritytodos);
  } else if (priority === "HIGH") {
    const listOfHighPrioritytodos = await db.all(getHighPriorityQuery);
    response.send(listOfHighPrioritytodos);
  } else if (search_q === "Play") {
    const playTypeRecords = await db.all(getPlayTypeRecordsQuery);
    response.send(playTypeRecords);
  }
});

//API 2 -GET
//Returns a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecificTodoQuery = `
        SELECT * FROM todo WHERE 
        id=${todoId};`;
  const todoItem = await db.get(getSpecificTodoQuery);
  response.send(todoItem);
});

//API 3-Create a todo in the todo table

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `
   INSERT INTO todo(id,todo,priority,status) 
   values (
       ${id},
       '${todo}',
       '${priority}',
       '${status}'
   );`;
  const addTodoResponse = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//API -4 Updates the details of a specific todo based on the todo ID

app.put("/todos/:todoId/", async (request, response) => {
  const { status, priority, todo } = request.body;
  const { todoId } = request.params;
  const updateStatusQuery = `
    UPDATE todo 
    SET status='${status}' 
    WHERE id=${todoId}`;

  const updatePriorityQuery = `
    UPDATE todo 
    SET priority='${priority}' 
    WHERE id=${todoId}`;

  const updateTodoQuery = `
    UPDATE todo 
    SET todo='${todo}' 
    WHERE id=${todoId}`;

  if (typeof status !== "undefined") {
    const updateStatusResponse = await db.run(updateStatusQuery);
    response.send("Status Updated");
  } else if (typeof priority !== "undefined") {
    const updateStatusResponse = await db.run(updatePriorityQuery);
    response.send("Priority Updated");
  } else if (typeof todo !== "undefined") {
    const updateStatusResponse = await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
});

//API-5 Deletes a todo from the todo table based on the todo ID

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id=${todoId};`;

  const deleteResponse = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
