'use strict';

const refreshTokenSchema = require('../schemas/refreshToken');
const checkSubscription = require('../util/userFunctions').checkSubscription;
const getUserById = require('../util/userFunctions').getUserById;
const checkToken = require('../util/userFunctions').checkToken;
const moment = require('moment');

module.exports = {
  method: 'POST',
  path: '/api/users/refresh',
  config: {
    pre: [
      { method: getUserById, assign: 'user' },
      [
        { method: checkToken },
        { method: checkSubscription },
      ]
    ],
    handler: async function (req, h) {
      const user = req.pre.user;
      user.tokenExpireAt = moment().add(1, 'hour').toISOString();
      await user.save();
      return h.response().code(200);
    },
    validate: {
      payload: refreshTokenSchema,
    }
  }
};