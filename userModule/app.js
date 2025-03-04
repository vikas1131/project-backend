const express = require('express');
const userRouter = require('./src/route/userRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// app.use(cors());
app.use(cors({
    origin: '*',  // Allow requests from any domain (for testing)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role','X-User-Email'],  // Explicitly allow x-user-role
    credentials: true
}));

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