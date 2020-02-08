'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
const mongoose = require('mongoose');
const glob = require('glob');
const path = require('path');
const secret = require('./config');
const https = require('https');

async function validate() {
  return true;
}

async function main() {
  // The connection object takes some
  // configuration, including the port
  const server = new Hapi.Server({
    port: 3000,
    host: 'localhost',
    // routes: {
    //   validate: {
    //     failAction: async function (request, h, err) {
    //       console.error(err);
    //       throw Boom.badRequest(err);
    //     }
    //   }
    // }
  });

  const dbUrl = 'mongodb://localhost:27017/beta';

  await server.register({
    plugin: require('hapi-auth-jwt2'),
  });

  await server.register({
    plugin: require('hapi-require-https'),
  });

  // We're giving the strategy both a name
  // and scheme of 'jwt'
  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validate
  });

  // server.auth.default('jwt');

  // Look through the routes in
  // all the subdirectories of API
  // and create a new route for each
  glob.sync('api/**/routes/*.js', {
    root: __dirname
  }).forEach(file => {
    const route = require(path.join(__dirname, file));
    server.route(route);
  });

  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: false,
    },
    handler: function () {
      return 'Alek.';
    }
  })

  // Start the server
  await server.start().catch((err) => {
    if (err) {
      throw err;
    }
  });

  // Once started, connect to Mongo through Mongoose
  mongoose.connect(dbUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'beta',
    user: 'user',
    pass: 'senha'
  }, (err) => {
    if (err) {
      throw err;
    }
  });

  return server;
};

main().then(server => {
  console.log('Server running at:', server.info.uri);
})
.catch(err => {
  console.log(err);
});