const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const configureRoutes = require('../config/routes.js');

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(logger)

// Test output
server.get('/', (req, res) => {
    res.send("This is my test page")
})

function logger(req, res, next){
    console.log(`${req.method} Request`)
}

configureRoutes(server);

module.exports = server;
