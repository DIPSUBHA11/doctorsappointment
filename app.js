const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/event')

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use('/', eventRoutes);
mongoose
    .connect(
        `mongodb+srv://subhadipbarik67:root@cluster0.xmv8xb2.mongodb.net/event?retryWrites=true&w=majority`
    )
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));