'use strict';
const PORT = process.env.PORT || 8000;
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
//--------------------------------------------------------------------------------
const dbAgent = require('./modules/db-agent');
//--------------------------------------------------------------------------------
app.use(bodyParser.json());
app.use(methodOverride());
app.use((req,res,next) => {
    console.log(`${new Date} : ${req.url}`);
    next();
});

app.get('/', loadStartPage);
dbAgent.restifyDB(router,onError);

app.use(router);
app.use(onError);
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
//--------------------------------------------------------------------------------
function loadStartPage(req, res, next) {
    res.sendFile(`${__dirname}/index.html`, err => next(err));
}
//--------------------------------------------------------------------------------
function onError(err, req, res, next) {
    res.status(500);
    res.json({
        errorMessage: err.message,
        stack: err.stack
    });
}
