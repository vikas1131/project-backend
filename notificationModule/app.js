const express = require('express');
const notificationRouter = require('./src/route/notificationRoute');
const hazardRouter = require('./src/route/hazardRoute');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

//app.use(cors({ origin: "http://54.88.31.60:80", credentials: true }));

app.use(cors({
    origin: '*',  // Allow all origins (you can specify allowed origins)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());


app.use('/api/notifications', notificationRouter);
app.use("/api/hazards", hazardRouter);

app.get('/error/:message', (req, res) => {
    throw new Error(req.params.message);
})

module.exports = app;