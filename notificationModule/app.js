const express = require('express');
const notificationRouter = require('./src/route/notificationRoute');
const hazardRouter = require('./src/route/hazardRoute');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

//app.use(cors({ origin: "http://54.88.31.60:80", credentials: true }));

app.use(cors({
    origin: '*',  // Allow requests from any domain (for testing)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role','X-User-Email'],  // Explicitly allow x-user-role
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());


app.use('/api/notifications', notificationRouter);
app.use("/api/hazards", hazardRouter);

app.get('/error/:message', (req, res) => {
    throw new Error(req.params.message);
})

module.exports = app;