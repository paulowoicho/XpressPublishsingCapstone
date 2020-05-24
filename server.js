//setup step
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4001; //listen on port 4001

const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

app.use(cors());
app.use(bodyParser.json());
app.use(errorHandler());
app.use(morgan('dev'));

app.use(express.static('public'));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);


//start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = app;