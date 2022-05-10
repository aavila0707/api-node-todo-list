const express = require("express");
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const path = require("path");


const app = express();

// MIDDLEWARE
app.use(express.static(path.resolve(__dirname, "./client/build")));
app.use(express.json());


// MONGOOSE
const db = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  port: process.env.PORT,
};
const uri = `mongodb+srv://${db.user}:${db.password}@fruitscluster.psgd0.mongodb.net/${db.name}?retryWrites=true&w=majority`;
mongoose.connect(uri, (err) => {
  err ? console.log(err) : console.log("successfully connected to DB");
});

// SCHEMAS & MODEL
const TaskSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  finished: {
    type: Boolean,
    default: false,
  },
  editing: {
    type: Boolean,
    default: false,
  },
});
const Task = mongoose.model("Task", TaskSchema);

// CREATE TASK
app.post("/tasks", (req, res) => {
  const task = new Task({
    name: req.body.name,
    description: req.body.description,
    finished: false,
    editing: false,
  });
  task
    .save()
    .then((data) => res.json(data))
    .catch((err) => {
      console.log("error: ", err);
      res.json({ message: err });
    });
});

// READ ALL TASKS
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (err) {
    res.json({ message: err });
  }
});

// UPDATE ONE ELEMENT FROM THE DB
app.patch("/tasks/:taskId", async (req, res) => {
  try {
    const updatedTask = await Task.updateOne(
      { _id: req.params.taskId },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          finished: req.body.finished,
          editing: req.body.editing,
        },
      }
    );
    res.json(updatedTask);
  } catch (err) {
    res.json({ message: err });
  }
});

// DELETE A TASK
app.delete("/tasks/:taskId", async (req, res) => {
  try {
    const removedTask = await Task.deleteOne({ _id: req.params.taskId });
    res.json(removedTask);
  } catch (err) {
    res.json({ message: err });
  }
});

// LOAD THE APP
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  //   res.send("u there");
});

// LISTEN
const port = process.env.PORT;
app.listen(port, () => {
  console.log(db);
  console.log(`server started on port ${port}`);
});
