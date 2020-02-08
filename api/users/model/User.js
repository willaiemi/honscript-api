'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userModel = new Schema({
  username: { type: String, required: true, index: { unique: true }},
  name: { type: String, required: true },
  email: { type: String, required: false, index: { unique: true }},
  contactNumber: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, required: true },
  paidSubscriptionAt: { type: Date, required: false },
  subscriptionExpireAt: { type: Date, required: false },
  token: { type: String, required: false },
  tokenExpireAt: { type: Date, required: false },
});

module.exports = mongoose.model('User', userModel);