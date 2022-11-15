// Set up Express
const express = require('express');
const app = express();

// body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Integrate Mongoose
const mongoose = require('mongoose');
const Models = require('./model.js');
const Items = Models.Item;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Mongoose connect locally
// mongoose.connect('mongodb://localhost:27017/shoeShopDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// express-validator
const { body, validationResult } = require('express-validator');

// CORS
const cors = require('cors');
let whitelist = ['http://localhost:3000', 'http://localhost:1234'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to the store.');
});

/**
 * Get data of all items
 * Endpoint: /items
 * HTTP method: GET
 * @returns JSON object hodling data of all items
 */
app.get('/items', (req, res) => {
  Items.find()
    .then((items) => {
      res.status(201).json(items);
    })
    .catch((error) => {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    });
});

/**
 * Get data of a single item
 * Endpoint: /items/[item ID]
 * HTTP method: GET
 * @returns JSON object holding the data of the item
 */
app.get('/items/:ItemID', (req, res) => {
  Items.findById({ _id: req.params.ItemID })
    .then((item) => {
      res.status(201).json(item);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(`Error: ${error}`);
    });
});

/**
 * Add new user
 * Endpoint: /users
 * HTTP method: POST
 * @returns JSON object holding user data
 */
app.post(
  '/users',
  // Validation
  body(
    'Username',
    'The username is required and must be at least 3 characters long'
  ).isLength({ min: 3 }),
  body(
    'Username',
    'Usernames may only contain alphanumeric characters'
  ).isAlphanumeric(),
  body(
    'Password',
    'Password is required and must be at least 4 characters long'
  ).isLength({ min: 4 }),
  body('Email', 'Email is required').isEmail(),
  (req, res) => {
    // Check Validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Hash password before storing it in the database
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(`${req.body.Username} already exists`);
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => res.status(201).json(user))
            .catch((error) => {
              console.error(error);
              res.status(500).send(`Error: ${error}`);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error: ${error}`);
      });
  }
);

/**
 * Get data of a user
 * Endpoint: /users/[username]
 * HTTP method: GET
 * @returns JSON object hodling user data
 */
app.get(
  '/users/:Username',
  // Authenticate user for this endpoint
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => res.json(user))
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error: ${error}`);
      });
  }
);

/**
 * Update user data
 * Endpoint: /users/[username]
 * HTTP method: PUT
 * Request body: JSON object hodling new user data
 * @returns JSON object holding user data
 */
app.put(
  '/users/:Username',
  // Authenticate user for this endpoint
  passport.authenticate('jwt', { session: false }),
  // Validation
  body(
    'Username',
    'The username is required and must be at least 3 characters long'
  ).isLength({ min: 3 }),
  body(
    'Username',
    'Usernames may only contain alphanumeric characters'
  ).isAlphanumeric(),
  body(
    'Password',
    'Password is required and must be at least 4 characters long'
  ).isLength({ min: 4 }),
  body('Email', 'Email is required').isEmail(),
  (req, res) => {
    // Check Validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Hash password before storing it in the database
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send(`Error: ${error}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Delete user account
 * Endpoint: /users/[username]
 * HTTP method: DELETE
 * @returns {string} text message
 */
app.delete(
  '/users/:Username',
  // Authenticate user for this endpoint
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) res.status(400).send(`${req.params.Username} was not found`);
        if (user) res.status(200).send(`${req.params.Username} was deleted`);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error: ${error}`);
      });
  }
);

/**
 * Add item to cart
 * Endpoint: /users/[username]/items/[item ID]
 * HTTP method: POST
 * @returns JSON object holding user data
 */
app.post(
  '/users/:Username/items/:ItemID',
  // Authenticate user for this endpoint
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { Cart: req.params.ItemID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send(`Error: ${error}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Delete item from cart
 * Endpoint: /users/[username]/items/[item ID]
 * HTTP method: delete
 * @returns JSON object holding user data
 */
app.delete(
  '/users/:Username/items/:ItemID',
  // Authenticate user for this endpoint
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { Cart: req.params.ItemID } },
      { new: true }, // This line makes sure that the updated document is returned
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send(`Error: ${error}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

app.use(express.static('public'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server is listening on port ${port}.`));

module.exports = app;
