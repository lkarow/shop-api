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

mongoose.connect('mongodb://localhost:27017/shoeShopDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(`${req.body.Username} already exists`);
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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
});

/**
 * Get data of a user
 * Endpoint: /users/[username]
 * HTTP method: GET
 * @returns JSON object hodling user data
 */
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => res.json(user))
    .catch((error) => {
      console.error(error);
      res.status(500).send(`Error: ${error}`);
    });
});

/**
 * Update user data
 * Endpoint: /users/[username]
 * HTTP method: PUT
 * Request body: JSON object hodling new user data
 * @returns JSON object holding user data
 */
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
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
});

/**
 * Delete user account
 * Endpoint: /users/[username]
 * HTTP method: DELETE
 * @returns {string} text message
 */
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) res.status(400).send(`${req.params.Username} was not found`);
      if (user) res.status(200).send(`${req.params.Username} was deleted`);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(`Error: ${error}`);
    });
});

/**
 * Add item to cart
 * Endpoint: /users/[username]/items/[item ID]
 * HTTP method: POST
 * @returns JSON object holding user data
 */
app.post('/users/:Username/items/:ItemID', (req, res) => {
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
});

/**
 * Delete item from cart
 * Endpoint: /users/[username]/items/[item ID]
 * HTTP method: delete
 * @returns JSON object holding user data
 */
app.delete('/users/:Username/items/:ItemID', (req, res) => {
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
});

app.use(express.static('public'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Server is listening on port 8080.');
});
