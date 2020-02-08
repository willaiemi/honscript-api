'use strict';

const Joi = require('joi');

const refreshTokenSchema = Joi.object({
  id: Joi.string().alphanum(),
  token: Joi.string(),
});

module.exports = refreshTokenSchema;