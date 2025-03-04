const express = require('express');
const adminRouter = require('./src/route/adminRoutes');
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


app.use("/api/admin", adminRouter);

app.get('/error/:message', (req, res) => {
    throw new Error(req.params.message);
})



module.exports = app;