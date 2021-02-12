const express = require('express');

const app = express();

function routes() {
    app.use('trust proxy');
    app.use('/api/v1', require('./routes/api'))
}

routes();

app.listen(process.env.SERVER_PORT, function(err) {console.log("Server started on " + process.env.SERVER_PORT);})