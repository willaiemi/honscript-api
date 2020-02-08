'use strict';

const bcrypt = require('bcrypt');
const Boom = require('boom');
const User = require('../model/User');
const createUserSchema = require('../schemas/createUser');
const verifyUniqueUser = require('../util/userFunctions').verifyUniqueUser;
const createToken = require('../util/token');
const moment = require('moment');

async function hashPassword(password, cb) {
  // Generate a salt at level 10 strength
  const hash = await new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt).then(function(hash) {
        resolve(hash);
      }).catch(function (err) {
        reject(err);
      });
    });
  });

  return hash;
}

module.exports = {
  method: 'POST',
  path: '/api/users',
  config: {
    // Before the route handler runs, verify that the user is unique
    pre: [
      { 
        method: verifyUniqueUser,
        assign: 'isNotUnique'
      }
    ],
    handler: async function (req, h) {
      if (req.pre.isNotUnique) {
        throw Boom.badRequest(req.pre.isNotUnique);
      }

      let user = new User();
      user.username = req.payload.username;
      user.name = req.payload.name;
      user.email = req.payload.email;
      user.contactNumber = req.payload.contactNumber;
      if (req.payload.paidSubscriptionAt) {
        const paidSubscriptionDate = moment(req.payload.paidSubscriptionAt);
        user.paidSubscriptionAt = paidSubscriptionDate.toISOString();
        user.subscriptionExpireAt = paidSubscriptionDate.add(1, 'month').toISOString();
      }
      user.admin = false;

      try {
        // hash password
        const hash = await hashPassword(req.payload.password);
        user.password = hash;

        // save user
        const savedUser = await user.save();
        const response = h.response({ token: createToken(savedUser) }).code(200);
        response.type('application/json')
        return response;
      } catch (err) {
        throw Boom.badRequest(err);
      }
    },
    // Validate the payload against the Joi schema
    validate: {
      payload: createUserSchema
    }
  }
}