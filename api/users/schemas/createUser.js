'use strict';

const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  contactNumber: Joi.number().required(),
  paidSubscriptionAt: Joi.string().regex(/^[\d]{4}-[\d]{2}-[\d]{2}$/),
});

module.exports = createUserSchema;