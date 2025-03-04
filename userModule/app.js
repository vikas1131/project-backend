const express = require('express');
const userRouter = require('./src/route/userRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.use("/api/users", userRouter);

app.get('/error/:message', (req, res) => {
    throw new Error(req.params.message);
})

app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

app.get('/info', (req, res) => {
    res.json({
        app: 'USER_MODULE',
        status: 'UP',
        port: PORT
    });
});

module.exports = app;