const express = require('express');
const taskRouter = require('./src/route/taskRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({ origin: "http://54.88.31.60:80", credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use("/api/tasks", taskRouter);

app.get('/error/:message', (req, res) => {
    throw new Error(req.params.message);
})

module.exports = app;