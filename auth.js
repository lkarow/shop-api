const jwtSecret = 'jwt_secret';

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport');

/**
 * Create JSON Web Token
 * @param {object} user user data
 * @returns object with user data and JWT
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Username to encode in JWT
    expiresIn: '7d', // JWT expires in 7 days
    algorithm: 'HS256', // Algorithm to sign or encode values of JWT
  });
};

/**
 * Login
 * Endpoint: /login
 * HTTP method: POST
 * @param router
 * @returns {object} user data
 * @requires passport
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        // Create JWT based on the username and password
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
