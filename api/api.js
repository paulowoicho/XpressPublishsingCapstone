//necessary set up
const express = require('express');
const apiRouter = express.Router();

const artistRouter = require('./artists');
apiRouter.use('/artists', artistRouter);

const seriesRouter = require('./series');
apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;
