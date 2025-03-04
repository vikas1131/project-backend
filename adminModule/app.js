const express = require('express');
const adminRouter = require('./src/route/adminRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');



const app = express();

app.use(cors({ origin: "http://localhost:80", credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use("/api/admin", adminRouter);

app.get('/error/:message', (req, res) => {
    throw new Error(req.params.message);
})



module.exports = app;