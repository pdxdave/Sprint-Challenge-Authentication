const axios = require('axios');

// Bring in jsonwebtokens and .env secret
const jwt = require('jsonwebtoken');
const secret = require('./secrets')

// Bring in bycrypt for password hashing and password confirmation
const bcrypt = require('bcryptjs');

// Bring in database link
const database = require('../database/dbConfig');

// This brings in the functionality for token authentication
// It tests the token athenticity in the header
const { authenticate } = require('../auth/authenticate');



// This function is for creating a token
function generateToken(user){
  const payload = {
      subject: user.id,
      username: user.username
  };
  
  // This sets the expiration time for the token. I have 8 hours
  const options = {
      expiresIn: '8h'
  }
  
  // This is the three parts of the JSON web token
   return jwt.sign(payload, secret.jwtSecret, options)
 
}



module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};



// REGISTER A NEW USER
function register(req, res) {
  // implement user registration
  // Get the username and password from the form
  let {username, password} = req.body;

  // Check if username and password exist. If not, create a hash
  if(username && password) {
    // password set to a multiplier strenth of 12
    const hash = bcrypt.hashSync(password, 12)
    password = hash;

    // Access the database to insert a new user
    database("users")
    .insert({username, password})
    .then(id => {
      res.status(200).json({
        message: 'You apparently like dad jokes'
      })
    })
    .catch(err => {
      res.status(400).json({
        message: 'This user name has already been claimed'
      })
    })
  } else {
    res.status(500).json(err)
  }
}

// USER LOGIN
function login(req, res) {
  // implement user login

  // Get the username and password from the form or Postman
  let {username, password} = req.body;

  // If there is a username and password, begin to check database
  if(username && password){
    // Access database
    database("users")
    .where({username})
    // Get first username that matches
    .first()

    // Begin verification
    .then(user => {
      if(user && bcrypt.compareSync(password, user.password)){
        // Create a Token if there is a match
        const token = generateToken(user)

        // Set status to OK and reply with greeting
        res.status(200).json({
          message: `Hi there ${user.username}`, token
        })
      } else {
        res.status(401).json({
          message: "You login information is incorrect"
        })
      }
    })
    .catch(err => {
      res.status(500).json(err)
    });
  } else {
    res.status(400).json({
      message: "You forgot the username and password"
    })
  }
}


// This code was already provided.  I did not touch it
function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
