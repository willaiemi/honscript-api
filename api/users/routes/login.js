'use strict';

const loginSchema = require('../schemas/login');
const verifyCredentials = require('../util/userFunctions').verifyCredentials;
const checkSubscription = require('../util/userFunctions').checkSubscription;
const createToken = require('../util/token');
const moment = require('moment');

module.exports = {
  method: 'POST',
  path: '/api/users/login',
  config: {
    // Check password
    pre: [
      { method: verifyCredentials, assign: 'user' },
      { method: checkSubscription }
    ],
    handler: async function (req, h) {
      const user = req.pre.user;
      const token = createToken(req.pre.user);
      user.token = token;
      user.tokenExpireAt = moment().add(1, 'hour').toISOString();
      await user.save();
      return h.response({ token, id: user._id, date: moment().toISOString() }).code(200);
    },
    validate: {
      payload: loginSchema,
    }
  }
};