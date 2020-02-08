'use strict';

const Boom = require('boom');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const moment = require('moment');

async function verifyUniqueUser(req, h) {
  // Find an entry from the database that
  // matches either the email or username
  const validation = await new Promise(function (resolve, reject) {
    User.findOne({
      $or: [
        { email: req.payload.email },
        { username: req.payload.username }
      ]
    }, (err, user) => {
      // Check whether the username or email
      // is already taken and error out if so
      if (user) {
        if (user.username === req.payload.username) {
          resolve('Username taken.')
        }
        if (user.email === req.payload.email) {
          resolve('Email taken.')
        }
      }
      resolve(false);
    });
  })
  // If everything checks out, send the payload through
  // to the route handler
  return validation;
}

async function verifyCredentials(req, h) {
  const password = req.payload.password;

  const result = await new Promise(function (resolve, reject) {
    // Find an entry from the database that
    // matches either the email or username
    User.findOne({
      $or: [
        { email: req.payload.email },
        { username: req.payload.username }
      ]
    }, (err, user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, isValid) => {
          if (isValid) {
            resolve(user);
          }
          else {
            resolve('Senha incorreta. Tente novamente.');
          }
        });
      } else {
        resolve('Usuário incorreto. Tente novamente.');
      }
    });
  });
  if (typeof result === 'string') {
    throw Boom.forbidden(result);
  }
  return result;
}

async function checkSubscription(req, h) {
  const user = req.pre.user;
  if (typeof user === 'string' || user.admin) {
    return h.continue;
  }
  const expirationDate = moment(user.subscriptionExpireAt);
  if (moment().unix() > expirationDate.unix()) {
    throw Boom.forbidden('Seu acesso expirou. Contate o administrador do programa caso isso seja um erro ou você queira renovar seu acesso.');
  }
  return h.continue;
}

async function getUserById(req, h) {
  const user = await new Promise(function (resolve) {
    User.findById(req.payload.id, function (err, user) {
      if (err) resolve('Usuário não encontrado.');
      resolve(user);
    })
  });
  if (typeof user === 'string') {
    throw Boom.notFound(user);
  }
  return user;
}

async function checkToken(req, h) {
  const user = req.pre.user;
  if (user.token !== req.payload.token) {
    throw Boom.forbidden('Seu usuário se logou em outro dispositivo ou programa.');
  }
  if (moment(user.tokenExpireAt) < moment()) {
    throw Boom.forbidden('Seu login expirou. Por favor, tente se logar novamente.');
  }
  return h.continue;
}

module.exports = {
  verifyUniqueUser: verifyUniqueUser,
  verifyCredentials: verifyCredentials,
  checkSubscription: checkSubscription,
  getUserById: getUserById,
  checkToken: checkToken,
}