# shop api

## Project description

This is a backend for a shop app. The REST API is built using Node.js and Express. The endpoints of the API can be accessed using HTTP methods (POST, GET, PUT, DELETE) to create, read, update and delete (CRUD) data from the database. The data is stored in a database using MongoDB and modeled for the app by Mongoose.

HTTP authentication is used to authenticate users when they log in to the application. It requires a username and password. The passwords are hashed with bcrypt. For all requests beyond the initial login, JWT JSON web token authentication is used.

## Dependencies

- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [body-parser](https://github.com/expressjs/body-parser)
- [CORS](https://github.com/expressjs/cors)
- [Express](https://github.com/expressjs/express)
- [express validator](https://github.com/express-validator/express-validator)
- [JsonWebToken](https://github.com/auth0/node-jsonwebtoken)
- [Morgan](https://github.com/expressjs/morgan)
- MongoDB
- Mongoose
- [Passport](https://github.com/jaredhanson/passport)
