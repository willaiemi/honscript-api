'use strict';

const jwt = require('jsonwebtoken');
const secret = require('../../../config');

function createToken(user) {
  let scopes;
  // Check if user object passed in
  // has admin set to true, and if so, set
  // scopes to admin
  if (user.admin) {
    scopes = 'admin';
  }
  // Sign the JWT
  const token = jwt.sign({
      id: user._id,
      username: user.username, 
      scope: scopes,
      now: new Date(),
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn: '1h'
  });
  return token;
}

module.exports = createToken;