const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./model.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

// Define basic HTTP authentication for login requests
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    // If there's a match, the callback function will be executed
    (username, password, callback) => {
      Users.findOne({ Username: username }, (error, user) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
        // Pass error message to callback, if an error occurs, or if the username doesn't exist
        if (!user) {
          console.log('Incorrect username');
          return callback(null, false, {
            message: 'Inncorrect username or password',
          });
        }
        console.log('Finished');
        return callback(null, user);
      });
    }
  )
);

// Setting up JWT authentication
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'jwt_secret',
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
